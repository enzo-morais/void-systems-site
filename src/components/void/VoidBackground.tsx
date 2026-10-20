"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { resolveRoute } from "@/config/void-scenes";
import { startVoidEngine, type VoidEngine } from "./engine";
import "./void-background.css";

export default function VoidBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cut = useRef<HTMLDivElement>(null);
  const grain = useRef<HTMLDivElement>(null);
  const engine = useRef<VoidEngine | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const els = {
      canvas: canvas.current,
      cut: cut.current,
      grain: grain.current,
    };
    if (Object.values(els).some((el) => !el)) return;
    const e = startVoidEngine(els as Parameters<typeof startVoidEngine>[0]);
    engine.current = e;
    return () => {
      e.stop();
      engine.current = null;
    };
  }, []);

  // a cada rota nova, o fundo troca de cena com a transição definida em src/config/void-scenes.ts.
  // O pequeno atraso deixa a página nova montar (cenas lidas do DOM); não bloqueia a navegação.
  useEffect(() => {
    const route = resolveRoute(pathname);
    const id = window.setTimeout(() => engine.current?.setRoute(route), route.scenes === "page" ? 30 : 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <div className="vb-root" aria-hidden="true">
      <canvas ref={canvas} className="vb-stage" />
      <div ref={cut} className="vb-cut" />
      <div ref={grain} className="vb-grain" />
    </div>
  );
}
