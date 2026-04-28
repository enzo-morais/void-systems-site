"use client";
import { useState } from "react";
import { useBuilder, type BtnData } from "../BuilderContext";

const STYLE_CLASSES: Record<number, string> = {
  1: "bg-[#5865f2] hover:bg-[#4752c4] text-white",
  2: "bg-[#4f545c] hover:bg-[#5d6269] text-white",
  3: "bg-[#3ba55c] hover:bg-[#2d7d46] text-white",
  4: "bg-[#ed4245] hover:bg-[#c03537] text-white",
  5: "bg-[#4f545c] hover:bg-[#5d6269] text-white",
};

export function ActionRowEditor({ containerId, componentId }: { containerId: string; componentId: string }) {
  const { state, dispatch } = useBuilder();
  const [editingId, setEditingId] = useState<string | null>(null);
  const buttons = state.containers.find(c => c.id === containerId)?.components.find(x => x.id === componentId)?.buttons ?? [];
  const editingBtn = buttons.find(b => b.id === editingId) ?? null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 items-center">
        {buttons.map(btn => (
          <button key={btn.id}
            onClick={() => setEditingId(editingId === btn.id ? null : btn.id)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${STYLE_CLASSES[btn.style]} ${btn.disabled ? "opacity-50" : ""} ${editingId === btn.id ? "ring-2 ring-white/40" : ""}`}>
            {btn.emoji && <span className="mr-1">{btn.emoji}</span>}
            {btn.label || "Botão"}
          </button>
        ))}
        {buttons.length < 5 && (
          <button onClick={() => dispatch({ type: "ADD_BUTTON", cid: containerId, compId: componentId })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm bg-[#232428] hover:bg-[#313338] border border-dashed border-[#3f4147] hover:border-[#5865f2]/50 text-[#8e9297] hover:text-[#b5bac1] transition-all">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Adicionar botão
          </button>
        )}
      </div>

      {editingBtn && (
        <div className="bg-[#1e1f22] rounded-lg p-3 border border-[#3f4147] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[#8e9297] text-xs font-semibold uppercase tracking-wide">Editar botão</span>
            <button onClick={() => { dispatch({ type: "DELETE_BUTTON", cid: containerId, compId: componentId, btnId: editingBtn.id }); setEditingId(null); }}
              className="text-[#6d6f78] hover:text-[#ed4245] text-xs flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              Remover
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[#8e9297] text-xs mb-1 block">Estilo</label>
              <select value={editingBtn.style}
                onChange={e => dispatch({ type: "SET_BUTTON_FIELD", cid: containerId, compId: componentId, btnId: editingBtn.id, field: "style", value: Number(e.target.value) as BtnData["style"] })}
                className="w-full bg-[#2b2d31] border border-[#3f4147] rounded px-2 py-1.5 text-[#dcddde] text-xs focus:outline-none focus:border-[#5865f2]">
                <option value={1}>Primário</option><option value={2}>Secundário</option>
                <option value={3}>Sucesso</option><option value={4}>Perigo</option><option value={5}>Link</option>
              </select>
            </div>
            <div>
              <label className="text-[#8e9297] text-xs mb-1 block">Label</label>
              <input type="text" value={editingBtn.label}
                onChange={e => dispatch({ type: "SET_BUTTON_FIELD", cid: containerId, compId: componentId, btnId: editingBtn.id, field: "label", value: e.target.value })}
                placeholder="Texto do botão"
                className="w-full bg-[#2b2d31] border border-[#3f4147] rounded px-2 py-1.5 text-[#dcddde] text-xs focus:outline-none focus:border-[#5865f2] placeholder-[#6d6f78]"/>
            </div>
          </div>
          <div>
            <label className="text-[#8e9297] text-xs mb-1 block">{editingBtn.style === 5 ? "URL" : "Custom ID"}</label>
            <input type="text"
              value={editingBtn.style === 5 ? editingBtn.url : editingBtn.custom_id}
              onChange={e => dispatch({ type: "SET_BUTTON_FIELD", cid: containerId, compId: componentId, btnId: editingBtn.id, field: editingBtn.style === 5 ? "url" : "custom_id", value: e.target.value })}
              placeholder={editingBtn.style === 5 ? "https://..." : "panel_open:1:3"}
              className="w-full bg-[#2b2d31] border border-[#3f4147] rounded px-2 py-1.5 text-[#dcddde] text-xs font-mono focus:outline-none focus:border-[#5865f2] placeholder-[#6d6f78]"/>
            {editingBtn.custom_id.startsWith("panel_open:") && (
              <p className="text-[#3ba55c] text-xs mt-1 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                Botão de ticket configurado
              </p>
            )}
          </div>
          <div>
            <label className="text-[#8e9297] text-xs mb-1 block">Emoji</label>
            <input type="text" value={editingBtn.emoji}
              onChange={e => dispatch({ type: "SET_BUTTON_FIELD", cid: containerId, compId: componentId, btnId: editingBtn.id, field: "emoji", value: e.target.value })}
              placeholder="🎫 ou deixe vazio"
              className="w-full bg-[#2b2d31] border border-[#3f4147] rounded px-2 py-1.5 text-[#dcddde] text-xs focus:outline-none focus:border-[#5865f2] placeholder-[#6d6f78]"/>
          </div>
          <label className="flex items-center gap-2 text-xs text-[#8e9297] cursor-pointer">
            <input type="checkbox" checked={editingBtn.disabled}
              onChange={e => dispatch({ type: "SET_BUTTON_FIELD", cid: containerId, compId: componentId, btnId: editingBtn.id, field: "disabled", value: e.target.checked })}
              className="accent-[#5865f2]"/>
            Desabilitado
          </label>
        </div>
      )}
    </div>
  );
}
