import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entre para a equipe — VØID Systems",
  description: "Candidate-se para vender os combos e bots da VØID Systems: comissão por venda, acesso ao painel e horário flexível.",
  alternates: { canonical: "/equipe" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
