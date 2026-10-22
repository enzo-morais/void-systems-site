import { DISCORD_STORE_URL } from "@/config/store";
import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";
import "./hero.css";

export function CustomBotCta({ scene = 2 }: { scene?: number }) {
  return (
    <section data-scene={scene} className="sec-tight">
      <Reveal className="wrap">
        <div className="panel flex flex-col gap-8 px-6 py-12 sm:px-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow-l">Bot personalizado</p>
            <KineticTitle as="h2" className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white" accent="no catálogo?">
              Precisa de algo que não existe
            </KineticTitle>
            <p className="mt-4 text-silver max-w-xl">
              Contamos o que o seu servidor precisa e montamos um bot sob medida. Peça um orçamento, sem compromisso.
            </p>
          </div>
          <a href={DISCORD_STORE_URL} target="_blank" rel="noopener noreferrer" className="hero-cta hero-cta--primary shrink-0">
            Pedir orçamento no Discord
          </a>
        </div>
      </Reveal>
    </section>
  );
}
