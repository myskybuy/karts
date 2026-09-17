import PolicyLayout from "@/components/PolicyLayout";
import { policies } from "@/lib/policies";

export default function TermsPage() {
  return <PolicyLayout policy={policies["terms-of-use"]} />;
}
