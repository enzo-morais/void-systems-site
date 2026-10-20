import type { Metadata } from "next";
import { PageHeader } from "@/components/home/PageHeader";
import { CatalogSection } from "@/components/home/CatalogSection";
import { CustomBotCta } from "@/components/home/CustomBotCta";

export const metadata: Metadata = {
  title: "Bots para Discord — VØID Systems",
  description: "Catálogo de bots para Discord: ticket, registro, verificação, boas-vindas, anúncio, bate-ponto e bots personalizados.",
};

export default function BotsPage() {
  return (
    <>
      <PageHeader
        scene={2}
        eyebrow="Catálogo"
        title="Escolha o bot"
        accent="do seu servidor"
        lead="Planos mensais, sem fidelidade. Adicione mais de um bot e a calculadora aplica o desconto na hora."
        className="min-h-[52vh]"
      />
      <CatalogSection />
      <CustomBotCta scene={2} />
    </>
  );
}
