import { LegalDocument } from "@/components/legal/LegalDocument";
import { reembolso } from "@/config/legal";
import { pageMetadata } from "@/config/seo";

export const metadata = pageMetadata("reembolso");

export default function Page() {
  return <LegalDocument doc={reembolso()} />;
}
