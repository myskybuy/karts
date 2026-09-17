import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { code, orderTotal } = await req.json();
  const coupon = await prisma.coupon.findFirst({
    where: { code: (code || "").toUpperCase(), active: true },
  });

  if (!coupon) return NextResponse.json({ error: "Invalid or inactive coupon code" }, { status: 404 });
  if (coupon.expiry && coupon.expiry < new Date()) {
    return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
  }
  if (orderTotal < coupon.minOrder) {
    return NextResponse.json({ error: `Minimum order of ₹${coupon.minOrder} required` }, { status: 400 });
  }

  const discount =
    coupon.type === "percent" ? Math.round((orderTotal * coupon.value) / 100) : coupon.value;

  return NextResponse.json({
    success: true,
    code: coupon.code,
    discount,
    type: coupon.type,
    value: coupon.value,
  });
}
