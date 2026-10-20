"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AlertTriangle, CalendarClock, DollarSign, RefreshCw, Server, ShoppingCart, Target, TrendingUp, Trophy, Users, ListTodo, Clock, ArrowUpRight } from "lucide-react";

interface Stats {
  totalSales: number; revenue: number; totalClients: number; totalTasks: number; pendingTasks: number;
}
interface StaffMember {
  id: string; username: string; displayName: string; avatar: string | null;
}
interface Sale {
  id: string; staffName: string | null; value?: number; createdAt: string;
}
interface Log {
  id: string; action: string; details: string | null; staffName: string; createdAt: string;
}
interface HostedBot {
  id: string; name: string; status: string; lastAction: string | null;
}

const MONTHLY_GOAL = 5;
const brl = (n: number) => `R$${n.toFixed(2).replace(".", ",")}`;

/** Selo para dados que o sistema ainda não tem (sem inventar números). */
function Soon() {
  return <span className="pt-soon">Em breve</span>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [bots, setBots] = useState<HostedBot[] | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((d) => { if (d && !d.error) setStats(d); }).catch(() => {});
    fetch("/api/staff").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setStaff(d); }).catch(() => {});
    fetch("/api/sales").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setSales(d); }).catch(() => {});
    fetch("/api/logs").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setLogs(d.slice(0, 6)); }).catch(() => {});
    fetch("/api/staff/bots").then((r) => r.json()).then((d) => setBots(Array.isArray(d) ? d : [])).catch(() => setBots([]));
  }, []);

  // Vendas do mês
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthSales = sales.filter((s) => new Date(s.createdAt) >= startOfMonth);
  const monthRevenue = monthSales.reduce((sum, s) => sum + (s.value ?? 0), 0);
  const counts: Record<string, number> = {};
  for (const s of monthSales) {
    if (s.staffName) counts[s.staffName] = (counts[s.staffName] || 0) + 1;
  }

  // Ranking
  const ranking = staff
    .map((m) => ({ ...m, salesCount: counts[m.displayName] || 0 }))
    .sort((a, b) => b.salesCount - a.salesCount);

  // Minha meta (pelo Discord ID)
  const me = ranking.find((m) => m.id === session?.user?.discordId);
  const monthName = now.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  const offlineBots = (bots ?? []).filter((b) => b.status !== "online");

  const summary = [
    { label: "Receita do mês", icon: DollarSign, value: sales.length || stats ? brl(monthRevenue) : "—", tone: "#4ade80" },
    { label: "Assinaturas ativas", icon: RefreshCw, soon: true },
    { label: "Renovações em 7 dias", icon: CalendarClock, soon: true },
    { label: "Bots offline", icon: Server, value: bots === null ? "—" : String(offlineBots.length), tone: offlineBots.length > 0 ? "#f87171" : "#4ade80" },
  ];

  const statCards = [
    { label: "Vendas", value: stats?.totalSales ?? "—", icon: ShoppingCart },
    { label: "Receita total", value: stats ? brl(stats.revenue) : "—", icon: DollarSign },
    { label: "Clientes", value: stats?.totalClients ?? "—", icon: Users },
    { label: "Tarefas", value: stats?.totalTasks ?? "—", icon: ListTodo },
    { label: "Pendentes", value: stats?.pendingTasks ?? "—", icon: Clock },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="pt-title">
          Olá, {session?.user?.username || session?.user?.name}
        </h1>
        <p className="pt-sub">Resumo da VØID Systems em {monthName}</p>
      </div>

      {/* resumo do mês */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summary.map((card) => (
          <div key={card.label} className="pt-card p-4">
            <div className="flex items-center gap-2 mb-3 text-silver/70">
              <card.icon className="w-4 h-4" />
              <p className="font-mono text-[10px] uppercase tracking-wider">{card.label}</p>
            </div>
            {card.soon ? <Soon /> : <p className="font-display text-2xl font-bold" style={{ color: card.tone }}>{card.value}</p>}
          </div>
        ))}
      </div>

      {/* precisa de atenção */}
      <div className="pt-card p-5">
        <h2 className="font-mono text-xs uppercase tracking-wider text-silver/80 flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-400" /> Precisa de atenção
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Bots caídos</p>
            {bots === null ? (
              <p className="text-sm text-silver/70">Carregando...</p>
            ) : offlineBots.length === 0 ? (
              <p className="text-sm text-green-400">Nenhum bot caído. Tudo certo por aqui.</p>
            ) : (
              <ul className="space-y-2">
                {offlineBots.slice(0, 5).map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2" style={{ background: "#15151c", border: "1px solid rgba(239,68,68,0.25)" }}>
                    <span className="text-sm truncate">{b.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-red-400">{b.status}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/discloud" className="mt-3 inline-flex items-center gap-1 text-xs text-silver/80 hover:text-white transition-colors">
              Ver bots hospedados <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Pagamentos atrasados</p>
            <Soon />
            <p className="text-xs text-silver/70 mt-2">O sistema ainda não registra a data de vencimento das assinaturas.</p>
          </div>
        </div>
      </div>

      {/* números gerais */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="pt-card p-3">
            <div className="flex items-center gap-1.5 mb-1 text-silver/70">
              <card.icon className="w-3.5 h-3.5" />
              <p className="font-mono text-[10px] uppercase tracking-wider">{card.label}</p>
            </div>
            <p className="font-display text-lg font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Minha meta */}
        {me && (
          <div className="pt-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono text-xs uppercase tracking-wider text-silver/80 flex items-center gap-2">
                <Target className="w-4 h-4" /> Sua meta — {monthName}
              </h2>
              {me.salesCount >= MONTHLY_GOAL && (
                <span className="flex items-center gap-1 text-[10px] text-green-400 px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(34,197,94,0.12)" }}>
                  <Trophy className="w-3 h-3" /> Concluída
                </span>
              )}
            </div>
            <div className="flex items-end gap-2 mb-2">
              <p className="font-display text-3xl font-bold">{me.salesCount}</p>
              <p className="text-silver/70 text-sm mb-0.5">/ {MONTHLY_GOAL}</p>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-700 ease-out" style={{
                width: `${Math.min(Math.round((me.salesCount / MONTHLY_GOAL) * 100), 100)}%`,
                background: me.salesCount >= MONTHLY_GOAL ? "linear-gradient(90deg, #22c55e, #4ade80)" : "linear-gradient(90deg, var(--void-accent), #c4bbff)",
              }} />
            </div>
            <p className="text-xs text-silver/70 mt-2">
              {me.salesCount >= MONTHLY_GOAL ? "Meta atingida!" : `Faltam ${MONTHLY_GOAL - me.salesCount}.`}
            </p>
          </div>
        )}

        {/* Ranking */}
        <div className="pt-card p-5">
          <h2 className="font-mono text-xs uppercase tracking-wider text-silver/80 flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" /> Ranking — {monthName}
          </h2>
          {ranking.length === 0 ? (
            <p className="text-silver/70 text-sm">Carregando...</p>
          ) : (
            <div className="space-y-3">
              {ranking.map((member, i) => (
                <div key={member.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] w-5 text-silver/70">#{i + 1}</span>
                      <span className="text-sm font-medium">{member.displayName}</span>
                      {member.salesCount >= MONTHLY_GOAL && <Trophy className="w-3 h-3 text-green-400" />}
                    </div>
                    <span className="font-mono text-[10px] text-silver/70">{member.salesCount}/{MONTHLY_GOAL}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: `${Math.min(Math.round((member.salesCount / MONTHLY_GOAL) * 100), 100)}%`,
                      background: member.salesCount >= MONTHLY_GOAL ? "linear-gradient(90deg, #22c55e, #4ade80)" : i === 0 && member.salesCount > 0 ? "linear-gradient(90deg, var(--void-accent), #c4bbff)" : "rgba(255,255,255,0.35)",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Atividade recente */}
      <div className="pt-card p-5">
        <h2 className="font-mono text-xs uppercase tracking-wider text-silver/80 mb-4">Atividade recente</h2>
        {logs.length === 0 ? (
          <p className="text-silver/70 text-sm">Nenhuma atividade registrada.</p>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div>
                  <p className="text-sm">{log.action}</p>
                  {log.details && <p className="text-xs text-silver/70 mt-0.5">{log.details}</p>}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xs text-silver/80">{log.staffName}</p>
                  <p className="text-[10px] text-silver/70">{new Date(log.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
