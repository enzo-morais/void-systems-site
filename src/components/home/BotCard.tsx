"use client";

import Link from "next/link";
import type { PointerEvent } from "react";
import { formatPrice, type Badge, type BotItem } from "@/config/bots";
import "./bot-card.css";

const badgeStyle: Record<Badge, { bg: string; color: string }> = {
  Destaque: { bg: "rgba(168,85,247,0.12)", color: "#c084fc" },
  Popular: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
  Novo: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
};

export function BotCard({ bot }: { bot: BotItem }) {
  const price = formatPrice(bot.price);

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
          <div className="flex flex-wrap gap-1.5">
            {bot.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full text-silver/75"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}
              >
                {tag}
              </span>
            ))}
          </div>
          {bot.badge && (
            <span
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: badgeStyle[bot.badge].bg, color: badgeStyle[bot.badge].color }}
            >
              {bot.badge}
            </span>
          )}
        </div>

        <h3 className="mt-4 text-lg font-semibold text-white leading-snug">{bot.name}</h3>
        <p className="mt-2 text-sm text-silver/75 leading-relaxed">{bot.description}</p>

        {/* mini-animação do que o bot faz: roda ao passar o mouse (sempre, em telas de toque) */}
        <div className="bc-demo" aria-hidden="true">
          <span className="bc-hint">Passe o mouse para ver em ação</span>
          {bot.demo.map((step, i) => (
            <div key={i} className={`bc-step bc-step--${step.kind}`} style={{ ["--i" as string]: i }}>
              {step.kind === "bot" && <span className="bc-av">V</span>}
              {step.kind === "btn" ? <span className="bc-btn">{step.text}</span> : <span className="bc-text">{step.text}</span>}
            </div>
          ))}
        </div>

        <div className="mt-auto pt-5 flex items-end justify-between gap-3">
          <p className="text-white">
            <span className={price.suffix ? "text-xl font-bold" : "text-base font-semibold"}>{price.main}</span>
            {price.suffix && <span className="text-sm text-silver/75">{price.suffix}</span>}
          </p>
          <Link
            href={`/produtos?busca=${encodeURIComponent(bot.search)}`}
            className="text-sm font-medium px-4 py-2 rounded-lg text-black bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-shadow"
          >
            Contratar
          </Link>
        </div>
      </div>
    </article>
  );
}
