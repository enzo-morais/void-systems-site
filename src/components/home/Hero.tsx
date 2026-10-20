import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { clients, DISCORD_LINK, trust } from "@/config/home";
import { DiscordMockup } from "./DiscordMockup";
import { KineticTitle } from "./KineticTitle";
import "./hero.css";

export function Hero() {
  return (
    <section data-scene="0" className="relative min-h-screen flex items-center px-6 pt-28 pb-20 lg:pt-20">
      <div className="max-w-7xl mx-auto w-full grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10 items-center">
        <div className="text-center lg:text-left">
          <KineticTitle
            as="h1"
            className="text-[2.5rem] sm:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.04] text-white"
            accent="de verdade."
          >
            Automatize seu servidor Discord
          </KineticTitle>

          <p className="mt-6 text-base sm:text-lg text-silver/85 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Bots de tickets, registro, verificação e boas-vindas, feitos sob medida e rodando 24h no seu servidor. Você configura em minutos e esquece.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link href="/bots" className="hero-cta hero-cta--primary">
              Ver bots
            </Link>
            <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer" className="hero-cta hero-cta--ghost">
              Bot personalizado
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-silver/85">
            {trust.map((item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--void-accent)]" />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-xs uppercase tracking-[0.18em] text-silver/70">
            Usado por {clients.slice(0, 3).join(", ")} e outros servidores
          </p>
        </div>

        <DiscordMockup />
      </div>

      <div className="hero-scroll" aria-hidden="true">
        <ChevronDown className="w-5 h-5" />
      </div>
    </section>
  );
}
