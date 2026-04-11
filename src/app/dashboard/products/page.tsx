"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, CheckCircle, Trash2, Package, Pencil } from "lucide-react";
import { ConfirmModal } from "@/components/dashboard/confirm-modal";
import { useConfirm } from "@/hooks/use-confirm";
import { CustomSelect } from "@/components/dashboard/custom-select";

interface Product {
  id: string; name: string; price: number; category: string | null; active: boolean; createdAt: string;
}

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" };
const inputClass = "w-full bg-black/40 border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-silver/30 backdrop-blur-sm";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [billing, setBilling] = useState("monthly");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { confirm, modalProps } = useConfirm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/products", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: parseFloat(price), category: category || undefined, description: description || undefined, badge: badge || undefined, billing, tags: tags || undefined }),
    });
    setSaving(false);
    if (res.ok) {
      setName(""); setPrice(""); setCategory(""); setDescription(""); setBadge(""); setBilling("monthly"); setTags("");
      setSuccess(true); fetchProducts();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({ title: "Deletar produto", message: "Tem certeza que deseja remover este produto?", confirmText: "Deletar" });
    if (!ok) return;
    setDeletingId(id);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeletingId(null);
    fetchProducts();
  }

  async function handleEditPrice(id: string) {
    if (!editPrice) return;
    await fetch(`/api/products/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: parseFloat(editPrice) }),
    });
    setEditingId(null); setEditPrice("");
    fetchProducts();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6" /> Catálogo de Produtos</h1>
      <ConfirmModal {...modalProps} />

      <form onSubmit={handleSubmit} className="rounded-lg p-6" style={cardStyle}>
        <h2 className="text-sm font-semibold text-silver/60 uppercase tracking-wider mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Novo Produto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Nome *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nome do produto" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Preço (R$) *</label>
            <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="0,00" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Categoria</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Bot, Serviço..." className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Badge</label>
            <CustomSelect value={badge} onChange={setBadge} options={[
              { value: "", label: "Nenhum" },
              { value: "Popular", label: "Popular" },
              { value: "Novo", label: "Novo" },
              { value: "Destaque", label: "Destaque" },
            ]} placeholder="Selecione" />
          </div>
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Pagamento</label>
            <CustomSelect value={billing} onChange={setBilling} options={[
              { value: "monthly", label: "Mensal" },
              { value: "once", label: "Pagamento único" },
            ]} placeholder="Selecione" />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs text-silver/40 mb-1.5">Descrição (visível na loja)</label>
            <textarea value={description} onChange={(e) => { setDescription(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }} placeholder="Descrição do produto" rows={1} className={inputClass + " resize-none overflow-hidden"} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs text-silver/40 mb-1.5">Tags (separadas por vírgula)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Ex: DayZ, Discord, Jogo, Automação" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
        </div>
        {success && <p className="text-green-400 text-sm mb-4 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Produto cadastrado</p>}
        <button type="submit" disabled={saving} className="bg-white text-black font-medium px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center gap-2 cursor-pointer">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {saving ? "Salvando..." : "Cadastrar"}
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-silver/40"><Loader2 className="w-5 h-5 animate-spin mr-2" />Carregando...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-silver/30 text-sm">Nenhum produto cadastrado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="rounded-lg p-5 transition-all duration-200" style={cardStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium">{p.name}</p>
                  {p.category && <p className="text-xs text-silver/40 mt-0.5">{p.category}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingId(p.id); setEditPrice(p.price.toString()); }}
                    className="p-1.5 rounded-md transition-colors cursor-pointer" style={{ color: "#666" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#666"; }}
                  ><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                    className="p-1.5 rounded-md transition-colors cursor-pointer" style={{ color: "#666" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#666"; }}
                  >{deletingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
                </div>
              </div>

              {editingId === p.id ? (
                <div className="flex gap-2">
                  <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                    className="flex-1 bg-black border rounded-lg px-3 py-1.5 text-sm" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
                  <button onClick={() => handleEditPrice(p.id)} className="text-xs px-3 py-1.5 bg-white text-black rounded-lg font-medium cursor-pointer">Salvar</button>
                  <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 rounded-lg cursor-pointer" style={{ color: "#666" }}>Cancelar</button>
                </div>
              ) : (
                <p className="text-2xl font-bold text-green-400">R${p.price.toFixed(2).replace(".", ",")}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
