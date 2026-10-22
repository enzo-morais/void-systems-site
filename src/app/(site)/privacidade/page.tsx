import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { privacidade } from "@/config/legal";

const doc = privacidade();

export const metadata: Metadata = {
  title: `${doc.title} — VØID Systems`,
  description: doc.description,
  alternates: { canonical: "/privacidade" },
};

export default function Page() {
  return <LegalDocument doc={doc} />;
}
