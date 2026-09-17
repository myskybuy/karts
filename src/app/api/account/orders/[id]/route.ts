import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const CANCELLABLE = new Set(["Pending", "Confirmed"]);

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Please log in first" }, { status: 401 });

  const id = parseInt((await params).id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid order" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.userId !== session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  if (!CANCELLABLE.has(order.status)) {
    return NextResponse.json({ error: "Cannot cancel after dispatch" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "Cancelled" },
  });
  return NextResponse.json(updated);
}
