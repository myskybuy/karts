import PolicyLayout from "@/components/PolicyLayout";
import { policies } from "@/lib/policies";

export default function ReturnPolicyPage() {
  return <PolicyLayout policy={policies["return-policy"]} />;
}
