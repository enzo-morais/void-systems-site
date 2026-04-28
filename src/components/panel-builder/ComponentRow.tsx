"use client";
import { useBuilder } from "./BuilderContext";
import { TextEditor } from "./editors/TextEditor";
import { ActionRowEditor } from "./editors/ActionRowEditor";
import { MediaGalleryEditor } from "./editors/MediaGalleryEditor";
import { FileEditor } from "./editors/FileEditor";
import { SeparatorEditor } from "./editors/SeparatorEditor";

export function ComponentRow({ containerId, componentId, index }: { containerId: string; componentId: string; index: number }) {
  const { state, dispatch } = useBuilder();
  const c = state.containers.find(x => x.id === containerId);
  const comp = c?.components.find(x => x.id === componentId);
  if (!comp) return null;
  const total = c?.components.length ?? 0;

  return (
    <div className="group flex items-start gap-1.5 rounded-md hover:bg-[#1e1f22] px-2 py-2 transition-colors">
      <div className="flex flex-col gap-0.5 cursor-grab text-[#4f545c] group-hover:text-[#6d6f78] mt-1 flex-shrink-0">
        <div className="flex gap-0.5"><div className="w-1 h-1 rounded-full bg-current"/><div className="w-1 h-1 rounded-full bg-current"/></div>
        <div className="flex gap-0.5"><div className="w-1 h-1 rounded-full bg-current"/><div className="w-1 h-1 rounded-full bg-current"/></div>
      </div>
      <div className="flex-1 min-w-0">
        {comp.type === 10 && <TextEditor containerId={containerId} componentId={componentId} />}
        {comp.type === 1  && <ActionRowEditor containerId={containerId} componentId={componentId} />}
        {comp.type === 12 && <MediaGalleryEditor containerId={containerId} componentId={componentId} />}
        {comp.type === 13 && <FileEditor containerId={containerId} componentId={componentId} />}
        {comp.type === 14 && <SeparatorEditor containerId={containerId} componentId={componentId} />}
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
        <button onClick={() => dispatch({ type: "MOVE_COMPONENT", cid: containerId, from: index, to: index - 1 })} disabled={index === 0}
          className="p-1 text-[#6d6f78] hover:text-[#b5bac1] disabled:opacity-30">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg>
        </button>
        <button onClick={() => dispatch({ type: "MOVE_COMPONENT", cid: containerId, from: index, to: index + 1 })} disabled={index === total - 1}
          className="p-1 text-[#6d6f78] hover:text-[#b5bac1] disabled:opacity-30">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
        </button>
        <button onClick={() => dispatch({ type: "DELETE_COMPONENT", cid: containerId, compId: componentId })}
          className="p-1 text-[#6d6f78] hover:text-[#ed4245] rounded hover:bg-[#ed4245]/10">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
    </div>
  );
}
