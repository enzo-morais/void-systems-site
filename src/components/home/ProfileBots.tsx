"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bot, CalendarClock, LifeBuoy, QrCode, Server } from "lucide-react";
import { DISCORD_LINK } from "@/config/home";
import "@/components/dashboard/panel-theme.css";

interface ClientBot {
  id: string;
  name: string;
  status: string;
  botAvatar?: string | null;
  /** Servidor onde o bot está instalado. O sistema ainda não guarda isso: sem o dado, mostra "Em breve". */
  guildName?: string | null;
  /** Data da próxima cobrança (ISO). O sistema ainda não guarda isso: sem o dado, mostra "Em breve". */
  nextBillingAt?: string | null;
}

const STATUS: Record<string, { color: string; label: string }> = {
  online: { color: "#22c55e", label: "Online" },
  starting: { color: "#eab308", label: "Iniciando" },
  stopping: { color: "#f97316", label: "Parando" },
};

function Soon() {
  return <span className="pt-soon">Em breve</span>;
}

/** Dias inteiros até a data (negativo = vencido). */
function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

// Bots de exemplo para conferir o visual em desenvolvimento (?preview=1). Nunca aparecem em produção.
const DEV_PREVIEW: ClientBot[] = [
  { id: "d1", name: "Bot de Ticket (exemplo)", status: "online", guildName: "Servidor Exemplo", nextBillingAt: new Date(Date.now() + 2 * 86_400_000).toISOString() },
  { id: "d2", name: "Bot de Registro (exemplo)", status: "offline", guildName: null, nextBillingAt: null },
];

/** "Meus bots" do perfil do cliente: status, servidor, cobrança e atalhos de renovação/suporte. */
export function ProfileBots() {
  const [bots, setBots] = useState<ClientBot[] | null>(null);

  useEffect(() => {
    const preview = process.env.NODE_ENV !== "production" && new URLSearchParams(window.location.search).get("preview") === "1";
    if (preview) {
      setBots(DEV_PREVIEW);
      return;
    }
    fetch("/api/bots")
      .then((r) => (r.ok ? r.json() : { bots: [] }))
      .then((d) => setBots(d.bots ?? []))
      .catch(() => setBots([]));
  }, []);

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5 text-[var(--void-accent)]" /> Meus bots
        </h2>
        <Link href="/discloud" className="text-xs text-silver/80 hover:text-white transition-colors">Gerenciar →</Link>
      </div>

      {bots === null && <div className="panel p-6 text-sm text-silver/80">Carregando...</div>}

      {bots !== null && bots.length === 0 && (
        <div className="panel p-8 text-center">
          <Bot className="w-9 h-9 mx-auto mb-3 text-silver/70" />
          <p className="text-sm text-silver/85">Você ainda não tem bots contratados.</p>
          <Link href="/bots" className="pt-btn pt-btn--primary mt-4">Ver bots</Link>
        </div>
      )}

      <div className="space-y-4">
        {bots?.map((bot) => {
          const st = STATUS[bot.status] ?? { color: "#ef4444", label: "Offline" };
          const days = bot.nextBillingAt ? daysUntil(bot.nextBillingAt) : null;
          const soonDue = days !== null && days <= 3;

          return (
            <div key={bot.id} className="panel p-5 sm:p-6" style={soonDue ? { borderColor: "rgba(245,158,11,0.55)" } : undefined}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, rgba(143,125,255,0.4), rgba(143,125,255,0.1))", border: "1px solid rgba(143,125,255,0.4)" }}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold truncate">{bot.name}</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${st.color}24`, color: st.color, border: `1px solid ${st.color}55` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
                  {st.label}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mt-5">
                <div className="rounded-lg px-3 py-2.5" style={{ background: "#15151c", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-silver/70 flex items-center gap-1.5 mb-1"><Server className="w-3 h-3" /> Instalado em</p>
                  {bot.guildName ? <p className="text-sm font-medium">{bot.guildName}</p> : <Soon />}
                </div>
                <div className="rounded-lg px-3 py-2.5" style={{ background: "#15151c", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-silver/70 flex items-center gap-1.5 mb-1"><CalendarClock className="w-3 h-3" /> Próxima cobrança</p>
                  {days === null ? (
                    <Soon />
                  ) : days < 0 ? (
                    <p className="text-sm font-medium text-red-400">Vencida há {Math.abs(days)} dia{Math.abs(days) > 1 ? "s" : ""}</p>
                  ) : (
                    <p className="text-sm font-medium">{days === 0 ? "Vence hoje" : `Em ${days} dia${days > 1 ? "s" : ""}`}</p>
                  )}
                </div>
              </div>

              {soonDue && (
                <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.4)", color: "#fcd34d" }}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  {days! < 0 ? "A cobrança deste bot está vencida. Renove para ele continuar no ar." : `Faltam ${days} dia${days === 1 ? "" : "s"} para o vencimento. Renove para o bot não sair do ar.`}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-5">
                <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer" className="pt-btn pt-btn--primary">
                  <QrCode className="w-4 h-4" /> Renovar via Pix
                </a>
                <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer" className="pt-btn pt-btn--ghost">
                  <LifeBuoy className="w-4 h-4" /> Abrir suporte
                </a>
              </div>
              <p className="text-[11px] text-silver/70 mt-3">O Pix é gerado pela nossa equipe no Discord da loja.</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
