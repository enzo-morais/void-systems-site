import type { Metadata } from "next";
import { PageHeader } from "@/components/home/PageHeader";
import { FaqSection } from "@/components/home/FaqSection";
import { JoinCta } from "@/components/home/JoinCta";

export const metadata: Metadata = {
  title: "Perguntas frequentes — VØID Systems",
  description: "Pagamento, prazos, hospedagem, bots personalizados e outras dúvidas sobre os bots da VØID Systems.",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        scene={4}
        eyebrow="Dúvidas"
        title="Perguntas"
        accent="frequentes"
        lead="Tudo o que costumam perguntar antes de contratar um bot."
      />
      <FaqSection scene={4} />
      <JoinCta
        scene={4}
        title="Não achou a sua resposta?"
        text="Chame a gente no Discord. Respondemos por lá."
        button="Abrir o Discord"
      />
    </>
  );
}
