"use client";

import { useEffect, useState } from "react";
import { Percent, ShoppingCart, X } from "lucide-react";
import { bots, brl, discountTiers, getDiscountPct } from "@/config/bots";
import { BotCard } from "./BotCard";
import { HireButton } from "./HireButton";
import { Reveal } from "./Reveal";
import "./hero.css";
import "./calculator.css";

const filters = ["Todos", "Discord", "DayZ"];

export function CatalogSection() {
  const [filter, setFilter] = useState("Todos");
  const [cart, setCart] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const shown = bots.filter((b) => filter === "Todos" || b.tags.includes(filter));
  const items = cart.map((id) => bots.find((b) => b.id === id)).filter((b): b is (typeof bots)[number] => Boolean(b));
  const priced = items.filter((b) => b.price !== null && b.price > 0);
  const hasQuote = items.some((b) => b.price === null || b.price <= 0);
  const subtotal = priced.reduce((sum, b) => sum + (b.price ?? 0), 0);
  const pct = getDiscountPct(priced.length);
  const discount = (subtotal * pct) / 100;
  const total = subtotal - discount;
  const nextTier = [...discountTiers].reverse().find((t) => priced.length < t.min);

  const toggle = (id: string) => setCart((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Esc fecha a gaveta; enquanto ela está aberta o <html> recebe data-cart-open e o resto do site
  // desliza para a esquerda (o CSS está em calculator.css)
  useEffect(() => {
    document.documentElement.dataset.cartOpen = String(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => {
    delete document.documentElement.dataset.cartOpen;
  }, []);

  return (
    <section data-scene="2" className="px-6 pb-16 pt-4">
      <div className="max-w-7xl mx-auto">
        <Reveal className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-silver/90">
          {discountTiers
            .slice()
            .reverse()
            .map((t) => (
              <span key={t.min} className="inline-flex items-center gap-2 font-mono text-xs">
                <Percent className="w-3.5 h-3.5 text-[var(--void-accent)]" />
                {t.min === 4 ? "4+ bots" : `${t.min} bots`} → <b className="text-white">{t.pct}% OFF</b>
              </span>
            ))}
        </Reveal>

        <Reveal className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-full cursor-pointer transition-colors ${
                filter === f ? "bg-white text-black" : "text-silver/90 hover:text-white"
              }`}
              style={filter === f ? undefined : { border: "1px solid rgba(255,255,255,0.2)", background: "rgba(13,13,18,0.85)" }}
            >
              {f}
            </button>
          ))}
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((bot, i) => (
            <Reveal key={bot.id} delay={(i % 3) * 100} className="h-full">
              <BotCard bot={bot} inCart={cart.includes(bot.id)} onToggle={() => toggle(bot.id)} />
            </Reveal>
          ))}
        </div>
      </div>

      {/* botão flutuante da calculadora */}
      {cart.length > 0 && !open && (
        <button type="button" onClick={() => setOpen(true)} className="calc-fab" aria-label="Abrir calculadora">
          <ShoppingCart className="w-4 h-4" />
          <span>{cart.length}</span>
          {pct > 0 && <span className="calc-fab-off">-{pct}%</span>}
        </button>
      )}

      {/* gaveta lateral: ocupa a borda direita inteira, sem escurecer a página */}
      <aside className={`calc-drawer ${open ? "calc-drawer--open" : ""}`} aria-label="Calculadora de desconto" aria-hidden={!open} inert={!open}>
        <div className="calc-head">
          <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Calculadora
          </h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Fechar calculadora" className="calc-x">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="calc-list">
          {items.length === 0 && <p className="calc-empty">Adicione bots nos cards para calcular o total e o desconto.</p>}
          {items.map((b) => (
            <div key={b.id} className="calc-row">
              <div>
                <p className="text-sm font-medium text-white">{b.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-silver/70">{b.price ? "Mensal" : "Sob orçamento"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-white">{b.price ? brl(b.price) : "A combinar"}</span>
                <button type="button" onClick={() => toggle(b.id)} aria-label={`Remover ${b.name}`} className="calc-x calc-x--red">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="calc-foot">
          <div className="calc-line">
            <span>Subtotal</span>
            <span className="font-mono">{brl(subtotal)}</span>
          </div>
          {pct > 0 && (
            <div className="calc-line text-green-400">
              <span>
                Desconto ({pct}% em {priced.length} bots)
              </span>
              <span className="font-mono">-{brl(discount)}</span>
            </div>
          )}
          <div className="calc-line calc-total">
            <span>Total por mês</span>
            <span className="font-mono text-green-400">{brl(total)}</span>
          </div>
          {nextTier && priced.length > 0 && (
            <p className="calc-hint">
              Adicione mais {nextTier.min - priced.length} bot{nextTier.min - priced.length > 1 ? "s" : ""} e ganhe {nextTier.pct}% de desconto.
            </p>
          )}
          {hasQuote && <p className="calc-hint">O bot personalizado é orçado à parte e não entra no total.</p>}

{items.length > 0 ? (
            <HireButton items={items.map((b) => ({ name: b.name, price: b.price }))} className="hero-cta hero-cta--primary calc-cta" />
          ) : null}
          <button type="button" onClick={() => setCart([])} className="calc-clear">
            Limpar carrinho
          </button>
        </div>
      </aside>
    </section>
  );
}
