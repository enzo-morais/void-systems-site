"use client";

interface DiscordComp { type: number; content?: string; components?: DiscordComp[]; items?: { media?: { url?: string }; description?: string | null; spoiler?: boolean }[]; file?: { url?: string }; media?: { url?: string }; description?: string | null; spoiler?: boolean; divider?: boolean; spacing?: 1|2; }
interface DiscordContainer { type: 17; accent_color?: number | null; spoiler?: boolean; components?: DiscordComp[]; }

const BTN_STYLE: Record<number, string> = { 1: "rgba(88,101,242,0.9)", 2: "rgba(79,84,92,0.9)", 3: "rgba(59,165,92,0.9)", 4: "rgba(237,66,69,0.9)", 5: "rgba(79,84,92,0.9)" };
const intToHex = (n: number) => "#" + n.toString(16).padStart(6,"0");

function Comp({ comp }: { comp: DiscordComp }) {
  switch (comp.type) {
    case 10: return (
      <div className="text-sm leading-relaxed" style={{ color: "#dcddde" }}>
        {(comp.content ?? "").split("\n").map((line, i) => {
          const t = line.trim();
          if (t.startsWith("## ")) return <div key={i} className="font-bold text-base">{t.slice(3)}</div>;
          if (t.startsWith("# ")) return <div key={i} className="font-extrabold text-lg">{t.slice(2)}</div>;
          if (t.startsWith("-# ")) return <div key={i} className="text-xs opacity-50">{t.slice(3)}</div>;
          if (t === "") return <div key={i} className="h-2" />;
          return <div key={i}>{line}</div>;
        })}
      </div>
    );
    case 1: return (
      <div className="flex flex-wrap gap-2">
        {(comp.components ?? []).map((btn, i) => (
          <button key={i} disabled={(btn as any).disabled}
            className="px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50 text-white"
            style={{ backgroundColor: BTN_STYLE[(btn as any).style] ?? BTN_STYLE[1] }}>
            {(btn as any).emoji?.name && <span className="mr-1">{(btn as any).emoji.name}</span>}
            {(btn as any).label}
          </button>
        ))}
      </div>
    );
    case 12: return (
      <div className={`grid gap-1 rounded overflow-hidden ${(comp.items?.length ?? 0) === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
        {(comp.items ?? []).map((item, i) => item.media?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={item.media.url} alt={item.description ?? ""} className="w-full object-cover rounded" style={{ maxHeight: "200px" }}
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <div key={i} className="w-full h-24 rounded flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
          </div>
        ))}
      </div>
    );
    case 13: return (
      <div className="flex items-center gap-2 px-3 py-2 rounded" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
        <span className="text-sm" style={{ color: "#00b0f4" }}>{comp.file?.url?.split("/").pop() ?? "arquivo"}</span>
      </div>
    );
    case 14: return (
      <div style={{ padding: `${comp.spacing === 2 ? 12 : 4}px 0` }}>
        {comp.divider !== false && <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />}
      </div>
    );
    default: return null;
  }
}

function Container({ c }: { c: DiscordContainer }) {
  const accentHex = c.accent_color != null ? intToHex(c.accent_color) : null;
  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "rgba(43,45,49,0.95)", borderLeft: accentHex ? `4px solid ${accentHex}` : "4px solid transparent", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="p-3 flex flex-col gap-2">
        {(c.components ?? []).map((comp, i) => <Comp key={i} comp={comp} />)}
      </div>
    </div>
  );
}

export function DiscordPreview({ containers }: { containers: object[] }) {
  const cs = containers as DiscordContainer[];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "rgba(49,51,56,0.95)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(43,45,49,0.8)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>preview</span>
        <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.2)" }}>— Discord Components v2</span>
      </div>
      <div className="p-4">
        {cs.length === 0 ? (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Adicione containers para ver o preview...</p>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-white">Ticket Bot</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Hoje às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="flex flex-col gap-2">
                {cs.map((c, i) => <Container key={i} c={c} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
