import { VoidBackgroundClient } from "@/components/void/VoidBackgroundClient";
import { SmoothScroll } from "@/components/void/SmoothScroll";
import { Header } from "@/components/landing/header";

const sections = [
  "Seção 1 — Entrando no vazio",
  "Seção 2 — Mais fundo",
  "Seção 3 — Sem volta",
  "Seção 4 — Quase lá",
  "Seção 5 — O centro do portal",
];

export default function Home() {
  return (
    <>
      <VoidBackgroundClient />
      <SmoothScroll />
      <Header />

      <main className="relative z-10">
        {sections.map((title) => (
          <section key={title} className="min-h-screen flex items-center justify-center px-6">
            <div className="text-center max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-semibold text-white">{title}</h2>
              <p className="mt-4 text-silver/50">Conteúdo provisório para testar o scroll.</p>
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
