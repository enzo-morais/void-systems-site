import Link from "next/link";
import { bots } from "@/config/bots";
import { featuredBotIds } from "@/config/home";
import { BotCard } from "./BotCard";
import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";
import "./hero.css";

/** "Bots avulsos em destaque": usa os mesmos dados do catálogo (src/config/bots.ts). Os combos vêm antes, na home. */
export function FeaturedBots() {
  const featured = featuredBotIds.map((id) => bots.find((b) => b.id === id)).filter((b): b is (typeof bots)[number] => Boolean(b));

  return (
    <section data-scene="2" className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <Reveal>
              <p className="eyebrow-l">Bots avulsos</p>
            </Reveal>
            <KineticTitle as="h2" className="sec-title mt-3" accent="em destaque">
              Bots
            </KineticTitle>
          </div>
          <Reveal>
            <Link href="/bots" className="hero-cta hero-cta--ghost">
              Ver todos os bots
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((bot, i) => (
            <Reveal key={bot.id} delay={i * 120} className="h-full">
              <BotCard bot={bot} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
