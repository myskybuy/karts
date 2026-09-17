import PolicyLayout from "@/components/PolicyLayout";
import { policies } from "@/lib/policies";

export default function CancellationPolicyPage() {
  return <PolicyLayout policy={policies["cancellation-policy"]} />;
}
