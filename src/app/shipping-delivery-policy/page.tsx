import PolicyLayout from "@/components/PolicyLayout";
import { policies } from "@/lib/policies";

export default function ShippingPolicyPage() {
  return <PolicyLayout policy={policies["shipping-delivery-policy"]} />;
}
