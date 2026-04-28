"use client";
import { useBuilder } from "../BuilderContext";
export function SeparatorEditor({ containerId, componentId }: { containerId: string; componentId: string }) {
  const { state, dispatch } = useBuilder();
  const comp = state.containers.find(c => c.id === containerId)?.components.find(x => x.id === componentId);
  return (
    <div className="flex flex-col gap-1.5 w-full py-1">
      {comp?.divider && <div className="w-full border-t border-[#3f4147]"/>}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1.5 text-xs text-[#8e9297] cursor-pointer">
          <input type="checkbox" checked={comp?.divider ?? true}
            onChange={e => dispatch({ type: "SET_DIVIDER", cid: containerId, compId: componentId, v: e.target.checked })}
            className="accent-[#5865f2] w-3 h-3"/>
          Mostrar linha
        </label>
        <label className="flex items-center gap-1.5 text-xs text-[#8e9297]">
          Espaçamento:
          <select value={comp?.spacing ?? 1}
            onChange={e => dispatch({ type: "SET_SPACING", cid: containerId, compId: componentId, v: Number(e.target.value) as 1|2 })}
            className="bg-[#1e1f22] border border-[#3f4147] rounded px-1.5 py-0.5 text-[#dcddde] text-xs focus:outline-none">
            <option value={1}>Pequeno</option>
            <option value={2}>Grande</option>
          </select>
        </label>
      </div>
    </div>
  );
}
