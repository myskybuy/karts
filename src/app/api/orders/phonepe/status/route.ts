import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncPhonePeOrder } from "@/lib/phonepe-orders";
import { getSession } from "@/lib/session";

// Called by /checkout/phonepe after PhonePe sends the customer back.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const orderId = Number(req.nextUrl.searchParams.get("order"));
  if (!orderId) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true, total: true } });
  if (!order || order.userId !== session.userId) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  try {
    const state = await syncPhonePeOrder(orderId);
    if (!state) return NextResponse.json({ error: "Not a PhonePe order" }, { status: 400 });
    return NextResponse.json({ state, orderId, total: order.total });
  } catch (err) {
    console.error("[phonepe] status check failed:", err);
    return NextResponse.json({ state: "PENDING", orderId, total: order.total });
  }
}
