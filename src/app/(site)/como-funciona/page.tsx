import type { Metadata } from "next";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ReasonsSection } from "@/components/home/ReasonsSection";

export const metadata: Metadata = {
  title: "Como funciona — VØID Systems",
  description: "Do pedido ao bot rodando em 3 passos, e por que escolher a VØID para o seu servidor de Discord.",
};

export default function ComoFuncionaPage() {
  return (
    <>
      <HowItWorks />
      <ReasonsSection />
    </>
  );
}
