import Link from "next/link";
import { DISCORD_INVITE_URL } from "@/config/store";
import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";
import "./hero.css";

export function FinalCta() {
  return (
    <section data-scene="5" className="sec">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end lg:gap-16 pt-14" style={{ borderTop: "1px solid #27272a" }}>
          <div>
            <KineticTitle as="h2" className="text-4xl sm:text-6xl 2xl:text-7xl font-bold tracking-tight leading-[1.05] text-white" accent="trabalhar sozinho.">
              Seu servidor merece
            </KineticTitle>
            <Reveal delay={150}>
              <p className="sec-lead mt-5">Escolha um combo, configure em minutos e deixe a VØID cuidar do resto.</p>
            </Reveal>
          </div>
          <Reveal delay={250} className="flex flex-col sm:flex-row lg:justify-end gap-3">
            <Link href="/#combos" className="hero-cta hero-cta--primary">
              Ver combos
            </Link>
            <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="hero-cta hero-cta--ghost">
              Entrar no Discord
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
