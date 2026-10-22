import { LegalDocument } from "@/components/legal/LegalDocument";
import { privacidade } from "@/config/legal";
import { pageMetadata } from "@/config/seo";

export const metadata = pageMetadata("privacidade");

export default function Page() {
  return <LegalDocument doc={privacidade()} />;
}
