import type { Metadata } from "next";
import { PageHeader } from "@/components/home/PageHeader";
import { CombosSection } from "@/components/home/CombosSection";
import { CatalogSection } from "@/components/home/CatalogSection";
import { CustomBotCta } from "@/components/home/CustomBotCta";

export const metadata: Metadata = {
  title: "Combos e bots para Discord — VØID Systems",
  description: "Os 4 combos da VØID (Simples, Community, DayZ e Server Games) e o catálogo de bots avulsos: ticket, registro, verificação, boas-vindas e mais.",
};

export default function BotsPage() {
  return (
    <>
      <PageHeader
        scene={2}
        eyebrow="Loja"
        title="Combos e bots"
        accent="para o seu servidor"
        lead="Escolha um dos 4 combos ou monte o seu com bots avulsos. O pagamento é feito via Pix pelo nosso Discord, com atendimento direto da equipe."
      />
      <CombosSection compare />
      <CatalogSection />
      <CustomBotCta scene={2} />
    </>
  );
}
