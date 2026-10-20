import { DISCORD_STORE_URL } from "@/config/store";
import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";
import "./hero.css";

export function CustomBotCta({ scene = 2 }: { scene?: number }) {
  return (
    <section data-scene={scene} className="px-6 py-16">
      <Reveal className="max-w-5xl mx-auto">
        <div
          className="relative overflow-hidden rounded-3xl px-6 py-14 sm:px-14 text-center"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(143,125,255,0.22), #0d0d12 70%)",
            border: "1px solid rgba(143,125,255,0.35)",
          }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver/75">Bot personalizado</p>
          <KineticTitle className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white" accent="no catálogo?">
            Precisa de algo que não existe
          </KineticTitle>
          <p className="mt-4 text-silver/75 max-w-xl mx-auto">
            Contamos o que o seu servidor precisa e montamos um bot sob medida. Peça um orçamento, sem compromisso.
          </p>
          <a
            href={DISCORD_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta hero-cta--primary mt-8"
          >
            Pedir orçamento no Discord
          </a>
        </div>
      </Reveal>
    </section>
  );
}
