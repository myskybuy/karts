import { prisma } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getPhonePeStatus } from "@/lib/phonepe";

type OrderItem = { id: number; name: string; image: string; salePrice: number; qty: number };

/**
 * Checks an order's payment with PhonePe and updates our database.
 * Safe to call many times (return page polling + webhook): the confirmation email goes out once.
 */
export async function syncPhonePeOrder(orderId: number): Promise<"COMPLETED" | "FAILED" | "PENDING" | null> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.paymentMethod !== "PHONEPE" || !order.phonepeOrderId) return null;
  if (order.paymentStatus === "paid") return "COMPLETED";
  if (order.paymentStatus === "failed") return "FAILED";

  const st = await getPhonePeStatus(order.phonepeOrderId);

  if (st.state === "COMPLETED") {
    if (Number(st.amount) !== order.total * 100) {
      console.error(`[phonepe] amount mismatch on order ${order.id}: paid ${st.amount} paise, expected ${order.total * 100}`);
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "review" } });
      return "PENDING";
    }
    const updated = await prisma.order.updateMany({
      where: { id: order.id, paymentStatus: "pending" },
      data: {
        paymentStatus: "paid",
        status: "Confirmed",
        phonepeTxnId: st.paymentDetails?.[0]?.transactionId || null,
      },
    });
    if (updated.count === 1) {
      sendOrderConfirmationEmail({
        id: order.id,
        email: order.email,
        customerName: order.customerName,
        items: order.items as OrderItem[],
        total: order.total,
        paymentMethod: "Online (PhonePe)",
      });
    }
    return "COMPLETED";
  }

  if (st.state === "FAILED") {
    await prisma.order.updateMany({
      where: { id: order.id, paymentStatus: "pending" },
      data: { paymentStatus: "failed", status: "Cancelled" },
    });
    return "FAILED";
  }

  return "PENDING";
}
