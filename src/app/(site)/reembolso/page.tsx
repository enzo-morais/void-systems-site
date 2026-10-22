import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { reembolso } from "@/config/legal";

const doc = reembolso();

export const metadata: Metadata = {
  title: `${doc.title} — VØID Systems`,
  description: doc.description,
  alternates: { canonical: "/reembolso" },
};

export default function Page() {
  return <LegalDocument doc={doc} />;
}
