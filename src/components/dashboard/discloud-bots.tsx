"use client";

import { useState, useEffect, useCallback } from "react";
import { Bot, Play, Square, RotateCw, RefreshCw, AlertCircle, Activity, Clock } from "lucide-react";

interface DiscloudBot {
  id: string;
  name: string;
  discloudAppId: string;
  status: string;
  lastAction: string | null;
  createdAt: string;
}

interface BotLog {
  id: string;
  action: string;
  details: string | null;
  staffName: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; pulse: boolean }> = {
  online:   { color: "#22c55e", bg: "rgba(34,197,94,0.12)",   label: "Online",      pulse: true  },
  offline:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   label: "Offline",     pulse: false },
  starting: { color: "#eab308", bg: "rgba(234,179,8,0.12)",   label: "Iniciando...", pulse: true  },
  stopping: { color: "#f97316", bg: "rgba(249,115,22,0.12)",  label: "Parando...",  pulse: true  },
  error:    { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   label: "Erro",        pulse: false },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.offline;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.pulse ? "animate-pulse" : ""}`}
        style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

export function DiscloudBots() {
  const [bots, setBots] = useState<DiscloudBot[]>([]);
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bots" | "logs">("bots");

  const loadBots = useCallback(async () => {
    try {
      const res = await fetch("/api/bots");
      if (!res.ok) throw new Error("Erro ao carregar bots");
      const data = await res.json();
      setBots(data.bots ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/bots/logs");
      if (res.ok) setLogs(await res.json());
    } catch {}
  }, []);

  // Polling de status a cada 30s
  useEffect(() => {
    loadBots();
    loadLogs();
    const interval = setInterval(() => {
      refreshAllStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadBots, loadLogs]);

  async function refreshAllStatus() {
    try {
      const res = await fetch("/api/bots");
      if (!res.ok) return;
      const data = await res.json();
      // Para cada bot, busca status real da Discloud
      const updated = await Promise.all(
        (data.bots ?? []).map(async (bot: DiscloudBot) => {
          try {
            const r = await fetch(`/api/bots/${bot.id}`);
            if (r.ok) {
              const d = await r.json();
              return { ...bot, status: d.status?.status ?? bot.status };
            }
          } catch {}
          return bot;
        })
      );
      setBots(updated);
    } catch {}
  }

  async function handleAction(botId: string, action: "start" | "stop" | "restart") {
    setActionLoading(`${botId}-${action}`);
    setError(null);
    try {
      const res = await fetch(`/api/bots/${botId}/${action}`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || `Erro ao ${action}`);
      }
      const statusMap = { start: "starting", stop: "stopping", restart: "starting" };
      setBots(prev => prev.map(b => b.id === botId ? { ...b, status: statusMap[action] } : b));
      loadLogs();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRefresh(botId: string) {
    setActionLoading(`${botId}-refresh`);
    try {
      const res = await fetch(`/api/bots/${botId}`);
      if (res.ok) {
        const d = await res.json();
        setBots(prev => prev.map(b => b.id === botId ? { ...b, status: d.status?.status ?? b.status } : b));
      }
    } catch {}
    setActionLoading(null);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30" />
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-purple-400" />
          Meus Bots
        </h1>
        <p className="text-silver/50 mt-1 text-sm">Gerencie seus bots hospedados na Discloud</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg w-fit"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {(["bots", "logs"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer capitalize"
            style={{
              background: activeTab === tab ? "rgba(255,255,255,0.1)" : "transparent",
              color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.4)"
            }}>
            {tab === "bots" ? "Bots" : "Logs"}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm text-red-400"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Bots Tab */}
      {activeTab === "bots" && (
        <div className="space-y-4">
          {bots.length === 0 ? (
            <div className="text-center py-20 text-silver/30">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Nenhum bot atribuído ainda</p>
            </div>
          ) : bots.map(bot => (
            <div key={bot.id} className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)" }}>
                    <Bot className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{bot.name}</h3>
                    <p className="text-xs text-silver/40 font-mono mt-0.5">{bot.discloudAppId}</p>
                  </div>
                </div>
                <StatusBadge status={bot.status} />
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mb-5 text-xs text-silver/40">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {bot.lastAction ? `Última ação: ${new Date(bot.lastAction).toLocaleString("pt-BR")}` : "Sem ações recentes"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {bot.status === "online" ? (
                  <button onClick={() => handleAction(bot.id, "stop")}
                    disabled={!!actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <Square className="w-4 h-4" /> Parar
                  </button>
                ) : (
                  <button onClick={() => handleAction(bot.id, "start")}
                    disabled={!!actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
                    style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <Play className="w-4 h-4" /> Iniciar
                  </button>
                )}

                <button onClick={() => handleAction(bot.id, "restart")}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <RotateCw className={`w-4 h-4 ${actionLoading === `${bot.id}-restart` ? "animate-spin" : ""}`} />
                  Reiniciar
                </button>

                <button onClick={() => handleRefresh(bot.id)}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-50 ml-auto"
                  style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
                  title="Atualizar status">
                  <RefreshCw className={`w-4 h-4 ${actionLoading === `${bot.id}-refresh` ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {logs.length === 0 ? (
            <div className="text-center py-16 text-silver/30">
              <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>Nenhuma ação registrada</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {logs.map(log => {
                const actionColors: Record<string, string> = {
                  bot_start: "#22c55e", bot_stop: "#ef4444", bot_restart: "#eab308"
                };
                const color = actionColors[log.action] ?? "#a1a1aa";
                return (
                  <div key={log.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <div>
                        <p className="text-sm">{log.details || log.action}</p>
                        <p className="text-xs text-silver/40 mt-0.5">por {log.staffName}</p>
                      </div>
                    </div>
                    <span className="text-xs text-silver/30 shrink-0">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
