"use client";

import { SaleForm } from "@/components/dashboard/sale-form";
import { SalesTable } from "@/components/dashboard/sales-table";
import { useSales } from "@/hooks/use-sales";
import { Download } from "lucide-react";

export interface Sale {
  id: string;
  client: string;
  product: string;
  value: number;
  notes: string | null;
  receipt: string | null;
  staffName: string | null;
  createdAt: string;
}

export default function SalesPage() {
  const { sales, loading, refresh } = useSales();

  function exportCSV() {
    const header = "Cliente,Produto,Valor,Vendedor,Data,Observações\n";
    const rows = sales.map((s) =>
      `"${s.client}","${s.product}",${s.value},"${s.staffName || ""}","${new Date(s.createdAt).toLocaleDateString("pt-BR")}","${s.notes || ""}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vendas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Gráfico simples — vendas por dia nos últimos 14 dias
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });

  const salesByDay: Record<string, number> = {};
  for (const s of sales) {
    const day = new Date(s.createdAt).toISOString().slice(0, 10);
    salesByDay[day] = (salesByDay[day] || 0) + 1;
  }

  const chartData = last14.map((d) => ({ date: d, count: salesByDay[d] || 0 }));
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendas</h1>
        {sales.length > 0 && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#a0a0a0" }}
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        )}
      </div>

      {/* Mini chart */}
      {sales.length > 0 && (
        <div
          className="rounded-lg p-5 backdrop-blur-md"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs text-silver/40 uppercase tracking-wider mb-4">Vendas — Últimos 14 dias</p>
          <div className="flex items-end gap-1.5 h-20">
            {chartData.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full rounded-sm transition-all duration-300 min-h-[2px]"
                  style={{
                    height: `${(d.count / maxCount) * 100}%`,
                    background: d.count > 0 ? "linear-gradient(to top, rgba(255,255,255,0.2), rgba(255,255,255,0.5))" : "rgba(255,255,255,0.05)",
                  }}
                />
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block text-[9px] px-2 py-1 rounded bg-white text-black font-medium whitespace-nowrap">
                  {d.count} venda{d.count !== 1 ? "s" : ""} — {new Date(d.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-silver/20">{new Date(last14[0] + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
            <span className="text-[9px] text-silver/20">Hoje</span>
          </div>
        </div>
      )}

      <SaleForm onSuccess={refresh} />
      <SalesTable sales={sales} loading={loading} onDelete={refresh} />
    </div>
  );
}
