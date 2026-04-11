"use client";

import { useState, useEffect } from "react";
import { Loader2, Users2, Trophy, Target, RefreshCw, X, ImageIcon, ExternalLink } from "lucide-react";
import Image from "next/image";

interface StaffMember {
  id: string; username: string; displayName: string; avatar: string | null;
}
interface Sale {
  id: string; client: string; product: string; value: number; notes: string | null;
  receipt: string | null; staffName: string | null; createdAt: string;
}

const MONTHLY_GOAL = 5;
const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" };

export default function TeamPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [modalTab, setModalTab] = useState<"vendas" | "faturas">("vendas");

  async function fetchData() {
    const [staffRes, salesRes] = await Promise.all([fetch("/api/staff"), fetch("/api/sales")]);
    if (staffRes.ok) { const d = await staffRes.json(); if (Array.isArray(d)) setStaff(d); }
    if (salesRes.ok) { const d = await salesRes.json(); if (Array.isArray(d)) setSales(d); }
    setLoading(false); setRefreshing(false);
  }

  useEffect(() => { fetchData(); }, []);
  function handleRefresh() { setRefreshing(true); fetchData(); }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthSales = sales.filter((s) => new Date(s.createdAt) >= startOfMonth);
  const counts: Record<string, number> = {};
  for (const s of monthSales) { if (s.staffName) counts[s.staffName] = (counts[s.staffName] || 0) + 1; }
  const monthName = now.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  if (loading) return <div className="flex items-center justify-center py-20 text-silver/40"><Loader2 className="w-5 h-5 animate-spin mr-2" />Carregando equipe do Discord...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users2 className="w-6 h-6" /> Equipe</h1>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#a0a0a0" }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Atualizar
        </button>
      </div>

      <div className="rounded-lg p-5 flex items-center gap-4" style={cardStyle}>
        <Target className="w-5 h-5 text-silver/40" />
        <div>
          <p className="text-sm font-medium">Meta Mensal — {monthName}</p>
          <p className="text-xs text-silver/40">{MONTHLY_GOAL} vendas por membro · {staff.length} membros no Discord</p>
        </div>
      </div>

      {staff.length === 0 ? (
        <div className="text-center py-12 text-silver/30 text-sm">Nenhum membro com o cargo encontrado no Discord.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff
            .map((m) => ({ ...m, salesCount: counts[m.displayName] || 0 }))
            .sort((a, b) => b.salesCount - a.salesCount)
            .map((member, i) => {
              const completed = member.salesCount >= MONTHLY_GOAL;
              const pct = Math.min(Math.round((member.salesCount / MONTHLY_GOAL) * 100), 100);
              return (
                <div key={member.id} className="rounded-lg p-5 transition-all duration-200 cursor-pointer" style={cardStyle}
                  onClick={() => setSelectedMember(member)}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      {member.avatar ? (
                        <Image src={member.avatar} alt="" width={44} height={44} className="rounded-full" />
                      ) : (
                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                          {member.displayName[0].toUpperCase()}
                        </div>
                      )}
                      {i < 3 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ backgroundColor: i === 0 ? "#fbbf24" : i === 1 ? "#9ca3af" : "#cd7f32", color: "#000" }}
                        >{i + 1}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium flex items-center gap-2 truncate">
                        {member.displayName}
                        {completed && <Trophy className="w-3.5 h-3.5 text-green-400 shrink-0" />}
                      </p>
                      <p className="text-xs text-silver/30">@{member.username}</p>
                    </div>
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-bold">{member.salesCount}</span>
                    <span className="text-silver/40 text-sm mb-0.5">/ {MONTHLY_GOAL}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{
                      width: `${pct}%`,
                      background: completed ? "linear-gradient(90deg, #22c55e, #4ade80)" : "linear-gradient(90deg, #fff, #c0c0c0)",
                    }} />
                  </div>
                  <p className="text-xs mt-2" style={{ color: completed ? "#22c55e" : "rgba(192,192,192,0.4)" }}>
                    {completed ? "Meta atingida!" : `Faltam ${MONTHLY_GOAL - member.salesCount}`}
                  </p>
                </div>
              );
            })}
        </div>
      )}

      {/* Modal de vendas do membro */}
      {selectedMember && (() => {
        const GOAL = 5;
        const memberAllSales = sales.filter((s) => s.staffName === selectedMember.displayName).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Agrupar vendas por mês pra faturas
        const monthlyMap = new Map<string, Sale[]>();
        for (const s of memberAllSales) {
          const d = new Date(s.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (!monthlyMap.has(key)) monthlyMap.set(key, []);
          monthlyMap.get(key)!.push(s);
        }

        const invoices = Array.from(monthlyMap.entries()).map(([month, monthSales]) => {
          const sorted = [...monthSales].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          let commission = 0;
          sorted.forEach((s, i) => {
            commission += s.value * (i + 1 > GOAL ? 1.0 : 0.10);
          });
          const total = monthSales.reduce((sum, s) => sum + s.value, 0);
          const [y, m] = month.split("-");
          const label = new Date(Number(y), Number(m) - 1).toLocaleString("pt-BR", { month: "long", year: "numeric" });
          return { month, label, sales: monthSales.length, total, commission, metGoal: monthSales.length >= GOAL };
        });

        return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => { setSelectedMember(null); setModalTab("vendas"); }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden mx-4 flex flex-col"
            style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.1)", animation: "fadeIn 0.15s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3">
                {selectedMember.avatar ? (
                  <Image src={selectedMember.avatar} alt="" width={40} height={40} className="rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                    {selectedMember.displayName[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{selectedMember.displayName}</p>
                  <p className="text-xs text-silver/40">@{selectedMember.username}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedMember(null); setModalTab("vendas"); }} className="p-2 rounded-lg cursor-pointer text-silver/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {(["vendas", "faturas"] as const).map((tab) => (
                <button key={tab} onClick={() => setModalTab(tab)}
                  className="flex-1 py-3 text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer"
                  style={{
                    color: modalTab === tab ? "#fff" : "rgba(192,192,192,0.4)",
                    borderBottom: modalTab === tab ? "2px solid #fff" : "2px solid transparent",
                  }}
                >{tab}</button>
              ))}
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-5 space-y-3 flex-1">
              {modalTab === "vendas" ? (
                memberAllSales.length === 0 ? (
                  <p className="text-center text-silver/30 text-sm py-8">Nenhuma venda registrada.</p>
                ) : (
                  memberAllSales.map((sale) => (
                    <div key={sale.id} className="rounded-lg p-4 flex gap-4" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      {sale.receipt ? (
                        <a href={sale.receipt} target="_blank" rel="noopener noreferrer" className="shrink-0 group relative">
                          <img src={sale.receipt} alt="Comprovante" className="w-16 h-16 rounded-lg object-cover" />
                          <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ExternalLink className="w-4 h-4 text-white" />
                          </div>
                        </a>
                      ) : (
                        <div className="w-16 h-16 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                          <ImageIcon className="w-5 h-5 text-silver/20" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{sale.product}</p>
                          <p className="text-sm font-bold text-green-400">R${sale.value.toFixed(2).replace(".", ",")}</p>
                        </div>
                        <p className="text-xs text-silver/40 mt-0.5">Cliente: {sale.client}</p>
                        {sale.notes && <p className="text-xs text-silver/30 mt-0.5">{sale.notes}</p>}
                        <p className="text-[10px] text-silver/20 mt-1">{new Date(sale.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                  ))
                )
              ) : (
                invoices.length === 0 ? (
                  <p className="text-center text-silver/30 text-sm py-8">Nenhuma fatura.</p>
                ) : (
                  invoices.map((inv) => (
                    <div key={inv.month} className="rounded-lg p-4" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium capitalize">{inv.label}</p>
                          <p className="text-[10px] text-silver/30">{inv.sales} venda{inv.sales !== 1 ? "s" : ""} · R${inv.total.toFixed(2).replace(".", ",")} em vendas</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">R${inv.commission.toFixed(2).replace(".", ",")}</p>
                          <p className="text-[10px] text-silver/30">{inv.metGoal ? "Meta batida" : "Meta não batida"}</p>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full" style={{
                          width: `${Math.min((inv.sales / GOAL) * 100, 100)}%`,
                          background: inv.metGoal ? "linear-gradient(90deg, #22c55e, #4ade80)" : "linear-gradient(90deg, #fff, #c0c0c0)",
                        }} />
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
