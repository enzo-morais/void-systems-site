"use client";
import { useBuilder } from "../BuilderContext";
export function TextEditor({ containerId, componentId }: { containerId: string; componentId: string }) {
  const { state, dispatch } = useBuilder();
  const content = state.containers.find(c => c.id === containerId)?.components.find(x => x.id === componentId)?.content ?? "";
  return (
    <textarea value={content}
      onChange={e => dispatch({ type: "SET_CONTENT", cid: containerId, compId: componentId, content: e.target.value })}
      placeholder="Digite o texto... (suporta markdown do Discord)"
      rows={2}
      className="w-full bg-transparent text-[#dcddde] text-sm resize-none focus:outline-none placeholder-[#4f545c] leading-relaxed"/>
  );
}
