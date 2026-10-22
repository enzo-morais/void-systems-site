import { LegalDocument } from "@/components/legal/LegalDocument";
import { termos } from "@/config/legal";
import { pageMetadata } from "@/config/seo";

export const metadata = pageMetadata("termos");

export default function Page() {
  return <LegalDocument doc={termos()} />;
}
