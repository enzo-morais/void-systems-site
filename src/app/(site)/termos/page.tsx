import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { termos } from "@/config/legal";

const doc = termos();

export const metadata: Metadata = {
  title: `${doc.title} — VØID Systems`,
  description: doc.description,
  alternates: { canonical: "/termos" },
};

export default function Page() {
  return <LegalDocument doc={doc} />;
}
