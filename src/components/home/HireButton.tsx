"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Check, Copy, ExternalLink, X } from "lucide-react";
import { formatPrice } from "@/config/bots";
import { DISCORD_STORE_URL } from "@/config/store";
import { DISCORD_DISCLAIMER, POLICY } from "@/config/legal";
import "./hero.css";
import "./hire-modal.css";

export interface HireItem {
  name: string;
  /** Preço por mês em reais; null = sob orçamento. */
  price: number | null;
}

function priceText(price: number | null) {
  const p = formatPrice(price);
  return p.suffix ? `${p.main}${p.suffix}` : "sob orçamento";
}

/** Instrução mostrada no modal: o que fazer no Discord. */
export function hireInstruction(items: HireItem[]): string {
  const list = items.map((i) => `${i.name} – ${priceText(i.price)}`).join("; ");
  return `Abra um ticket no nosso Discord e diga qual bot ou combo você quer: ${list}`;
}

/** Mensagem que o cliente copia e cola no ticket do Discord (só o que ele vai mandar). */
export function hireMessage(items: HireItem[]): string {
  const quote = (i: HireItem) => (i.price === null || i.price <= 0 ? `${i.name} (sob orçamento)` : `${i.name} (${priceText(i.price)})`);
  if (items.length === 1) {
    const [i] = items;
    return i.price === null || i.price <= 0
      ? `Olá! Gostaria de pedir um orçamento para o ${i.name}.`
      : `Olá! Gostaria de contratar o ${i.name} (${priceText(i.price)}).`;
  }
  return `Olá! Gostaria de contratar os seguintes bots: ${items.map(quote).join(", ")}.`;
}

interface HireButtonProps {
  items: HireItem[];
  label?: string;
  className?: string;
}

/**
 * "Contratar pelo Discord": abre um modal com a mensagem pronta (com botão de copiar)
 * e o botão que leva ao Discord da loja em nova aba. Não existe pagamento no site.
 */
export function HireButton({ items, label = "Contratar pelo Discord", className = "hero-cta hero-cta--primary" }: HireButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const message = hireMessage(items);
  const instruction = hireInstruction(items);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      // navegadores sem a API de área de transferência: seleciona e copia pelo método antigo
      const ta = document.createElement("textarea");
      ta.value = message;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </button>

      {open &&
        createPortal(
          <div className="hm-overlay" onClick={() => setOpen(false)}>
            <div className="hm-dialog panel" role="dialog" aria-modal="true" aria-labelledby="hm-title" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="hm-x">
                <X className="w-5 h-5" />
              </button>
              <h2 id="hm-title" className="font-display text-xl font-semibold text-white">Contratar pelo Discord</h2>
              <p className="mt-2 text-sm text-silver/85">{instruction}</p>
              <p className="mt-4 text-xs font-mono uppercase tracking-wider text-silver/75">Mensagem para copiar e enviar no ticket</p>

              <p className="hm-message">{message}</p>

              <div className="hm-actions">
                <button type="button" onClick={copy} className="hero-cta hero-cta--ghost hm-btn">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copiado!" : "Copiar mensagem"}
                </button>
                <a href={DISCORD_STORE_URL} target="_blank" rel="noopener noreferrer" className="hero-cta hero-cta--primary hm-btn">
                  Ir para o Discord <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* canal de suporte e links legais */}
              <div className="mt-5 pt-4 space-y-1.5 text-[11px] leading-relaxed text-zinc-500" style={{ borderTop: "1px solid #27272a" }}>
                <p>
                  Dúvidas ou desistência em até {POLICY.ARREPENDIMENTO_DIAS} dias: ticket no Discord. Veja os{" "}
                  <Link href="/termos" className="underline underline-offset-2 hover:text-white">Termos</Link>, a{" "}
                  <Link href="/reembolso" className="underline underline-offset-2 hover:text-white">Política de Reembolso</Link> e a{" "}
                  <Link href="/privacidade" className="underline underline-offset-2 hover:text-white">Privacidade</Link>. {DISCORD_DISCLAIMER}
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
