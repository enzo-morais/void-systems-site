"use client";

import { useState, useEffect } from "react";
import { Loader2, ScrollText } from "lucide-react";

interface Log {
  id: string; action: string; details: string | null; staffName: string; createdAt: string;
}

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" };

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/logs").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ScrollText className="w-6 h-6" /> Logs de Atividade</h1>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-silver/40"><Loader2 className="w-5 h-5 animate-spin mr-2" />Carregando...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-silver/30 text-sm">Nenhum log registrado.</div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={cardStyle}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Ação</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Detalhes</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Staff</th>
                <th className="px-5 py-3 text-left text-xs text-silver/40 font-medium uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                >
                  <td className="px-5 py-3 font-medium">{log.action}</td>
                  <td className="px-5 py-3 text-silver/50 truncate max-w-[250px]">{log.details || "—"}</td>
                  <td className="px-5 py-3 text-silver/50">{log.staffName}</td>
                  <td className="px-5 py-3 text-silver/40">{new Date(log.createdAt).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
