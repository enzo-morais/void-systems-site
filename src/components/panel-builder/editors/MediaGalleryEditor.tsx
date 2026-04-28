"use client";
import { useBuilder } from "../BuilderContext";
export function MediaGalleryEditor({ containerId, componentId }: { containerId: string; componentId: string }) {
  const { state, dispatch } = useBuilder();
  const items = state.containers.find(c => c.id === containerId)?.components.find(x => x.id === componentId)?.items ?? [];
  return (
    <div className="flex flex-col gap-2">
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-2">
          {item.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0 border border-[#3f4147]"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}/>
          ) : (
            <div className="w-10 h-10 rounded bg-[#1e1f22] border border-[#3f4147] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#6d6f78"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            </div>
          )}
          <input type="url" value={item.url}
            onChange={e => dispatch({ type: "SET_MEDIA_FIELD", cid: containerId, compId: componentId, itemId: item.id, field: "url", value: e.target.value })}
            placeholder="URL da imagem"
            className="flex-1 bg-[#1e1f22] border border-[#3f4147] rounded px-2 py-1.5 text-[#dcddde] text-xs focus:outline-none focus:border-[#5865f2] placeholder-[#6d6f78]"/>
          <label className="flex items-center gap-1 text-xs text-[#8e9297] flex-shrink-0 cursor-pointer">
            <input type="checkbox" checked={item.spoiler}
              onChange={e => dispatch({ type: "SET_MEDIA_FIELD", cid: containerId, compId: componentId, itemId: item.id, field: "spoiler", value: e.target.checked })}
              className="accent-[#5865f2] w-3 h-3"/>
            Spoiler
          </label>
          <button onClick={() => dispatch({ type: "DELETE_MEDIA_ITEM", cid: containerId, compId: componentId, itemId: item.id })}
            className="text-[#6d6f78] hover:text-[#ed4245] flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
      ))}
      {items.length < 10 && (
        <button onClick={() => dispatch({ type: "ADD_MEDIA_ITEM", cid: containerId, compId: componentId })}
          className="flex items-center gap-1.5 text-xs text-[#8e9297] hover:text-[#b5bac1]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Adicionar imagem
        </button>
      )}
    </div>
  );
}
