"use client";
import { useState } from "react";
import { useBuilder } from "./BuilderContext";
import { ComponentRow } from "./ComponentRow";
import { AddComponentMenu } from "./AddComponentMenu";

const PRESETS = ["#5865f2","#57f287","#fee75c","#ed4245","#eb459e","#3ba55c","#faa61a","#00b0f4"];
const hexToInt = (h: string) => parseInt(h.replace("#",""), 16);
const intToHex = (n: number) => "#" + n.toString(16).padStart(6,"0");

export function ContainerCard({ containerId, index }: { containerId: string; index: number }) {
  const { state, dispatch } = useBuilder();
  const [showAccent, setShowAccent] = useState(false);
  const c = state.containers.find(x => x.id === containerId);
  if (!c) return null;
  const accentHex = c.accentColor != null ? intToHex(c.accentColor) : null;

  return (
    <div className="rounded-lg overflow-hidden border border-[#3f4147] bg-[#2b2d31]"
      style={accentHex ? { borderLeft: `3px solid ${accentHex}` } : {}}>
      <div className="flex items-center gap-1 px-2 py-1.5 bg-[#232428] border-b border-[#1e1f22]">
        <span className="text-[#8e9297] text-xs font-semibold uppercase tracking-wide flex-1 pl-1">Container</span>
        <button onClick={() => setShowAccent(!showAccent)}
          className="flex items-center gap-1.5 text-xs text-[#8e9297] hover:text-[#b5bac1] px-2 py-1 rounded hover:bg-[#2b2d31]">
          <div className="w-3 h-3 rounded-full border border-[#6d6f78]" style={{ backgroundColor: accentHex ?? "transparent" }}/>
          Cor
        </button>
        <label className="flex items-center gap-1 text-xs text-[#8e9297] cursor-pointer px-1">
          <input type="checkbox" checked={c.spoiler}
            onChange={e => dispatch({ type: "SET_CONTAINER_SPOILER", cid: containerId, v: e.target.checked })}
            className="accent-[#5865f2] w-3 h-3"/>
          Spoiler
        </label>
        <button onClick={() => dispatch({ type: "MOVE_CONTAINER", from: index, to: index - 1 })} disabled={index === 0}
          className="p-1 text-[#6d6f78] hover:text-[#b5bac1] disabled:opacity-30">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg>
        </button>
        <button onClick={() => dispatch({ type: "MOVE_CONTAINER", from: index, to: index + 1 })} disabled={index === state.containers.length - 1}
          className="p-1 text-[#6d6f78] hover:text-[#b5bac1] disabled:opacity-30">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
        </button>
        <button onClick={() => dispatch({ type: "DELETE_CONTAINER", cid: containerId })}
          className="p-1 text-[#6d6f78] hover:text-[#ed4245] rounded hover:bg-[#ed4245]/10">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
      {showAccent && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#1e1f22] border-b border-[#3f4147] flex-wrap">
          <span className="text-[#8e9297] text-xs">Destaque:</span>
          {PRESETS.map(color => (
            <button key={color}
              onClick={() => dispatch({ type: "SET_CONTAINER_ACCENT", cid: containerId, color: hexToInt(color) })}
              className="w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform"
              style={{ backgroundColor: color, borderColor: accentHex === color ? "white" : "transparent" }}/>
          ))}
          <input type="color" value={accentHex ?? "#5865f2"}
            onChange={e => dispatch({ type: "SET_CONTAINER_ACCENT", cid: containerId, color: hexToInt(e.target.value) })}
            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"/>
          <button onClick={() => dispatch({ type: "SET_CONTAINER_ACCENT", cid: containerId, color: null })}
            className="text-xs text-[#8e9297] hover:text-[#ed4245]">Remover</button>
        </div>
      )}
      <div className="p-2 flex flex-col gap-1">
        {c.components.map((comp, i) => (
          <ComponentRow key={comp.id} containerId={containerId} componentId={comp.id} index={i} />
        ))}
        <AddComponentMenu containerId={containerId} />
      </div>
    </div>
  );
}
