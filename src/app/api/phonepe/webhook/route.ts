import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPhonePeWebhookAuth } from "@/lib/phonepe";
import { syncPhonePeOrder } from "@/lib/phonepe-orders";

// PhonePe server-to-server callback. Confirms orders even if the customer closes the browser after paying.
// The payload is only used to find the order; its state is always re-checked with PhonePe's status API.
export async function POST(req: NextRequest) {
  if (!verifyPhonePeWebhookAuth(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { payload?: { merchantOrderId?: string; originalMerchantOrderId?: string } } | null;
  const merchantOrderId = body?.payload?.merchantOrderId || body?.payload?.originalMerchantOrderId;
  if (!merchantOrderId) return NextResponse.json({ ok: true });

  const order = await prisma.order.findFirst({ where: { phonepeOrderId: merchantOrderId }, select: { id: true } });
  if (!order) return NextResponse.json({ ok: true });

  try {
    await syncPhonePeOrder(order.id);
  } catch (err) {
    console.error("[phonepe] webhook sync failed:", err);
    return NextResponse.json({ error: "Retry later" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
