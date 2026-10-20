import Link from "next/link";
import { DISCORD_LINK } from "@/config/home";
import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";
import "./hero.css";

export function FinalCta() {
  return (
    <section data-scene="5" className="min-h-[80vh] flex items-end px-6 pb-[10vh] pt-24">
      <div className="max-w-3xl mx-auto w-full text-center">
        <KineticTitle className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-white" accent="trabalhar sozinho.">
          Seu servidor merece
        </KineticTitle>
        <Reveal delay={150}>
          <p className="mt-4 text-base sm:text-lg text-silver/85 max-w-xl mx-auto">
            Escolha um bot, configure em minutos e deixe a VØID cuidar do resto.
          </p>
        </Reveal>
        <Reveal delay={300} className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/bots" className="hero-cta hero-cta--primary">
            Ver bots
          </Link>
          <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer" className="hero-cta hero-cta--ghost">
            Entrar no Discord
          </a>
        </Reveal>
      </div>
    </section>
  );
}
