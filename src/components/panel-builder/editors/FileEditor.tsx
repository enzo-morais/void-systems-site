"use client";
import { useBuilder } from "../BuilderContext";
export function FileEditor({ containerId, componentId }: { containerId: string; componentId: string }) {
  const { state, dispatch } = useBuilder();
  const comp = state.containers.find(c => c.id === containerId)?.components.find(x => x.id === componentId);
  return (
    <div className="flex items-center gap-2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#8e9297" className="flex-shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
      </svg>
      <input type="text" value={comp?.fileUrl ?? ""}
        onChange={e => dispatch({ type: "SET_FILE_URL", cid: containerId, compId: componentId, url: e.target.value })}
        placeholder="attachment://arquivo.pdf ou URL"
        className="flex-1 bg-[#1e1f22] border border-[#3f4147] rounded px-2 py-1.5 text-[#dcddde] text-xs font-mono focus:outline-none focus:border-[#5865f2] placeholder-[#6d6f78]"/>
      <label className="flex items-center gap-1 text-xs text-[#8e9297] flex-shrink-0 cursor-pointer">
        <input type="checkbox" checked={comp?.fileSpoiler ?? false}
          onChange={e => dispatch({ type: "SET_FILE_SPOILER", cid: containerId, compId: componentId, v: e.target.checked })}
          className="accent-[#5865f2] w-3 h-3"/>
        Spoiler
      </label>
    </div>
  );
}
