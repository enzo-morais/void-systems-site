"use client";

import { useState, useEffect } from "react";
import { Loader2, DollarSign, Trophy, TrendingUp } from "lucide-react";
import Image from "next/image";

interface StaffMember {
  id: string; username: string; displayName: string; avatar: string | null;
}
interface Sale {
  id: string; value: number; staffName: string | null; createdAt: string;
}

const MONTHLY_GOAL = 5;
const COMMISSION_BEFORE_GOAL = 0.10; // 10%
const COMMISSION_AFTER_GOAL = 1.00; // 100%

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" };

export default function CommissionsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/staff").then((r) => r.json()),
      fetch("/api/sales").then((r) => r.json()),
    ]).then(([staffData, salesData]) => {
      if (Array.isArray(staffData)) setStaff(staffData);
      if (Array.isArray(salesData)) setSales(salesData);
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthName = now.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  // Filtrar vendas do mês
  const monthSales = sales.filter((s) => new Date(s.createdAt) >= startOfMonth);

  // Calcular comissão por staff
  const commissions = staff.map((member) => {
    const memberSales = monthSales
      .filter((s) => s.staffName === member.displayName)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const totalSales = memberSales.length;
    const metGoal = totalSales >= MONTHLY_GOAL;

    let commission = 0;
    const breakdown: { value: number; commission: number; rate: number; saleNum: number }[] = [];

    memberSales.forEach((sale, i) => {
      const saleNum = i + 1;
      const rate = saleNum > MONTHLY_GOAL ? COMMISSION_AFTER_GOAL : COMMISSION_BEFORE_GOAL;
      const saleCommission = sale.value * rate;
      commission += saleCommission;
      breakdown.push({ value: sale.value, commission: saleCommission, rate, saleNum });
    });

    const totalRevenue = memberSales.reduce((sum, s) => sum + s.value, 0);

    return {
      ...member,
      totalSales,
      totalRevenue,
      commission,
      metGoal,
      breakdown,
    };
  }).sort((a, b) => b.commission - a.commission);

  const totalCommissions = commissions.reduce((sum, c) => sum + c.commission, 0);

  if (loading) return <div className="flex items-center justify-center py-20 text-silver/40"><Loader2 className="w-5 h-5 animate-spin mr-2" />Carregando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="w-6 h-6" /> Comissões</h1>

      {/* Info */}
      <div className="rounded-lg p-5 flex items-center gap-4" style={cardStyle}>
        <TrendingUp className="w-5 h-5 text-silver/40" />
        <div>
          <p className="text-sm font-medium">Comissões — {monthName}</p>
          <p className="text-xs text-silver/40">10% por venda antes da meta ({MONTHLY_GOAL} vendas) · 100% por venda após bater a meta</p>
        </div>
      </div>

      {/* Total */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg p-5" style={cardStyle}>
          <p className="text-xs text-silver/40 uppercase tracking-wider mb-1">Total a pagar</p>
          <p className="text-2xl font-bold text-green-400">R${totalCommissions.toFixed(2).replace(".", ",")}</p>
        </div>
        <div className="rounded-lg p-5" style={cardStyle}>
          <p className="text-xs text-silver/40 uppercase tracking-wider mb-1">Vendedores ativos</p>
          <p className="text-2xl font-bold">{commissions.filter((c) => c.totalSales > 0).length}</p>
        </div>
        <div className="rounded-lg p-5" style={cardStyle}>
          <p className="text-xs text-silver/40 uppercase tracking-wider mb-1">Metas batidas</p>
          <p className="text-2xl font-bold">{commissions.filter((c) => c.metGoal).length}/{staff.length}</p>
        </div>
      </div>

      {/* Staff cards */}
      {commissions.length === 0 ? (
        <div className="text-center py-12 text-silver/30 text-sm">Nenhum membro encontrado.</div>
      ) : (
        <div className="space-y-3">
          {commissions.map((member) => (
            <details key={member.id} className="rounded-lg overflow-hidden group" style={cardStyle}>
              <summary className="flex items-center gap-4 p-4 cursor-pointer list-none">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {member.avatar ? (
                    <Image src={member.avatar} alt="" width={36} height={36} className="rounded-full" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                      {member.displayName[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium flex items-center gap-2 truncate">
                      {member.displayName}
                      {member.metGoal && <Trophy className="w-3.5 h-3.5 text-green-400 shrink-0" />}
                    </p>
                    <p className="text-[10px] text-silver/30">{member.totalSales} venda{member.totalSales !== 1 ? "s" : ""} · R${member.totalRevenue.toFixed(2).replace(".", ",")} em vendas</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-green-400">R${member.commission.toFixed(2).replace(".", ",")}</p>
                  <p className="text-[10px] text-silver/30">{member.metGoal ? "Meta batida — 100%" : "10% por venda"}</p>
                </div>
              </summary>

              {/* Breakdown */}
              {member.breakdown.length > 0 && (
                <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <table className="w-full text-xs mt-3">
                    <thead>
                      <tr className="text-silver/30">
                        <th className="text-left py-1 font-medium">#</th>
                        <th className="text-left py-1 font-medium">Valor da venda</th>
                        <th className="text-left py-1 font-medium">Taxa</th>
                        <th className="text-right py-1 font-medium">Comissão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {member.breakdown.map((b) => (
                        <tr key={b.saleNum} style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}>
                          <td className="py-1.5 text-silver/40">{b.saleNum}</td>
                          <td className="py-1.5">R${b.value.toFixed(2).replace(".", ",")}</td>
                          <td className="py-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px]" style={{
                              backgroundColor: b.rate === 1 ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
                              color: b.rate === 1 ? "#22c55e" : "#999",
                            }}>
                              {b.rate === 1 ? "100%" : "10%"}
                            </span>
                          </td>
                          <td className="py-1.5 text-right text-green-400 font-medium">R${b.commission.toFixed(2).replace(".", ",")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
