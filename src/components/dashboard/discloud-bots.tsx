"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bot, Play, Square, RotateCw, RefreshCw, AlertCircle, Clock, Terminal, ChevronDown, Cpu, MemoryStick } from "lucide-react";
import "./panel-theme.css";

interface DiscloudBot {
  id: string;
  name: string;
  discloudAppId: string;
  status: string;
  lastAction: string | null;
  botAvatar?: string | null;
  botClientId?: string | null;
  /** Uso de memória informado pela Discloud (ex.: "32MB/100MB"). Sem ele, a tela mostra "Em breve". */
  memory?: string | null;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  online:   { color: "#22c55e", bg: "rgba(34,197,94,0.14)",  label: "Online"      },
  offline:  { color: "#ef4444", bg: "rgba(239,68,68,0.14)",  label: "Offline"     },
  starting: { color: "#eab308", bg: "rgba(234,179,8,0.14)",  label: "Iniciando..."  },
  stopping: { color: "#f97316", bg: "rgba(249,115,22,0.14)", label: "Parando..."  },
  error:    { color: "#ef4444", bg: "rgba(239,68,68,0.14)",  label: "Erro"        },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.offline;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}55` }}>
      <span className={`w-1.5 h-1.5 rounded-full ${["online","starting","stopping"].includes(status) ? "animate-pulse" : ""}`}
        style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

// Colorir linhas do terminal como a Discloud
function colorizeLog(line: string): React.ReactNode {
  if (!line) return null;

  const patterns: { test: RegExp; color: string }[] = [
    { test: /erro|error|fatal|exception/i,    color: "#f87171" },
    { test: /warn|aviso/i,                    color: "#facc15" },
    { test: /online|pronto|ready|started/i,   color: "#4ade80" },
    { test: /carregando|loading|iniciando/i,  color: "#60a5fa" },
    { test: /comando|command|event|evento/i,  color: "#b4a9ff" },
  ];

  let color = "#a7f3d0";
  for (const p of patterns) {
    if (p.test.test(line)) { color = p.color; break; }
  }

  const tsMatch = line.match(/^(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\s*(.*)/);
  if (tsMatch) {
    return (
      <span>
        <span style={{ color: "#6b7280" }}>{tsMatch[1]} </span>
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
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "#15151c", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-silver/70" />
          <span className="text-xs text-silver/80 font-mono">{botName} — console</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-silver/70 cursor-pointer select-none">
            <input type="checkbox" checked={autoReload} onChange={e => setAutoReload(e.target.checked)}
              className="w-3 h-3 accent-[#8f7dff]" />
            Auto reload
          </label>
          <button onClick={fetchLogs}
            className="text-xs text-silver/70 hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
            <RefreshCw className="w-3 h-3" /> Atualizar
          </button>
          <button onClick={() => {
            if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
          }} aria-label="Ir para o fim" className="text-xs text-silver/70 hover:text-white transition-colors cursor-pointer">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={termRef}
        className="h-72 overflow-y-auto p-4 font-mono text-xs leading-5 space-y-0.5"
        style={{ background: "#0a0a0d" }}>
        {loading ? (
          <span className="text-silver/70">Carregando logs...</span>
        ) : lines.length === 0 ? (
          <span className="text-silver/70">Nenhum log disponível</span>
        ) : lines.map((line, i) => (
          <div key={i}>{colorizeLog(line)}</div>
        ))}
      </div>
    </div>
  );
}

/** Últimas linhas do console, direto no card. */
function LogsPreview({ botId, refreshKey }: { botId: string; refreshKey: number }) {
  const [lines, setLines] = useState<string[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/bots/${botId}/logs`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        setLines(d ? String(d.logs ?? "").split("\n").filter(Boolean).slice(-5) : []);
      })
      .catch(() => alive && setLines([]));
    return () => { alive = false; };
  }, [botId, refreshKey]);

  return (
    <div className="rounded-lg p-3 font-mono text-[11px] leading-5" style={{ background: "#0a0a0d", border: "1px solid rgba(255,255,255,0.1)" }}>
      <p className="font-mono text-[10px] uppercase tracking-wider text-silver/70 mb-1.5">Últimos logs</p>
      {lines === null ? (
        <span className="text-silver/70">Carregando...</span>
      ) : lines.length === 0 ? (
        <span className="text-silver/70">Sem logs no momento</span>
      ) : (
        lines.map((l, i) => <div key={i} className="truncate">{colorizeLog(l)}</div>)
      )}
    </div>
  );
}

// Bots de exemplo, só para conferir o visual em desenvolvimento (?preview=1). Nunca aparecem em produção.
const DEV_PREVIEW_BOTS: DiscloudBot[] = [
  { id: "demo-1", name: "Bot de Ticket (exemplo)", discloudAppId: "000000000", status: "online", lastAction: new Date().toISOString(), memory: "42MB/100MB" },
  { id: "demo-2", name: "Bot de Registro (exemplo)", discloudAppId: "000000001", status: "offline", lastAction: null, memory: null },
];

export function DiscloudBots({ embedded = false }: { embedded?: boolean }) {
  const [bots, setBots] = useState<DiscloudBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openLogs, setOpenLogs] = useState<string | null>(null);
  const [logsKey, setLogsKey] = useState(0);
  const preview =
    process.env.NODE_ENV !== "production" && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "1";

  // Lê o status (e a memória) de cada bot na Discloud
  const enrich = useCallback(async (list: DiscloudBot[]) => {
    return Promise.all(
      list.map(async (bot) => {
        try {
          const r = await fetch(`/api/bots/${bot.id}`);
          if (r.ok) {
            const d = await r.json();
            return { ...bot, status: d.status?.status ?? bot.status, memory: d.status?.memory ?? bot.memory ?? null };
          }
        } catch {}
        return bot;
      })
    );
  }, []);

  const loadBots = useCallback(async () => {
    if (preview) {
      setBots(DEV_PREVIEW_BOTS);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/bots");
      if (!res.ok) throw new Error("Erro ao carregar bots");
      const data = await res.json();
      const list: DiscloudBot[] = data.bots ?? [];
      setBots(list);
      setLoading(false);
      setBots(await enrich(list));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar bots");
    } finally {
      setLoading(false);
    }
  }, [enrich, preview]);

  // Polling de status a cada 30s
  useEffect(() => {
    loadBots();
    if (preview) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/bots");
        if (!res.ok) return;
        const data = await res.json();
        setBots(await enrich(data.bots ?? []));
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [loadBots, enrich, preview]);

  async function handleAction(botId: string, action: "start" | "stop" | "restart") {
    if (preview) return;
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro na ação");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRefresh(botId: string) {
    if (preview) return;
    setActionLoading(`${botId}-refresh`);
    try {
      const res = await fetch(`/api/bots/${botId}`);
      if (res.ok) {
        const d = await res.json();
        setBots(prev => prev.map(b => b.id === botId ? { ...b, status: d.status?.status ?? b.status, memory: d.status?.memory ?? b.memory } : b));
        setLogsKey((k) => k + 1);
      }
    } catch {}
    setActionLoading(null);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/40" />
    </div>
  );

  return (
    <div className={embedded ? "" : "px-4 py-8 max-w-4xl mx-auto"}>
      <div className="mb-8">
        <h1 className="pt-title flex items-center gap-3">
          <Bot className="w-7 h-7 text-[var(--void-accent)]" />
          Meus bots
        </h1>
        <p className="pt-sub">Gerencie os bots hospedados da sua conta</p>
        {preview && <p className="mt-2"><span className="pt-soon">Exemplo de visual (dev)</span></p>}
      </div>

      {error && (
        <div role="alert" className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm text-red-300"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {bots.length === 0 ? (
        <div className="pt-card text-center py-16 px-6">
          <Bot className="w-10 h-10 mx-auto mb-3 text-silver/70" />
          <p className="text-silver/80">Nenhum bot atribuído ainda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bots.map(bot => (
            <div key={bot.id} className="pt-card overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
                      style={{ background: "linear-gradient(135deg, rgba(143,125,255,0.4), rgba(143,125,255,0.1))", border: "1px solid rgba(143,125,255,0.4)" }}>
                      {bot.botAvatar
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={bot.botAvatar} alt={bot.name} className="w-full h-full object-cover" />
                        : <Bot className="w-6 h-6 text-white" />
                      }
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-lg truncate">{bot.name}</h3>
                      <p className="text-xs text-silver/70 font-mono mt-0.5">{bot.discloudAppId}</p>
                    </div>
                  </div>
                  <StatusBadge status={bot.status} />
                </div>

                {/* indicadores */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <div className="rounded-lg px-3 py-2.5" style={{ background: "#15151c", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-silver/70 flex items-center gap-1.5 mb-1"><MemoryStick className="w-3 h-3" /> Memória</p>
                    {bot.memory ? <p className="text-sm font-medium">{bot.memory}</p> : <span className="pt-soon">Em breve</span>}
                  </div>
                  <div className="rounded-lg px-3 py-2.5" style={{ background: "#15151c", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-silver/70 flex items-center gap-1.5 mb-1"><Clock className="w-3 h-3" /> Última ação</p>
                    <p className="text-sm font-medium">{bot.lastAction ? new Date(bot.lastAction).toLocaleString("pt-BR") : "Sem ações recentes"}</p>
                  </div>
                  <div className="rounded-lg px-3 py-2.5" style={{ background: "#15151c", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-silver/70 flex items-center gap-1.5 mb-1"><Cpu className="w-3 h-3" /> Hospedagem</p>
                    <p className="text-sm font-medium">Discloud</p>
                  </div>
                </div>

                {/* últimos logs */}
                {!preview && <div className="mb-5"><LogsPreview botId={bot.id} refreshKey={logsKey} /></div>}

                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => handleAction(bot.id, "restart")}
                    disabled={!!actionLoading}
                    className="pt-btn pt-btn--primary">
                    <RotateCw className={`w-4 h-4 ${actionLoading === `${bot.id}-restart` ? "animate-spin" : ""}`} />
                    Reiniciar
                  </button>

                  {bot.status === "online" ? (
                    <button onClick={() => handleAction(bot.id, "stop")}
                      disabled={!!actionLoading}
                      className="pt-btn"
                      style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.35)" }}>
                      <Square className="w-4 h-4" /> Parar
                    </button>
                  ) : (
                    <button onClick={() => handleAction(bot.id, "start")}
                      disabled={!!actionLoading}
                      className="pt-btn"
                      style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.35)" }}>
                      <Play className="w-4 h-4" /> Iniciar
                    </button>
                  )}

                  <button
                    onClick={() => setOpenLogs(openLogs === bot.id ? null : bot.id)}
                    aria-expanded={openLogs === bot.id}
                    className="pt-btn pt-btn--ghost"
                    style={openLogs === bot.id ? { borderColor: "rgba(143,125,255,0.7)", color: "#d4ccff" } : undefined}>
                    <Terminal className="w-4 h-4" />
                    Console completo
                  </button>

                  <button onClick={() => handleRefresh(bot.id)}
                    disabled={!!actionLoading}
                    className="pt-btn pt-btn--ghost ml-auto"
                    aria-label="Atualizar status"
                    title="Atualizar status">
                    <RefreshCw className={`w-4 h-4 ${actionLoading === `${bot.id}-refresh` ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {openLogs === bot.id && !preview && (
                <div className="px-5 sm:px-6 pb-6">
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
