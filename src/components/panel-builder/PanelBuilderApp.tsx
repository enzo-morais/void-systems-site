"use client";

import { useState } from "react";
import { BuilderProvider, useBuilder } from "./BuilderContext";
import { ContainerCard } from "./ContainerCard";
import { DiscordPreview } from "./DiscordPreview";

function BuilderInner() {
  const { state, dispatch, getJSON } = useBuilder();
  const [token, setToken] = useState("");
  const [tokenVisible, setTokenVisible] = useState(false);
  const [guilds, setGuilds] = useState<{ id: string; name: string }[]>([]);
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  const [guildId, setGuildId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [loadingGuilds, setLoadingGuilds] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  async function loadGuilds() {
    if (!token.trim()) return;
    setLoadingGuilds(true); setError(null);
    try {
      const res = await fetch("/api/panel-builder/guilds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGuilds(data.guilds); setGuildId(""); setChannels([]); setChannelId("");
    } catch (e: any) { setError(e.message); }
    finally { setLoadingGuilds(false); }
  }

  async function loadChannels(gId: string) {
    setGuildId(gId); setChannelId(""); setChannels([]);
    if (!gId) return;
    setLoadingChannels(true);
    try {
      const res = await fetch("/api/panel-builder/channels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, guildId: gId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChannels(data.channels);
    } catch (e: any) { setError(e.message); }
    finally { setLoadingChannels(false); }
  }

  async function handleSend() {
    const components = getJSON();
    if (!components.length) { setError("Adicione pelo menos um container."); return; }
    if (!channelId) { setError("Selecione um canal."); return; }
    setSending(true); setError(null); setSuccess(false);
    try {
      const res = await fetch("/api/panel-builder/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, channelId, components }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true); setTimeout(() => setSuccess(false), 5000);
    } catch (e: any) { setError(e.message); }
    finally { setSending(false); }
  }

  function handleCopyJSON() {
    const json = JSON.stringify(getJSON(), null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  function handleLoadJSON() {
    try {
      const parsed = JSON.parse(jsonText);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      // Convert raw JSON to ContainerData
      const { v4: uuidv4 } = require("uuid");
      const containers = arr.map((item: any) => ({
        id: uuidv4(), accentColor: item.accent_color ?? null, spoiler: item.spoiler ?? false,
        components: (item.components ?? []).map((comp: any) => {
          const base = { id: uuidv4(), type: comp.type, content: "", buttons: [], items: [], fileUrl: "", fileSpoiler: false, divider: true, spacing: 1 };
          if (comp.type === 10) return { ...base, content: comp.content ?? "" };
          if (comp.type === 1) return { ...base, buttons: (comp.components ?? []).map((b: any) => ({ id: uuidv4(), style: b.style ?? 1, label: b.label ?? "", emoji: b.emoji?.name ?? "", custom_id: b.custom_id ?? uuidv4(), url: b.url ?? "", disabled: b.disabled ?? false })) };
          if (comp.type === 12) return { ...base, items: (comp.items ?? []).map((i: any) => ({ id: uuidv4(), url: i.media?.url ?? "", description: i.description ?? "", spoiler: i.spoiler ?? false })) };
          if (comp.type === 13) return { ...base, fileUrl: comp.file?.url ?? "", fileSpoiler: comp.spoiler ?? false };
          if (comp.type === 14) return { ...base, divider: comp.divider ?? true, spacing: comp.spacing ?? 1 };
          return base;
        }),
      }));
      dispatch({ type: "LOAD_JSON", containers });
      setJsonError(null); setJsonMode(false); setJsonText("");
    } catch { setJsonError("JSON inválido"); }
  }

  const channelName = channels.find(c => c.id === channelId)?.name;
  const previewData = getJSON();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b"
        style={{ backgroundColor: "rgba(0,0,0,0.9)", borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
          <span className="font-semibold text-sm">Panel Builder</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(88,101,242,0.15)", color: "#7c8cf8", border: "1px solid rgba(88,101,242,0.3)" }}>v2</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopyJSON}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
            {copied ? "✓ Copiado!" : "Copiar JSON"}
          </button>
          <button onClick={() => { setJsonMode(!jsonMode); setJsonError(null); }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            style={{ backgroundColor: jsonMode ? "rgba(88,101,242,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${jsonMode ? "rgba(88,101,242,0.4)" : "rgba(255,255,255,0.1)"}`, color: jsonMode ? "#7c8cf8" : "rgba(255,255,255,0.6)" }}>
            Importar JSON
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Editor */}
        <div className="flex flex-col gap-4">

          {/* Import JSON */}
          {jsonMode && (
            <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-sm font-semibold mb-3 text-white">Importar JSON</h3>
              <textarea value={jsonText} onChange={e => { setJsonText(e.target.value); setJsonError(null); }}
                placeholder={'[\n  {\n    "type": 17,\n    "components": [...]\n  }\n]'}
                rows={6} spellCheck={false}
                className="w-full rounded-lg px-3 py-2 text-xs font-mono text-white/80 placeholder-white/15 focus:outline-none resize-none"
                style={{ backgroundColor: "rgba(0,0,0,0.4)", border: jsonError ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.08)" }}/>
              {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
              <button onClick={handleLoadJSON}
                className="mt-2 w-full py-2 rounded-lg text-sm font-semibold text-black bg-white hover:bg-white/90 transition-all cursor-pointer">
                Carregar no editor
              </button>
            </div>
          )}

          {/* Canvas */}
          <div className="flex flex-col gap-3">
            {state.containers.map((c, i) => (
              <ContainerCard key={c.id} containerId={c.id} index={i} />
            ))}
            <button onClick={() => dispatch({ type: "ADD_CONTAINER" })}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium w-full transition-all cursor-pointer"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "2px dashed rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(88,101,242,0.5)"; (e.currentTarget as HTMLElement).style.color = "rgba(88,101,242,0.8)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}>
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: "rgba(88,101,242,0.2)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#5865f2"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </div>
              Adicionar container
            </button>
          </div>

          {/* Send section */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 className="text-sm font-semibold mb-3 text-white">Enviar para Discord</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block uppercase tracking-wide">Token do Bot</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input type={tokenVisible ? "text" : "password"} value={token} onChange={e => setToken(e.target.value)}
                      placeholder="Token do bot..."
                      className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none pr-8"
                      style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}/>
                    <button onClick={() => setTokenVisible(!tokenVisible)} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        {tokenVisible ? <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z"/> : <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>}
                      </svg>
                    </button>
                  </div>
                  <button onClick={loadGuilds} disabled={!token.trim() || loadingGuilds}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-black bg-white hover:bg-white/90 disabled:opacity-40 transition-all cursor-pointer">
                    {loadingGuilds ? "..." : "Conectar"}
                  </button>
                </div>
              </div>

              {guilds.length > 0 && (
                <div>
                  <label className="text-xs text-white/40 mb-1 block uppercase tracking-wide">Servidor</label>
                  <select value={guildId} onChange={e => loadChannels(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <option value="">Selecione...</option>
                    {guilds.map(g => <option key={g.id} value={g.id} style={{ backgroundColor: "#1a1a1a" }}>{g.name}</option>)}
                  </select>
                </div>
              )}

              {loadingChannels && <p className="text-xs text-white/30">Carregando canais...</p>}

              {channels.length > 0 && (
                <div>
                  <label className="text-xs text-white/40 mb-1 block uppercase tracking-wide">Canal</label>
                  <select value={channelId} onChange={e => setChannelId(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <option value="">Selecione...</option>
                    {channels.map(c => <option key={c.id} value={c.id} style={{ backgroundColor: "#1a1a1a" }}># {c.name}</option>)}
                  </select>
                </div>
              )}

              {error && <div className="text-sm text-red-400 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>}
              {success && <div className="text-sm text-green-400 px-3 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                Painel enviado{channelName ? ` para #${channelName}` : ""}!
              </div>}

              <button onClick={handleSend} disabled={sending || !channelId || !state.containers.length}
                className="w-full py-3 rounded-xl text-sm font-bold text-black bg-white hover:bg-white/90 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer">
                {sending ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Enviando...</>
                  : <><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>Enviar Painel{channelName ? ` → #${channelName}` : ""}</>}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(192,192,192,0.4)" }}>Preview</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-xs" style={{ color: "rgba(192,192,192,0.2)" }}>atualiza em tempo real</span>
          </div>
          <DiscordPreview containers={previewData} />
        </div>
      </div>
    </div>
  );
}

export function PanelBuilderApp() {
  return (
    <BuilderProvider>
      <BuilderInner />
    </BuilderProvider>
  );
}
