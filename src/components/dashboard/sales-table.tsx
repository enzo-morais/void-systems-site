"use client";

import { useState } from "react";
import { Trash2, Loader2, Search, Pencil, X, Check } from "lucide-react";
import { ConfirmModal } from "./confirm-modal";
import { useConfirm } from "@/hooks/use-confirm";
import { useToast } from "./toast";
import type { Sale } from "@/app/dashboard/sales/page";

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" };

export function SalesTable({ sales, loading, onDelete }: { sales: Sale[]; loading: boolean; onDelete: () => void }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ client: "", product: "", value: "", notes: "" });
  const [editLoading, setEditLoading] = useState(false);
  const { confirm, modalProps } = useConfirm();
  const { toast } = useToast();

  async function handleDelete(id: string) {
    const ok = await confirm({ title: "Deletar venda", message: "Tem certeza que deseja deletar esta venda?", confirmText: "Deletar" });
    if (!ok) return;
    setDeletingId(id);
    const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) { toast("Venda deletada"); onDelete(); }
    else toast("Erro ao deletar", "error");
  }

  function startEdit(sale: Sale) {
    setEditId(sale.id);
    setEditData({ client: sale.client, product: sale.product, value: String(sale.value), notes: sale.notes || "" });
  }

  async function saveEdit() {
    if (!editId) return;
    setEditLoading(true);
    const res = await fetch(`/api/sales/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client: editData.client, product: editData.product, value: parseFloat(editData.value), notes: editData.notes }),
    });
    setEditLoading(false);
    if (res.ok) { toast("Venda atualizada"); setEditId(null); onDelete(); }
    else toast("Erro ao editar", "error");
  }

  const filtered = sales.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.client.toLowerCase().includes(q) || s.product.toLowerCase().includes(q) || (s.staffName || "").toLowerCase().includes(q);
  });

  if (loading) return <div className="flex items-center justify-center py-12 text-silver/40"><Loader2 className="w-5 h-5 animate-spin mr-2" />Carregando...</div>;
  if (sales.length === 0) return <div className="text-center py-12 text-silver/30 text-sm">Nenhuma venda registrada.</div>;

  return (
    <>
      <ConfirmModal {...modalProps} />
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver/30" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por cliente, produto ou vendedor..."
          className="w-full bg-black/40 border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-silver/20 backdrop-blur-sm"
          style={{ borderColor: "rgba(255,255,255,0.08)" }} />
      </div>
      <div className="rounded-lg overflow-hidden" style={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Cliente</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Produto</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Valor</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Vendedor</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Data</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Comprov.</th>
                <th className="px-5 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sale) => (
                <tr key={sale.id} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                >
                  {editId === sale.id ? (
                    <>
                      <td className="px-5 py-2"><input type="text" value={editData.client} onChange={(e) => setEditData({ ...editData, client: e.target.value })} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-full" /></td>
                      <td className="px-5 py-2"><input type="text" value={editData.product} onChange={(e) => setEditData({ ...editData, product: e.target.value })} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-full" /></td>
                      <td className="px-5 py-2"><input type="number" step="0.01" value={editData.value} onChange={(e) => setEditData({ ...editData, value: e.target.value })} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm w-20" /></td>
                      <td className="px-5 py-2 text-silver/50">{sale.staffName || "—"}</td>
                      <td className="px-5 py-2 text-silver/40">{new Date(sale.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td className="px-5 py-2">—</td>
                      <td className="px-5 py-2 flex gap-1">
                        <button onClick={saveEdit} disabled={editLoading} className="p-1.5 rounded-md text-green-400 hover:bg-green-400/10 cursor-pointer">
                          {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setEditId(null)} className="p-1.5 rounded-md text-silver/40 hover:text-white cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3 font-medium">{sale.client}</td>
                      <td className="px-5 py-3 text-silver/60">{sale.product}</td>
                      <td className="px-5 py-3 text-green-400 font-medium">R${sale.value.toFixed(2).replace(".", ",")}</td>
                      <td className="px-5 py-3 text-silver/50">{sale.staffName || "—"}</td>
                      <td className="px-5 py-3 text-silver/40">{new Date(sale.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td className="px-5 py-3">
                        {sale.receipt ? (
                          <a href={sale.receipt} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e" }}>Ver</a>
                        ) : <span className="text-xs text-silver/20">—</span>}
                      </td>
                      <td className="px-5 py-3 flex gap-1">
                        <button onClick={() => startEdit(sale)} className="p-1.5 rounded-md text-silver/30 hover:text-white hover:bg-white/5 cursor-pointer">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(sale.id)} disabled={deletingId === sale.id}
                          className="p-1.5 rounded-md text-silver/30 hover:text-red-400 hover:bg-red-400/10 cursor-pointer">
                          {deletingId === sale.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-silver/30 text-sm">Nenhum resultado para &ldquo;{search}&rdquo;</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
