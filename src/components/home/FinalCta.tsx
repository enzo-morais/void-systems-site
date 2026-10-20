import Link from "next/link";
import { DISCORD_LINK } from "@/config/home";
import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <section className="px-6 py-32">
      <div className="max-w-4xl mx-auto text-center">
        <Reveal>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08] text-white">
            Seu servidor merece <span className="text-silver/60">trabalhar sozinho.</span>
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-6 text-lg text-silver/75 max-w-xl mx-auto">
            Escolha um bot, configure em minutos e deixe a VØID cuidar do resto.
          </p>
        </Reveal>
        <Reveal delay={300} className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/produtos"
            className="inline-flex items-center justify-center px-9 py-4 rounded-lg font-medium text-black bg-white hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] transition-shadow"
          >
            Ver bots
          </Link>
          <a
            href={DISCORD_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-9 py-4 rounded-lg font-medium text-white hover:bg-white/5 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.18)" }}
          >
            Entrar no Discord
          </a>
        </Reveal>
      </div>
    </section>
  );
}
