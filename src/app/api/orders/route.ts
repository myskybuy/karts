import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { isValidEmail, isValidPhone, normalizePhone } from "@/lib/password";
import { getRazorpay, isRazorpayConfigured } from "@/lib/razorpay";
import { getSession } from "@/lib/session";

type OrderItem = { id: number; name: string; image: string; salePrice: number; qty: number };

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
      status: body.paymentMethod === "RAZORPAY" ? "Confirmed" : "Pending",
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
    const { items, customerName, phone, address, email, couponCode, discount, paymentMethod } = body;

    if (!items || items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    if (!customerName?.trim() || !phone?.trim() || !address?.trim()) {
      return NextResponse.json({ error: "Customer details incomplete" }, { status: 400 });
    }
    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Please enter a valid 10-digit Indian mobile number" }, { status: 400 });
    }
    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const method = paymentMethod === "RAZORPAY" ? "RAZORPAY" : "COD";

    if (method === "RAZORPAY") {
      if (!isRazorpayConfigured()) {
        return NextResponse.json({ error: "Online payment is not configured yet" }, { status: 503 });
      }

      const subtotal = items.reduce((sum: number, item: OrderItem) => sum + item.salePrice * item.qty, 0);
      const appliedDiscount = discount && discount > 0 ? discount : 0;
      const total = Math.max(0, subtotal - appliedDiscount);

      const razorpay = getRazorpay()!;
      const rpOrder = await razorpay.orders.create({
        amount: total * 100,
        currency: "INR",
        receipt: `msb_${Date.now()}`,
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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
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
  } catch {
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
  } catch {
    return NextResponse.json({ error: "Payment verification failed. Please contact support." }, { status: 500 });
  }
}
