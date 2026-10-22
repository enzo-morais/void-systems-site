import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar — VØID Systems",
  description: "Entre na sua conta da VØID Systems com Discord ou e-mail.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
