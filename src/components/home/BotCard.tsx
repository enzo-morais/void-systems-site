"use client";

import Link from "next/link";
import type { PointerEvent } from "react";
import { Calculator, Check, Activity, ClipboardList, Clock, Megaphone, ShieldCheck, Sparkles, Swords, Ticket, UserPlus, type LucideIcon } from "lucide-react";
import { formatPrice, type Badge, type BotIcon, type BotItem } from "@/config/bots";
import { BotDemo } from "./BotDemo";
import { HireButton } from "./HireButton";
import "./bot-card.css";

const icons: Record<BotIcon, LucideIcon> = {
  ticket: Ticket,
  welcome: UserPlus,
  register: ClipboardList,
  clan: Swords,
  status: Activity,
  announce: Megaphone,
  clock: Clock,
  shield: ShieldCheck,
  custom: Sparkles,
};

const badgeStyle: Record<Badge, { bg: string; color: string }> = {
  Destaque: { bg: "#ffffff", color: "#000000" },
  Popular: { bg: "rgba(255,255,255,0.12)", color: "#ffffff" },
  Novo: { bg: "transparent", color: "#d4d4d8" },
};

export function BotCard({ bot, inCart = false, onToggle }: { bot: BotItem; inCart?: boolean; onToggle?: () => void }) {
  const price = formatPrice(bot.price);
  const Icon = icons[bot.icon];

  // posição do cursor dentro do card, usada pelo brilho da borda
  function onMove(e: PointerEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    <article className="bc" onPointerMove={onMove}>
      <div className="bc-inner">
        <div className="flex items-start justify-between gap-3">
          <span className="bc-icon">
            <Icon className="w-5 h-5" />
          </span>
          {bot.badge && (
            <span
              className="font-mono text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full shrink-0"
              style={{ backgroundColor: badgeStyle[bot.badge].bg, color: badgeStyle[bot.badge].color }}
            >
              {bot.badge}
            </span>
          )}
        </div>

        <h3 className="mt-5 text-xl font-semibold text-white leading-snug">
          <Link href={`/bots/${bot.id}`} className="hover:underline underline-offset-4 decoration-white/40">
            {bot.name}
          </Link>
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {bot.tags.map((tag) => (
            <span key={tag} className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded text-silver/85" style={{ border: "1px solid rgba(255,255,255,0.16)" }}>
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-silver/85 leading-relaxed">{bot.description}</p>

        {/* demonstração: parada com convite; roda ao passar o mouse */}
        <BotDemo bot={bot} />

        <div className="mt-auto pt-5 flex flex-wrap items-end justify-between gap-3">
          <p className="text-white">
            <span className={`font-mono ${price.suffix ? "text-xl font-semibold" : "text-base font-medium"}`}>{price.main}</span>
            {price.suffix && <span className="font-mono text-sm text-silver/80">{price.suffix}</span>}
          </p>
          {onToggle ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggle}
                aria-pressed={inCart}
                aria-label={inCart ? "Remover da calculadora de desconto" : "Adicionar à calculadora de desconto"}
                title={inCart ? "Remover da calculadora de desconto" : "Adicionar à calculadora de desconto"}
                className={`bc-calc ${inCart ? "bc-calc--on" : ""}`}
              >
                {inCart ? <Check className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
              </button>
              <HireButton items={[{ name: bot.name, price: bot.price }]} className="bc-buy" />
            </div>
          ) : (
            <Link href={`/bots/${bot.id}`} className="bc-buy">
              Ver detalhes
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
