import Link from "next/link";
import { DISCORD_LINK } from "@/config/home";
import { DiscordMockup } from "./DiscordMockup";

export function Hero() {
  return (
    <section className="min-h-screen flex items-center px-6 pt-28 pb-16 lg:pt-16">
      <div className="max-w-7xl mx-auto w-full grid gap-14 lg:grid-cols-2 lg:gap-12 items-center">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.08] text-white">
            Automatize seu servidor Discord{" "}
            <span className="text-silver/60">de verdade.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-silver/75 max-w-xl mx-auto lg:mx-0">
            Bots de tickets, vendas, verificação e moderação, feitos sob medida e rodando 24/7 no seu servidor.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link
              href="/produtos"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg font-medium text-black bg-white hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-shadow"
            >
              Ver bots
            </Link>
            <a
              href={DISCORD_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg font-medium text-white hover:bg-white/5 transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.18)" }}
            >
              Bot personalizado
            </a>
          </div>
        </div>

        <DiscordMockup />
      </div>
    </section>
  );
}
