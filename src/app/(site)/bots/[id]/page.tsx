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
    <section className="pt-36 pb-24">
      {/* duas colunas encostadas nas margens: texto à esquerda, demonstração à direita */}
      <div className="wrap grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-20">
        <div>
          <Reveal>
            <Link href="/bots" className="font-mono text-xs uppercase tracking-[0.2em] text-silver hover:text-white transition-colors">
              ← Todos os bots
            </Link>
          </Reveal>
          <KineticTitle as="h1" className="mt-5 text-4xl sm:text-6xl 2xl:text-7xl font-bold tracking-tight leading-[1.05] text-white">
            {bot.name}
          </KineticTitle>
          <Reveal delay={150}>
            <p className="mt-5 text-base sm:text-lg text-silver max-w-xl">{bot.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {bot.tags.map((tag) => (
                <span key={tag} className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 rounded text-silver" style={{ border: "1px solid #3f3f46", background: "rgba(10, 10, 10, 0.6)" }}>
                  {tag}
                </span>
              ))}
              {bot.badge && (
                <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 rounded" style={{ background: "rgba(255, 255, 255, 0.08)", color: "#f4f4f5" }}>
                  {bot.badge}
                </span>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal className="w-full max-w-2xl lg:ml-auto">
          <div className="bc">
            <div className="bc-inner">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-silver">O bot em ação</p>
              <BotDemo bot={bot} autoplay />
              <div className="mt-6 flex items-end justify-between gap-4">
                <p className="text-white">
                  <span className={`font-mono ${price.suffix ? "text-3xl font-semibold" : "text-xl font-medium"}`}>{price.main}</span>
                  {price.suffix && <span className="font-mono text-sm text-silver">{price.suffix}</span>}
                </p>
                <HireButton items={[{ name: bot.name, price: bot.price }]} />
              </div>
              <Link href="/bots#bots-avulsos" className="mt-5 block text-sm text-silver hover:text-white transition-colors underline underline-offset-4 decoration-white/30">
                Calcular desconto com outros bots →
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
