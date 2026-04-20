"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, Upload, X, Image as ImageIcon, Trash2 } from "lucide-react";
import { CustomSelect } from "./custom-select";
import { useToast } from "./toast";

interface Client { id: string; name: string; }
interface Product { id: string; name: string; price: number; }
interface Staff { id: string; displayName: string; username: string; }
interface SelectedProduct { productId: string; quantity: number; }

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" };
const inputClass = "w-full bg-black/40 border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-silver/30 backdrop-blur-sm";

export function SaleForm({ onSuccess }: { onSuccess: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  const [clientId, setClientId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState("0");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Multi-produto
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([{ productId: "", quantity: 1 }]);

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

  // Calcular subtotal
  const subtotal = selectedProducts.reduce((acc, sp) => {
    if (sp.productId === "__other__") return acc;
    const p = products.find(p => p.id === sp.productId);
    return acc + (p ? p.price * sp.quantity : 0);
  }, 0);

  const discountPct = parseFloat(discount) || 0;
  const discountAmount = subtotal * (discountPct / 100);
  const total = subtotal - discountAmount;

  // Adicionar linha de produto
  function addProductLine() {
    setSelectedProducts(prev => [...prev, { productId: "", quantity: 1 }]);
  }

  // Remover linha de produto
  function removeProductLine(index: number) {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  }

  // Atualizar produto selecionado
  function updateProduct(index: number, productId: string) {
    setSelectedProducts(prev => prev.map((sp, i) => i === index ? { ...sp, productId } : sp));
  }

  // Atualizar quantidade
  function updateQuantity(index: number, quantity: number) {
    setSelectedProducts(prev => prev.map((sp, i) => i === index ? { ...sp, quantity: Math.max(1, quantity) } : sp));
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

    // Montar nome dos produtos
    const productNames = selectedProducts
      .filter(sp => sp.productId)
      .map(sp => {
        if (sp.productId === "__other__") return "Outros";
        const p = products.find(p => p.id === sp.productId);
        return p ? (sp.quantity > 1 ? `${p.name} x${sp.quantity}` : p.name) : "";
      })
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

    // Montar observações com desconto
    const notesWithDiscount = [
      notes,
      discountPct > 0 ? `Desconto: ${discountPct}% (-R$${discountAmount.toFixed(2)})` : ""
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
      setClientId(""); setStaffId(""); setNotes(""); setDiscount("0");
      setSelectedProducts([{ productId: "", quantity: 1 }]);
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
          <label className="text-xs text-silver/40">Produtos *</label>
          <button type="button" onClick={addProductLine}
            className="text-xs text-silver/40 hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
            <Plus className="w-3 h-3" /> Adicionar produto
          </button>
        </div>

        <div className="space-y-2">
          {selectedProducts.map((sp, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <CustomSelect
                  value={sp.productId}
                  onChange={(v) => updateProduct(index, v)}
                  options={productOptions}
                  placeholder="Selecione um produto"
                  required={index === 0}
                />
              </div>
              <div className="w-20">
                <input
                  type="number"
                  min="1"
                  value={sp.quantity}
                  onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                  className={inputClass}
                  style={{ borderColor: "rgba(255,255,255,0.1)" }}
                  title="Quantidade"
                />
              </div>
              {index > 0 && (
                <button type="button" onClick={() => removeProductLine(index)}
                  className="p-2 rounded-lg text-silver/40 hover:text-red-400 transition-colors cursor-pointer"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {/* Desconto */}
        <div>
          <label className="block text-xs text-silver/40 mb-1.5">Desconto (%)</label>
          <input
            type="number" min="0" max="100" step="1"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="0"
            className={inputClass}
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          />
        </div>

        {/* Total calculado */}
        <div>
          <label className="block text-xs text-silver/40 mb-1.5">Total</label>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm"
            style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <span className="text-green-400 font-semibold">
              R${total.toFixed(2).replace(".", ",")}
            </span>
            {discountPct > 0 && (
              <span className="text-xs text-silver/40 line-through ml-1">
                R${subtotal.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-xs text-silver/40 mb-1.5">Observações</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Opcional" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
        </div>
      </div>

      {/* Comprovante */}
      <div className="mb-4">
        <label className="block text-xs text-silver/40 mb-1.5">Comprovante</label>
        <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
        {receiptPreview ? (
          <div className="relative rounded-lg overflow-hidden w-fit" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            {receiptFile?.type.startsWith("image/") ? (
              <img src={receiptPreview} alt="Comprovante" className="h-16 object-cover" />
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

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button type="submit" disabled={loading || uploading}
        className="bg-white text-black font-medium px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center gap-2 cursor-pointer">
        {loading || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {uploading ? "Enviando..." : loading ? "Salvando..." : "Registrar"}
      </button>
    </form>
  );
}
