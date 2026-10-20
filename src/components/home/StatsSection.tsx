"use client";

import { useEffect, useRef, useState } from "react";
import { stats, type Stat } from "@/config/home";
import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";

const DURATION = 1600;

function format(n: number, decimals: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function Counter({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { value, prefix = "", suffix = "", decimals = 0, still = false } = stat;
  // começa já no valor final: se a animação não rodar (ou falhar), o número certo já está na tela
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || still || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / DURATION, 1);
          setShown(value * (1 - Math.pow(1 - p, 3)));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, still]);

  const text = still ? String(value) : format(shown, decimals);
  return (
    <p ref={ref} className="text-4xl sm:text-5xl font-bold tracking-tight text-white tabular-nums">
      {prefix}
      {text}
      {suffix}
    </p>
  );
}

interface StatsSectionProps {
  scene?: number;
  /** Variante alta: título no topo, números embaixo e o centro livre para a forma do fundo. */
  tall?: boolean;
}

export function StatsSection({ scene = 1, tall = false }: StatsSectionProps) {
  const list = stats;
  if (list.length === 0) return null;

  const grid = (
    <div className="max-w-5xl mx-auto w-full flex flex-wrap justify-center gap-4">
      {list.map((stat, i) => (
        <Reveal key={stat.label} delay={i * 120} className="panel text-center basis-[44%] sm:basis-[200px] px-4 py-6">
          <Counter stat={stat} />
          <p className="mt-2 text-xs sm:text-sm uppercase tracking-wider text-silver/75">{stat.label}</p>
        </Reveal>
      ))}
    </div>
  );

  if (!tall) {
    return (
      <section data-scene={scene} className="px-6 py-16">
        {grid}
      </section>
    );
  }

  return (
    <section data-scene={scene} className="px-6 py-24 min-h-[75vh] flex flex-col justify-center gap-14">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver/80">Em números</p>
        </Reveal>
        <KineticTitle className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-white" accent="trabalhando por você">
          Bots rodando e
        </KineticTitle>
      </div>
      {grid}
    </section>
  );
}
