"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bot, Play, Square, RotateCw, RefreshCw, AlertCircle, Clock, Terminal, ChevronDown } from "lucide-react";

interface DiscloudBot {
  id: string;
  name: string;
  discloudAppId: string;
  status: string;
  lastAction: string | null;
  botAvatar?: string | null;
  botClientId?: string | null;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  online:   { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  label: "Online"      },
  offline:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  label: "Offline"     },
  starting: { color: "#eab308", bg: "rgba(234,179,8,0.12)",  label: "Iniciando..."  },
  stopping: { color: "#f97316", bg: "rgba(249,115,22,0.12)", label: "Parando..."  },
  error:    { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  label: "Erro"        },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.offline;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <span className={`w-1.5 h-1.5 rounded-full ${["online","starting","stopping"].includes(status) ? "animate-pulse" : ""}`}
        style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

// Colorir linhas do terminal como a Discloud
function colorizeLog(line: string): React.ReactNode {
  if (!line) return null;

  // Detectar prefixos de cor da Discloud (emojis/símbolos)
  const patterns: { test: RegExp; color: string }[] = [
    { test: /erro|error|fatal|exception/i,    color: "#ef4444" },
    { test: /warn|aviso/i,                    color: "#eab308" },
    { test: /online|pronto|ready|started/i,   color: "#22c55e" },
    { test: /carregando|loading|iniciando/i,  color: "#60a5fa" },
    { test: /comando|command|event|evento/i,  color: "#a78bfa" },
  ];

  let color = "#86efac"; // verde claro padrão
  for (const p of patterns) {
    if (p.test.test(line)) { color = p.color; break; }
  }

  // Timestamp no início
  const tsMatch = line.match(/^(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\s*(.*)/);
  if (tsMatch) {
    return (
      <span>
        <span style={{ color: "#4b5563" }}>{tsMatch[1]} </span>
        <span style={{ color }}>{tsMatch[2]}</span>
      </span>
    );
  }

  return <span style={{ color }}>{line}</span>;
}

function BotTerminal({ botId, botName }: { botId: string; botName: string }) {
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [autoReload, setAutoReload] = useState(false);
  const termRef = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/bots/${botId}/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs ?? "");
        // Auto scroll para o fim
        setTimeout(() => {
          if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
        }, 50);
      }
    } catch {}
    setLoading(false);
  }, [botId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!autoReload) return;
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [autoReload, fetchLogs]);

  const lines = logs.split("\n").filter(Boolean);

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-silver/50" />
          <span className="text-xs text-silver/50 font-mono">{botName} — console</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-silver/40 cursor-pointer select-none">
            <input type="checkbox" checked={autoReload} onChange={e => setAutoReload(e.target.checked)}
              className="w-3 h-3 accent-purple-500" />
            Auto reload
          </label>
          <button onClick={fetchLogs}
            className="text-xs text-silver/40 hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
            <RefreshCw className="w-3 h-3" /> Atualizar
          </button>
          <button onClick={() => {
            if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
          }} className="text-xs text-silver/40 hover:text-white transition-colors cursor-pointer">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal body */}
      <div ref={termRef}
        className="h-80 overflow-y-auto p-4 font-mono text-xs leading-5 space-y-0.5"
        style={{ background: "#0a0a0a" }}>
        {loading ? (
          <span className="text-silver/30">Carregando logs...</span>
        ) : lines.length === 0 ? (
          <span className="text-silver/30">Nenhum log disponível</span>
        ) : lines.map((line, i) => (
          <div key={i}>{colorizeLog(line)}</div>
        ))}
      </div>
    </div>
  );
}

export function DiscloudBots() {
  const [bots, setBots] = useState<DiscloudBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openLogs, setOpenLogs] = useState<string | null>(null);

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

  // Polling de status a cada 30s
  useEffect(() => {
    loadBots();
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/bots");
        if (!res.ok) return;
        const data = await res.json();
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
    }, 30000);
    return () => clearInterval(interval);
  }, [loadBots]);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-purple-400" />
          Meus Bots
        </h1>
        <p className="text-silver/50 mt-1 text-sm">Gerencie seus bots hospedados na Discloud</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm text-red-400"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {bots.length === 0 ? (
        <div className="text-center py-20 text-silver/30">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Nenhum bot atribuído ainda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bots.map(bot => (
            <div key={bot.id} className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {/* Bot card */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
                      style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)" }}>
                      {bot.botAvatar
                        ? <img src={bot.botAvatar} alt={bot.name} className="w-full h-full object-cover" />
                        : <Bot className="w-6 h-6 text-purple-400" />
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{bot.name}</h3>
                      <p className="text-xs text-silver/40 font-mono mt-0.5">{bot.discloudAppId}</p>
                    </div>
                  </div>
                  <StatusBadge status={bot.status} />
                </div>

                <div className="flex items-center gap-4 mb-5 text-xs text-silver/40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {bot.lastAction
                      ? `Última ação: ${new Date(bot.lastAction).toLocaleString("pt-BR")}`
                      : "Sem ações recentes"}
                  </span>
                </div>

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

                  <button
                    onClick={() => setOpenLogs(openLogs === bot.id ? null : bot.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                    style={{
                      background: openLogs === bot.id ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)",
                      color: openLogs === bot.id ? "#a78bfa" : "rgba(255,255,255,0.4)",
                      border: `1px solid ${openLogs === bot.id ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.08)"}`
                    }}>
                    <Terminal className="w-4 h-4" />
                    Console
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

              {/* Terminal */}
              {openLogs === bot.id && (
                <div className="px-6 pb-6">
                  <BotTerminal botId={bot.id} botName={bot.name} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
