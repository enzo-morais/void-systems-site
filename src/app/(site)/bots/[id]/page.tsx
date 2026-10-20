import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bots, formatPrice } from "@/config/bots";
import { KineticTitle } from "@/components/home/KineticTitle";
import { Reveal } from "@/components/home/Reveal";
import { HireButton } from "@/components/home/HireButton";
import { BotDemo } from "@/components/home/BotDemo";
import "@/components/home/bot-card.css";
import "@/components/home/hero.css";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return bots.map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bot = bots.find((b) => b.id === id);
  if (!bot) return {};
  return {
    title: `${bot.name} — VØID Systems`,
    description: bot.description,
  };
}

export default async function BotDetailPage({ params }: Props) {
  const { id } = await params;
  const bot = bots.find((b) => b.id === id);
  if (!bot) notFound();
  const price = formatPrice(bot.price);

  return (
    <section className="min-h-[135vh] px-6 pt-28 pb-20 flex flex-col justify-between gap-16">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <Link href="/bots" className="font-mono text-xs uppercase tracking-[0.2em] text-silver/85 hover:text-white transition-colors">
            ← Todos os bots
          </Link>
        </Reveal>
        <KineticTitle as="h1" className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight leading-[1.06] text-white">
          {bot.name}
        </KineticTitle>
        <Reveal delay={150}>
          <p className="mt-5 text-base sm:text-lg text-silver/85 max-w-xl mx-auto">{bot.description}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {bot.tags.map((tag) => (
              <span key={tag} className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 rounded text-silver/90" style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(13,13,18,0.85)" }}>
                {tag}
              </span>
            ))}
            {bot.badge && (
              <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 rounded" style={{ background: "rgba(143,125,255,0.2)", color: "#d4ccff" }}>
                {bot.badge}
              </span>
            )}
          </div>
        </Reveal>
      </div>

      <Reveal className="max-w-xl mx-auto w-full">
        <div className="bc">
          <div className="bc-inner">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-silver/80">O bot em ação</p>
            <BotDemo bot={bot} autoplay />
            <div className="mt-6 flex items-end justify-between gap-4">
              <p className="text-white">
                <span className={`font-mono ${price.suffix ? "text-3xl font-semibold" : "text-xl font-medium"}`}>{price.main}</span>
                {price.suffix && <span className="font-mono text-sm text-silver/80">{price.suffix}</span>}
              </p>
              <HireButton items={[{ name: bot.name, price: bot.price }]} />
            </div>
            <Link href="/bots" className="mt-5 block text-center text-sm text-silver/85 hover:text-white transition-colors underline underline-offset-4 decoration-white/30">
              Calcular desconto com outros bots →
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
