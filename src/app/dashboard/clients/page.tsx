"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, CheckCircle, Trash2, Users, Bot } from "lucide-react";
import { ConfirmModal } from "@/components/dashboard/confirm-modal";
import { useConfirm } from "@/hooks/use-confirm";

interface Client {
  id: string; name: string; discordId: string | null; email: string | null; notes: string | null; status: string; createdAt: string;
}

interface DiscloudBot {
  id: string; name: string; discloudAppId: string; status: string; userId: string;
}

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" };
const inputClass = "w-full bg-black/40 border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-silver/30 backdrop-blur-sm";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { confirm, modalProps } = useConfirm();

  // Bot assignment state
  const [bots, setBots] = useState<DiscloudBot[]>([]);
  const [botClientDiscordId, setBotClientDiscordId] = useState("");
  const [botAppId, setBotAppId] = useState("");
  const [botName, setBotName] = useState("");
  const [botSaving, setBotSaving] = useState(false);
  const [botSuccess, setBotSuccess] = useState(false);
  const [botError, setBotError] = useState("");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/clients");
    if (res.ok) setClients(await res.json());
    setLoading(false);
  }, []);

  const fetchBots = useCallback(async () => {
    const res = await fetch("/api/staff/bots");
    if (res.ok) setBots(await res.json());
  }, []);

  useEffect(() => { fetchClients(); fetchBots(); }, [fetchClients, fetchBots]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/clients", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, discordId: discordId || undefined, email: email || undefined, notes: notes || undefined }),
    });
    setSaving(false);
    if (res.ok) {
      setName(""); setDiscordId(""); setEmail(""); setNotes("");
      setSuccess(true); fetchClients();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({ title: "Deletar cliente", message: "Tem certeza que deseja remover este cliente?", confirmText: "Deletar" });
    if (!ok) return;
    setDeletingId(id);
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setDeletingId(null);
    fetchClients();
  }

  async function handleAssignBot(e: React.FormEvent) {
    e.preventDefault();
    setBotSaving(true);
    setBotError("");
    const res = await fetch("/api/staff/bots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientDiscordId: botClientDiscordId, discloudAppId: botAppId, name: botName }),
    });
    const data = await res.json();
    setBotSaving(false);
    if (res.ok) {
      setBotClientDiscordId(""); setBotAppId(""); setBotName("");
      setBotSuccess(true); fetchBots();
      setTimeout(() => setBotSuccess(false), 3000);
    } else {
      setBotError(data.error || "Erro ao atribuir bot");
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> Clientes</h1>
      <ConfirmModal {...modalProps} />

      <form onSubmit={handleSubmit} className="rounded-lg p-6" style={cardStyle}>
        <h2 className="text-sm font-semibold text-silver/60 uppercase tracking-wider mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Novo Cliente</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Nome *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nome do cliente" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Discord ID</label>
            <input type="text" value={discordId} onChange={(e) => setDiscordId(e.target.value)} placeholder="ID do Discord" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Observações</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
        </div>
        {success && <p className="text-green-400 text-sm mb-4 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Cliente adicionado</p>}
        <button type="submit" disabled={saving} className="bg-white text-black font-medium px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center gap-2 cursor-pointer">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {saving ? "Salvando..." : "Adicionar"}
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-silver/40"><Loader2 className="w-5 h-5 animate-spin mr-2" />Carregando...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 text-silver/30 text-sm">Nenhum cliente cadastrado.</div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={cardStyle}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Nome</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Discord</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Data</th>
                <th className="px-5 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                >
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-silver/50 font-mono text-xs">{c.discordId || "—"}</td>
                  <td className="px-5 py-3 text-silver/50">{c.email || "—"}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: c.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: c.status === "active" ? "#22c55e" : "#ef4444" }}>
                      {c.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-silver/40">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="p-1.5 rounded-md transition-colors cursor-pointer" style={{ color: "#666" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239,68,68,0.1)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#666"; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                    >
                      {deletingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Seção de Bots */}
      <h2 className="text-xl font-bold flex items-center gap-2 pt-4"><Bot className="w-5 h-5" /> Bots dos Clientes</h2>

      <form onSubmit={handleAssignBot} className="rounded-lg p-6" style={cardStyle}>
        <h2 className="text-sm font-semibold text-silver/60 uppercase tracking-wider mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Atribuir Bot a Cliente</h2>
        <p className="text-xs text-silver/40 mb-4">O cliente precisa ter feito login no site pelo menos uma vez com o Discord.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Discord ID do Cliente *</label>
            <input type="text" value={botClientDiscordId} onChange={(e) => setBotClientDiscordId(e.target.value)} required placeholder="ID do Discord do cliente" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">App ID da Discloud *</label>
            <input type="text" value={botAppId} onChange={(e) => setBotAppId(e.target.value)} required placeholder="Ex: 1775616670965" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Nome do Bot *</label>
            <input type="text" value={botName} onChange={(e) => setBotName(e.target.value)} required placeholder="Ex: VØID Ticket" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
        </div>
        {botError && <p className="text-red-400 text-sm mb-4">{botError}</p>}
        {botSuccess && <p className="text-green-400 text-sm mb-4 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Bot atribuído com sucesso!</p>}
        <button type="submit" disabled={botSaving} className="bg-white text-black font-medium px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center gap-2 cursor-pointer">
          {botSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
          {botSaving ? "Atribuindo..." : "Atribuir Bot"}
        </button>
      </form>

      {bots.length > 0 && (
        <div className="rounded-lg overflow-hidden" style={cardStyle}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Bot</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">App ID</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">User ID</th>
              </tr>
            </thead>
            <tbody>
              {bots.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-5 py-3 font-medium flex items-center gap-2"><Bot className="w-4 h-4 text-purple-400" />{b.name}</td>
                  <td className="px-5 py-3 text-silver/50 font-mono text-xs">{b.discloudAppId}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: b.status === "online" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: b.status === "online" ? "#22c55e" : "#ef4444" }}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-silver/40 font-mono text-xs">{b.userId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
