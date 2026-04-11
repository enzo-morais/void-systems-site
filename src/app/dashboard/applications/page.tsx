"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, FileText, CheckCircle, XCircle, Clock, ChevronDown, User } from "lucide-react";
import { useToast } from "@/components/dashboard/toast";
import { ConfirmModal } from "@/components/dashboard/confirm-modal";
import { useConfirm } from "@/hooks/use-confirm";

interface Application {
  id: string; name: string; age: string; discordId: string; discord: string;
  why: string; experience: string; hours: string; extra: string | null;
  status: string; reviewedBy: string | null; createdAt: string;
}

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" };
const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", label: "Pendente" },
  approved: { bg: "rgba(34,197,94,0.1)", color: "#22c55e", label: "Aprovado" },
  rejected: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", label: "Reprovado" },
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { confirm, modalProps } = useConfirm();

  const fetchApps = useCallback(async () => {
    const res = await fetch("/api/applications");
    if (res.ok) setApps(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  async function handleStatus(id: string, status: "approved" | "rejected") {
    const label = status === "approved" ? "aprovar" : "reprovar";
    const ok = await confirm({
      title: status === "approved" ? "Aprovar candidatura" : "Reprovar candidatura",
      message: `Tem certeza que deseja ${label} esta candidatura?`,
      confirmText: status === "approved" ? "Aprovar" : "Reprovar",
      danger: status === "rejected",
    });
    if (!ok) return;

    setUpdatingId(id);
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    if (res.ok) {
      toast(status === "approved" ? "Candidatura aprovada" : "Candidatura reprovada", status === "approved" ? "success" : "error");
      fetchApps();
    }
  }

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);
  const counts = { all: apps.length, pending: apps.filter((a) => a.status === "pending").length, approved: apps.filter((a) => a.status === "approved").length, rejected: apps.filter((a) => a.status === "rejected").length };

  if (loading) return <div className="flex items-center justify-center py-20 text-silver/40"><Loader2 className="w-5 h-5 animate-spin mr-2" />Carregando...</div>;

  return (
    <div className="space-y-6">
      <ConfirmModal {...modalProps} />
      <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6" /> Formulários</h1>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => {
          const labels: Record<string, string> = { all: "Todos", pending: "Pendentes", approved: "Aprovados", rejected: "Reprovados" };
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="text-xs px-4 py-2 rounded-full transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: filter === f ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
                border: `1px solid rgba(255,255,255,${filter === f ? 0.2 : 0.06})`,
                color: filter === f ? "#fff" : "rgba(192,192,192,0.5)",
              }}
            >
              {labels[f]} ({counts[f]})
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-silver/30 text-sm">Nenhum formulário encontrado.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const st = statusColors[app.status];
            const expanded = expandedId === app.id;
            return (
              <div key={app.id} className="rounded-lg overflow-hidden" style={cardStyle}>
                {/* Header */}
                <button
                  onClick={() => setExpandedId(expanded ? null : app.id)}
                  className="w-full flex items-center gap-4 p-4 text-left cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <User className="w-4 h-4 text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{app.name}</p>
                    <p className="text-[10px] text-silver/30">{app.discord} · {new Date(app.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                  <ChevronDown className="w-4 h-4 text-silver/30 shrink-0 transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }} />
                </button>

                {/* Expanded content */}
                {expanded && (
                  <div className="px-4 pb-4 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div><p className="text-[10px] text-silver/30 uppercase mb-1">Idade</p><p className="text-sm">{app.age}</p></div>
                      <div><p className="text-[10px] text-silver/30 uppercase mb-1">Discord ID</p><p className="text-sm font-mono">{app.discordId}</p></div>
                      <div><p className="text-[10px] text-silver/30 uppercase mb-1">Horas por dia</p><p className="text-sm">{app.hours}</p></div>
                      {app.reviewedBy && <div><p className="text-[10px] text-silver/30 uppercase mb-1">Analisado por</p><p className="text-sm">{app.reviewedBy}</p></div>}
                    </div>
                    <div><p className="text-[10px] text-silver/30 uppercase mb-1">Por que quer entrar?</p><p className="text-sm text-silver/60 leading-relaxed">{app.why}</p></div>
                    <div><p className="text-[10px] text-silver/30 uppercase mb-1">Experiência</p><p className="text-sm text-silver/60 leading-relaxed">{app.experience}</p></div>
                    {app.extra && <div><p className="text-[10px] text-silver/30 uppercase mb-1">Observações</p><p className="text-sm text-silver/60 leading-relaxed">{app.extra}</p></div>}

                    {app.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => handleStatus(app.id, "approved")} disabled={updatingId === app.id}
                          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-medium transition-all cursor-pointer disabled:opacity-50"
                          style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}
                        >
                          {updatingId === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Aprovar
                        </button>
                        <button onClick={() => handleStatus(app.id, "rejected")} disabled={updatingId === app.id}
                          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-medium transition-all cursor-pointer disabled:opacity-50"
                          style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                        >
                          {updatingId === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} Reprovar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
