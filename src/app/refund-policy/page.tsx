import PolicyLayout from "@/components/PolicyLayout";
import { policies } from "@/lib/policies";

export default function RefundPolicyPage() {
  return <PolicyLayout policy={policies["refund-policy"]} />;
}
