import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meu perfil — VØID Systems",
  description: "Sua conta e os seus bots na VØID Systems.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
