import PolicyLayout from "@/components/PolicyLayout";
import { policies } from "@/lib/policies";

export default function PrivacyPolicyPage() {
  return <PolicyLayout policy={policies["privacy-policy"]} />;
}
