import Link from "next/link";
import { Check } from "lucide-react";
import { clients, trust } from "@/config/home";
import { DISCORD_SUPPORT_URL } from "@/config/store";
import { DiscordMockup } from "./DiscordMockup";
import { KineticTitle } from "./KineticTitle";
import "./hero.css";

export function Hero() {
  return (
    <section data-scene="0" className="relative flex items-center min-h-[92vh] pt-32 pb-20 lg:pt-28">
      {/* duas colunas coladas nas margens: texto à esquerda, mockup do Discord à direita */}
      <div className="wrap grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20 items-center">
        <div>
          <KineticTitle
            as="h1"
            className="text-[2.6rem] sm:text-6xl 2xl:text-[5.4rem] font-bold tracking-tight leading-[1.03] text-white"
            accent="de verdade."
          >
            Automatize seu servidor Discord
          </KineticTitle>

          <p className="mt-6 text-base sm:text-lg text-silver max-w-xl leading-relaxed">
            Bots de tickets, registro, verificação e boas-vindas, feitos sob medida e rodando 24h no seu servidor. Você configura em minutos e esquece.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href="/#combos" className="hero-cta hero-cta--primary">
              Ver combos
            </Link>
            <a href={DISCORD_SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="hero-cta hero-cta--ghost">
              Bot personalizado
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-silver">
            {trust.map((item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <Check className="w-4 h-4 text-white" />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-10 text-xs uppercase tracking-[0.18em] text-zinc-500">
            Usado por {clients.slice(0, 3).join(", ")} e outros servidores
          </p>
        </div>

        <DiscordMockup />
      </div>
    </section>
  );
}
