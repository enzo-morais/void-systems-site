import Link from "next/link";
import { bots } from "@/config/bots";
import { featuredBotIds } from "@/config/home";
import { BotCard } from "./BotCard";
import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";
import "./hero.css";

/** "Bots em destaque" (cena da grade): usa os mesmos dados do catálogo (src/config/bots.ts). */
export function FeaturedBots() {
  const featured = featuredBotIds.map((id) => bots.find((b) => b.id === id)).filter((b): b is (typeof bots)[number] => Boolean(b));

  return (
    <section data-scene="2" className="px-6 py-24">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver/80">Destaques</p>
          </Reveal>
          <KineticTitle className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-white" accent="em destaque">
            Bots
          </KineticTitle>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {featured.map((bot, i) => (
            <Reveal key={bot.id} delay={i * 120} className="h-full">
              <BotCard bot={bot} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <Link href="/bots" className="hero-cta hero-cta--primary">
            Ver todos os bots
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
