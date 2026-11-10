import PhonePeResult from "./PhonePeResult";

// PhonePe sends the customer back here after payment: /checkout/phonepe?order=<id>
export default async function PhonePeReturnPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return <PhonePeResult orderId={Number(order) || 0} />;
}
