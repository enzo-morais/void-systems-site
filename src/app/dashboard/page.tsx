"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ShoppingCart, Users, ListTodo, DollarSign, Clock, Target, Trophy, TrendingUp } from "lucide-react";

interface Stats {
  totalSales: number; revenue: number; totalClients: number; totalTasks: number; pendingTasks: number;
}
interface StaffMember {
  id: string; username: string; displayName: string; avatar: string | null;
}
interface Sale {
  id: string; staffName: string | null; createdAt: string;
}
interface Log {
  id: string; action: string; details: string | null; staffName: string; createdAt: string;
}

const MONTHLY_GOAL = 5;
const cardStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  backdropFilter: "blur(12px)",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats);
    fetch("/api/staff").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setStaff(d); });
    fetch("/api/sales").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setSales(d); });
    fetch("/api/logs").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setLogs(d.slice(0, 6)); });
  }, []);

  // Vendas do mês
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthSales = sales.filter((s) => new Date(s.createdAt) >= startOfMonth);
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

  const statCards = [
    { label: "Vendas", value: stats?.totalSales ?? "—", icon: ShoppingCart, color: "#fff" },
    { label: "Receita", value: stats ? `R$${stats.revenue.toFixed(2).replace(".", ",")}` : "—", icon: DollarSign, color: "#22c55e" },
    { label: "Clientes", value: stats?.totalClients ?? "—", icon: Users, color: "#fff" },
    { label: "Tarefas", value: stats?.totalTasks ?? "—", icon: ListTodo, color: "#fff" },
    { label: "Pendentes", value: stats?.pendingTasks ?? "—", icon: Clock, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-bold">
          Olá, <span className="text-white">{session?.user?.username || session?.user?.name}</span>
        </h1>
        <p className="text-silver/50 text-xs">Painel da VØID Systems</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-lg p-3" style={cardStyle}>
            <div className="flex items-center gap-1.5 mb-1">
              <card.icon className="w-3.5 h-3.5" style={{ color: card.color, opacity: 0.6 }} />
              <p className="text-[10px] text-silver/50 uppercase tracking-wider">{card.label}</p>
            </div>
            <p className="text-lg font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Minha meta */}
        {me && (
          <div className="rounded-lg p-4" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-silver/60 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-3.5 h-3.5" /> Sua Meta — {monthName}
              </h2>
              {me.salesCount >= MONTHLY_GOAL && (
                <span className="flex items-center gap-1 text-[10px] text-green-400 px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
                  <Trophy className="w-3 h-3" /> Concluída
                </span>
              )}
            </div>
            <div className="flex items-end gap-2 mb-2">
              <p className="text-3xl font-bold">{me.salesCount}</p>
              <p className="text-silver/40 text-sm mb-0.5">/ {MONTHLY_GOAL}</p>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-700 ease-out" style={{
                width: `${Math.min(Math.round((me.salesCount / MONTHLY_GOAL) * 100), 100)}%`,
                background: me.salesCount >= MONTHLY_GOAL ? "linear-gradient(90deg, #22c55e, #4ade80)" : "linear-gradient(90deg, #fff, #c0c0c0)",
              }} />
            </div>
            <p className="text-[11px] text-silver/40 mt-1.5">
              {me.salesCount >= MONTHLY_GOAL ? "Meta atingida!" : `Faltam ${MONTHLY_GOAL - me.salesCount}.`}
            </p>
          </div>
        )}

        {/* Ranking */}
        <div className="rounded-lg p-4" style={cardStyle}>
          <h2 className="text-xs font-semibold text-silver/60 uppercase tracking-wider flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5" /> Ranking — {monthName}
          </h2>
          {ranking.length === 0 ? (
            <p className="text-silver/30 text-sm">Carregando...</p>
          ) : (
            <div className="space-y-2.5">
              {ranking.map((member, i) => (
                <div key={member.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold w-4 text-silver/30">#{i + 1}</span>
                      <span className="text-xs font-medium">{member.displayName}</span>
                      {member.salesCount >= MONTHLY_GOAL && <Trophy className="w-3 h-3 text-green-400" />}
                    </div>
                    <span className="text-[10px] text-silver/40">{member.salesCount}/{MONTHLY_GOAL}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: `${Math.min(Math.round((member.salesCount / MONTHLY_GOAL) * 100), 100)}%`,
                      background: member.salesCount >= MONTHLY_GOAL ? "linear-gradient(90deg, #22c55e, #4ade80)" : i === 0 && member.salesCount > 0 ? "linear-gradient(90deg, #fff, #c0c0c0)" : "rgba(255,255,255,0.3)",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Atividade recente */}
      <div className="rounded-lg p-4" style={cardStyle}>
        <h2 className="text-xs font-semibold text-silver/60 uppercase tracking-wider mb-3">Atividade Recente</h2>
        {logs.length === 0 ? (
          <p className="text-silver/30 text-sm">Nenhuma atividade registrada.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div>
                  <p className="text-xs">{log.action}</p>
                  {log.details && <p className="text-[10px] text-silver/40 mt-0.5">{log.details}</p>}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-[10px] text-silver/40">{log.staffName}</p>
                  <p className="text-[10px] text-silver/30">{new Date(log.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
