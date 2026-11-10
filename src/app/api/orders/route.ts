import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isHiddenCategory } from "@/lib/hidden-categories";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { isValidEmail, isValidPhone, normalizePhone } from "@/lib/password";
import { formatDeliveryAddress, validateDeliveryAddress } from "@/lib/india-states";
import { COMPANY } from "@/lib/policies";
import { RAZORPAY_VISIBLE } from "@/lib/payment-options";
import { createPhonePePayment, isPhonePeConfigured } from "@/lib/phonepe";
import { getRazorpay, isRazorpayConfigured } from "@/lib/razorpay";
import { getSession } from "@/lib/session";

type OrderItem = { id: number; name: string; image: string; salePrice: number; qty: number };

/** Rebuilds cart lines from the database so the browser cannot change prices. */
async function priceFromDb(raw: OrderItem[]) {
  const ids = raw.map((i) => Number(i.id));
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, image: true, salePrice: true, category: true },
  });
  const byId = new Map(products.filter((p) => !isHiddenCategory(p.category)).map((p) => [p.id, p]));
  if (!ids.every((id) => byId.has(id))) return null;
  return raw.map((i) => {
    const p = byId.get(Number(i.id))!;
    const qty = Math.min(99, Math.max(1, Math.floor(Number(i.qty) || 1)));
    return { id: p.id, name: p.name, image: p.image, salePrice: p.salePrice, qty };
  });
}

/** Same rules as /api/coupons/validate, applied on the server. */
async function couponDiscount(code: string | undefined, subtotal: number) {
  if (!code) return { code: "", discount: 0 };
  const coupon = await prisma.coupon.findFirst({ where: { code: code.toUpperCase(), active: true } });
  if (!coupon || (coupon.expiry && coupon.expiry < new Date()) || subtotal < coupon.minOrder) return { code: "", discount: 0 };
  const discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return { code: coupon.code, discount: Math.min(discount, subtotal) };
}

function siteUrl(req: NextRequest) {
  const fromEnv = process.env.SITE_URL?.replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host;
  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "");
  return `${proto}://${host}`;
}

async function createOrderRecord(
  body: {
    items: OrderItem[];
    customerName: string;
    phone: string;
    address: string;
    email?: string;
    couponCode?: string;
    discount?: number;
    paymentMethod: string;
    paymentStatus?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  },
  userId: number
) {
  const subtotal = body.items.reduce((sum, item) => sum + item.salePrice * item.qty, 0);
  const appliedDiscount = body.discount && body.discount > 0 ? body.discount : 0;
  const total = Math.max(0, subtotal - appliedDiscount);

  return prisma.order.create({
    data: {
      userId,
      items: body.items,
      customerName: body.customerName.trim(),
      phone: normalizePhone(body.phone),
      address: body.address.trim(),
      email: (body.email || "").trim().toLowerCase(),
      subtotal,
      couponCode: body.couponCode || "",
      discount: appliedDiscount,
      total,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus || "pending",
      razorpayOrderId: body.razorpayOrderId || null,
      razorpayPaymentId: body.razorpayPaymentId || null,
      status: "Pending",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Please log in to place an order" }, { status: 401 });
    }

    const body = await req.json();
    const { customerName, phone, email, paymentMethod, deliveryAddress } = body;

    if (!Array.isArray(body.items) || body.items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    const items = await priceFromDb(body.items as OrderItem[]);
    if (!items) {
      return NextResponse.json({ error: "Some items in your cart are no longer available" }, { status: 400 });
    }
    const subtotal = items.reduce((sum, item) => sum + item.salePrice * item.qty, 0);
    const { code: couponCode, discount } = await couponDiscount(body.couponCode, subtotal);
    if (!customerName?.trim() || !phone?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Customer details incomplete" }, { status: 400 });
    }
    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Please enter a valid 10-digit Indian mobile number" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    const addressError = validateDeliveryAddress(deliveryAddress || {});
    if (addressError) {
      return NextResponse.json({ error: addressError }, { status: 400 });
    }
    const address = formatDeliveryAddress({ landmark: "", ...deliveryAddress });

    const method = paymentMethod === "PHONEPE" ? "PHONEPE" : paymentMethod === "RAZORPAY" ? "RAZORPAY" : "COD";
    const total = Math.max(0, subtotal - discount);

    if (method === "PHONEPE") {
      if (!isPhonePeConfigured()) {
        return NextResponse.json({ error: "Online payment is not configured yet" }, { status: 503 });
      }
      if (total < 1) {
        return NextResponse.json({ error: "Order total is too low for online payment" }, { status: 400 });
      }

      const pending = await createOrderRecord(
        { items, customerName, phone, address, email, couponCode, discount, paymentMethod: "PHONEPE", paymentStatus: "pending" },
        session.userId
      );
      const merchantOrderId = `KARTS_${pending.id}_${Date.now()}`;
      await prisma.order.update({ where: { id: pending.id }, data: { phonepeOrderId: merchantOrderId } });

      try {
        const pay = await createPhonePePayment({
          merchantOrderId,
          amountRupees: total,
          orderId: pending.id,
          redirectUrl: `${siteUrl(req)}/checkout/phonepe?order=${pending.id}`,
        });
        return NextResponse.json({ success: true, orderId: pending.id, redirectUrl: pay.redirectUrl });
      } catch (err) {
        console.error("[orders] PhonePe payment start failed:", err);
        await prisma.order.update({ where: { id: pending.id }, data: { paymentStatus: "failed", status: "Cancelled" } });
        return NextResponse.json({ error: "Could not start PhonePe payment. Please try again." }, { status: 502 });
      }
    }

    if (method === "RAZORPAY") {
      if (!RAZORPAY_VISIBLE || !isRazorpayConfigured()) {
        return NextResponse.json({ error: "Online payment is not configured yet" }, { status: 503 });
      }

      const razorpay = getRazorpay()!;
      const rpOrder = await razorpay.orders.create({
        amount: total * 100,
        currency: "INR",
        receipt: `karts_${Date.now()}`,
        notes: { merchant: COMPANY.name },
      });

      const pending = await createOrderRecord(
        {
          items,
          customerName,
          phone,
          address,
          email,
          couponCode,
          discount,
          paymentMethod: "RAZORPAY",
          paymentStatus: "pending",
          razorpayOrderId: rpOrder.id,
        },
        session.userId
      );

      return NextResponse.json({
        success: true,
        orderId: pending.id,
        razorpayOrderId: rpOrder.id,
        amount: total,
        key: process.env.RAZORPAY_KEY_ID,
      });
    }

    const order = await createOrderRecord(
      {
        items,
        customerName,
        phone,
        address,
        email,
        couponCode,
        discount,
        paymentMethod: "COD",
        paymentStatus: "pending",
      },
      session.userId
    );

    sendOrderConfirmationEmail({
      id: order.id,
      email: order.email,
      customerName: order.customerName,
      items: items as OrderItem[],
      total: order.total,
      paymentMethod: "Cash on Delivery",
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("[orders] place order failed:", err);
    return NextResponse.json({ error: "Unable to place order. Please try again." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Please log in to complete payment" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Payment verification data incomplete" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expected !== razorpaySignature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "paid",
        razorpayPaymentId,
        status: "Confirmed",
      },
    });

    sendOrderConfirmationEmail({
      id: updated.id,
      email: updated.email,
      customerName: updated.customerName,
      items: updated.items as OrderItem[],
      total: updated.total,
      paymentMethod: "Online (Razorpay)",
    });

    return NextResponse.json({ success: true, orderId: updated.id });
  } catch (err) {
    console.error("[orders] payment verification failed:", err);
    return NextResponse.json({ error: "Payment verification failed. Please contact support." }, { status: 500 });
  }
}
