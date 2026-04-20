"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, Upload, X, Image as ImageIcon, Trash2 } from "lucide-react";
import { CustomSelect } from "./custom-select";
import { useToast } from "./toast";

interface Client { id: string; name: string; }
interface Product { id: string; name: string; price: number; }
interface Staff { id: string; displayName: string; username: string; }

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" };
const inputClass = "w-full bg-black/40 border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-silver/30 backdrop-blur-sm";

// Regra de desconto automático por quantidade de bots
function getAutoDiscount(botCount: number): number {
  if (botCount >= 4) return 20;
  if (botCount === 3) return 15;
  if (botCount === 2) return 10;
  return 0;
}

export function SaleForm({ onSuccess }: { onSuccess: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  const [clientId, setClientId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Lista de produtos selecionados (cada um é um bot diferente)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([""]);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setClients(d); });
    fetch("/api/products").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setProducts(d); });
    fetch("/api/staff").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setStaffList(d); });
  }, []);

  // Contar bots reais selecionados (excluindo "outros" e vazios)
  const filledProducts = selectedProductIds.filter(id => id && id !== "__other__");
  const botCount = filledProducts.length;

  // Desconto automático
  const autoDiscount = getAutoDiscount(botCount);

  // Subtotal
  const subtotal = selectedProductIds.reduce((acc, id) => {
    if (!id || id === "__other__") return acc;
    const p = products.find(p => p.id === id);
    return acc + (p ? p.price : 0);
  }, 0);

  const discountAmount = subtotal * (autoDiscount / 100);
  const total = subtotal - discountAmount;

  function addProductLine() {
    setSelectedProductIds(prev => [...prev, ""]);
  }

  function removeProductLine(index: number) {
    setSelectedProductIds(prev => prev.filter((_, i) => i !== index));
  }

  function updateProduct(index: number, productId: string) {
    setSelectedProductIds(prev => prev.map((id, i) => i === index ? productId : id));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = () => setReceiptPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removeFile() {
    setReceiptFile(null); setReceiptPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");

    const clientName = clients.find((c) => c.id === clientId)?.name || "";
    const staffName = staffList.find((s) => s.id === staffId)?.displayName || "";

    const productNames = selectedProductIds
      .filter(id => id)
      .map(id => id === "__other__" ? "Outros" : products.find(p => p.id === id)?.name || "")
      .filter(Boolean)
      .join(", ");

    if (!clientName || !productNames || !staffName || total <= 0) {
      setError("Preencha todos os campos obrigatórios");
      setLoading(false); return;
    }

    let receiptUrl: string | undefined;
    if (receiptFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", receiptFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      setUploading(false);
      if (uploadRes.ok) { receiptUrl = (await uploadRes.json()).url; }
      else { setError("Erro ao enviar comprovante"); setLoading(false); return; }
    }

    const notesWithDiscount = [
      notes,
      autoDiscount > 0 ? `Desconto ${autoDiscount}% (${botCount} bots) — -R$${discountAmount.toFixed(2)}` : ""
    ].filter(Boolean).join(" | ");

    const res = await fetch("/api/sales", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: clientName,
        product: productNames,
        value: total,
        notes: notesWithDiscount || undefined,
        staffName,
        receipt: receiptUrl
      }),
    });

    setLoading(false);
    if (res.ok) {
      toast("Venda registrada com sucesso");
      setClientId(""); setStaffId(""); setNotes("");
      setSelectedProductIds([""]);
      removeFile(); onSuccess();
    } else {
      toast((await res.json()).error || "Erro ao registrar venda", "error");
    }
  }

  const staffOptions = staffList.map((s) => ({ value: s.id, label: `${s.displayName} (@${s.username})` }));
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));
  const productOptions = [
    ...products.map((p) => ({ value: p.id, label: `${p.name} — R$${p.price.toFixed(2).replace(".", ",")}` })),
    { value: "__other__", label: "Outros (preço personalizado)" },
  ];

  return (
    <form onSubmit={handleSubmit} className="rounded-lg p-6" style={cardStyle}>
      <h2 className="text-sm font-semibold text-silver/60 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Plus className="w-4 h-4" /> Nova Venda
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-silver/40 mb-1.5">Vendedor *</label>
          <CustomSelect value={staffId} onChange={setStaffId} options={staffOptions} placeholder="Selecione o vendedor" required />
        </div>
        <div>
          <label className="block text-xs text-silver/40 mb-1.5">Cliente *</label>
          <CustomSelect value={clientId} onChange={setClientId} options={clientOptions} placeholder="Selecione um cliente" required />
        </div>
      </div>

      {/* Produtos */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-silver/40">Bots / Produtos *</label>
          <button type="button" onClick={addProductLine}
            className="text-xs text-silver/40 hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
            <Plus className="w-3 h-3" /> Adicionar bot
          </button>
        </div>

        <div className="space-y-2">
          {selectedProductIds.map((productId, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <CustomSelect
                  value={productId}
                  onChange={(v) => updateProduct(index, v)}
                  options={productOptions}
                  placeholder="Selecione um bot/produto"
                  required={index === 0}
                />
              </div>
              {index > 0 && (
                <button type="button" onClick={() => removeProductLine(index)}
                  className="p-2 rounded-lg text-silver/40 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Regras de desconto */}
        <div className="flex items-center gap-4 mt-3 text-xs text-silver/40">
          <span>% descontos:</span>
          {[
            { count: 2, pct: 10 },
            { count: 3, pct: 15 },
            { count: 4, pct: 20, plus: true },
          ].map(({ count, pct, plus }) => (
            <span key={count} className="flex items-center gap-1">
              <span>{count}{plus ? "+" : ""} bots →</span>
              <span className={botCount >= count ? "text-green-400 font-semibold" : "text-silver/30"}>
                {pct}% OFF
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Resumo de valores */}
      {subtotal > 0 && (
        <div className="mb-4 p-4 rounded-lg space-y-1.5"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex justify-between text-sm text-silver/60">
            <span>Subtotal</span>
            <span>R${subtotal.toFixed(2).replace(".", ",")}</span>
          </div>
          {autoDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-400">
              <span>Desconto ({autoDiscount}% — {botCount} bots)</span>
              <span>-R${discountAmount.toFixed(2).replace(".", ",")}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold pt-1"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span>Total</span>
            <span className="text-green-400">R${total.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-silver/40 mb-1.5">Observações</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Opcional" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
        </div>
        <div>
          <label className="block text-xs text-silver/40 mb-1.5">Comprovante</label>
          <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
          {receiptPreview ? (
            <div className="relative rounded-lg overflow-hidden w-fit" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              {receiptFile?.type.startsWith("image/") ? (
                <img src={receiptPreview} alt="Comprovante" className="h-[42px] object-cover" />
              ) : (
                <div className="flex items-center gap-2 p-3 text-xs text-silver/60"><ImageIcon className="w-4 h-4" />{receiptFile?.name}</div>
              )}
              <button type="button" onClick={removeFile} className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white cursor-pointer hover:bg-red-500/80 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 py-2.5 px-4 rounded-lg text-xs text-silver/40 transition-colors cursor-pointer hover:text-white"
              style={{ border: "1px dashed rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.02)" }}>
              <Upload className="w-4 h-4" /> Anexar comprovante
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button type="submit" disabled={loading || uploading}
        className="bg-white text-black font-medium px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center gap-2 cursor-pointer">
        {loading || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {uploading ? "Enviando..." : loading ? "Salvando..." : "Registrar"}
      </button>
    </form>
  );
}
