"use client";
import { useState } from "react";
import { useBuilder, type CompType } from "./BuilderContext";

const ITEMS: { compType: CompType; label: string; icon: string; desc: string }[] = [
  { compType: 10, label: "Texto", icon: "T", desc: "Texto com markdown" },
  { compType: 1, label: "Botões", icon: "⬜", desc: "Linha de botões" },
  { compType: 12, label: "Galeria", icon: "🖼", desc: "Até 10 imagens" },
  { compType: 13, label: "Arquivo", icon: "📎", desc: "Anexo de arquivo" },
  { compType: 14, label: "Separador", icon: "—", desc: "Linha divisória" },
];

export function AddComponentMenu({ containerId }: { containerId: string }) {
  const { dispatch } = useBuilder();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative mt-1">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded bg-[#232428] hover:bg-[#313338] border border-dashed border-[#3f4147] hover:border-[#5865f2]/50 text-[#8e9297] hover:text-[#b5bac1] transition-all text-xs w-full">
        <div className="w-4 h-4 rounded bg-[#5865f2]/20 flex items-center justify-center flex-shrink-0">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="#5865f2"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        </div>
        Adicionar componente
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-[#1e1f22] border border-[#3f4147] rounded-lg shadow-2xl overflow-hidden w-56">
            {ITEMS.map(item => (
              <button key={item.compType}
                onClick={() => { dispatch({ type: "ADD_COMPONENT", cid: containerId, compType: item.compType }); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#2b2d31] transition-colors text-left">
                <span className="w-7 h-7 flex items-center justify-center bg-[#2b2d31] rounded text-sm flex-shrink-0">{item.icon}</span>
                <div>
                  <div className="text-[#dcddde] text-xs font-medium">{item.label}</div>
                  <div className="text-[#6d6f78] text-xs">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
