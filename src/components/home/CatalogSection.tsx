import Link from "next/link";
import { bots } from "@/config/bots";
import { BotCard } from "./BotCard";
import { Reveal } from "./Reveal";

export function CatalogSection() {
  return (
    <section id="bots" className="px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-silver/75">Catálogo</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">Escolha o bot do seu servidor</h2>
          <p className="mt-4 text-silver/75">
            Planos mensais, sem fidelidade. Veja cada bot em ação direto no card.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot, i) => (
            <Reveal key={bot.id} delay={(i % 3) * 100} className="h-full">
              <BotCard bot={bot} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <Link href="/produtos" className="text-sm text-silver/75 hover:text-white transition-colors">
            Ver catálogo completo e calcular desconto →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
