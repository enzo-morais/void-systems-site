"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { CustomSelect } from "./custom-select";
import { useToast } from "./toast";

interface Client { id: string; name: string; }
interface Product { id: string; name: string; price: number; }
interface Staff { id: string; displayName: string; username: string; }

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" };
const inputClass = "w-full bg-black/40 border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-silver/30 backdrop-blur-sm";

export function SaleForm({ onSuccess }: { onSuccess: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isOther = productId === "__other__";
  const selectedProduct = products.find((p) => p.id === productId);

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setClients(d); });
    fetch("/api/products").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setProducts(d); });
    fetch("/api/staff").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setStaffList(d); });
  }, []);

  useEffect(() => {
    if (selectedProduct && !isOther) setValue(selectedProduct.price.toString());
    if (isOther) setValue("");
  }, [productId, selectedProduct, isOther]);

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
    const productName = isOther ? "Outros" : selectedProduct?.name || "";
    const staffName = staffList.find((s) => s.id === staffId)?.displayName || "";
    const finalValue = parseFloat(value);

    if (!clientName || !productName || !staffName || isNaN(finalValue)) {
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

    const res = await fetch("/api/sales", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client: clientName, product: productName, value: finalValue, notes: notes || undefined, staffName, receipt: receiptUrl }),
    });

    setLoading(false);
    if (res.ok) {
      toast("Venda registrada com sucesso");
      setClientId(""); setProductId(""); setStaffId(""); setValue(""); setNotes("");
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs text-silver/40 mb-1.5">Vendedor *</label>
          <CustomSelect value={staffId} onChange={setStaffId} options={staffOptions} placeholder="Selecione o vendedor" required />
        </div>
        <div>
          <label className="block text-xs text-silver/40 mb-1.5">Cliente *</label>
          <CustomSelect value={clientId} onChange={setClientId} options={clientOptions} placeholder="Selecione um cliente" required />
        </div>
        <div>
          <label className="block text-xs text-silver/40 mb-1.5">Produto *</label>
          <CustomSelect value={productId} onChange={setProductId} options={productOptions} placeholder="Selecione um produto" required />
        </div>
        <div>
          <label className="block text-xs text-silver/40 mb-1.5">Valor (R$) *{!isOther && selectedProduct && <span className="ml-2 text-green-400/60">Fixo</span>}</label>
          <input type="number" step="0.01" min="0" value={value}
            onChange={(e) => { if (isOther) setValue(e.target.value); }}
            required placeholder="0,00" className={inputClass}
            style={{ borderColor: "rgba(255,255,255,0.1)", opacity: !isOther && selectedProduct ? 0.6 : 1, cursor: !isOther && selectedProduct ? "not-allowed" : "text" }}
            readOnly={!isOther && !!selectedProduct}
          />
        </div>
        <div>
          <label className="block text-xs text-silver/40 mb-1.5">Observações</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
        </div>
        <div>
          <label className="block text-xs text-silver/40 mb-1.5">Comprovante</label>
          <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
          {receiptPreview ? (
            <div className="relative rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              {receiptFile?.type.startsWith("image/") ? (
                <img src={receiptPreview} alt="Comprovante" className="w-full h-[42px] object-cover" />
              ) : (
                <div className="flex items-center gap-2 p-3 text-xs text-silver/60"><ImageIcon className="w-4 h-4" />{receiptFile?.name}</div>
              )}
              <button type="button" onClick={removeFile} className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white cursor-pointer hover:bg-red-500/80 transition-colors"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs text-silver/40 transition-colors cursor-pointer hover:text-white"
              style={{ border: "1px dashed rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.02)" }}
            ><Upload className="w-4 h-4" />Anexar comprovante</button>
          )}
        </div>
      </div>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <button type="submit" disabled={loading || uploading} className="bg-white text-black font-medium px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center gap-2 cursor-pointer">
        {loading || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {uploading ? "Enviando..." : loading ? "Salvando..." : "Registrar"}
      </button>
    </form>
  );
}
