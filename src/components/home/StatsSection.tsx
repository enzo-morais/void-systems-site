"use client";

import { useEffect, useRef, useState } from "react";
import { stats, type Stat } from "@/config/home";
import { Reveal } from "./Reveal";

const DURATION = 1600;

function format(n: number, decimals: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function Counter({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { value, prefix = "", suffix = "", decimals = 0 } = stat;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === null) return;

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setShown(value);
          return;
        }
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
  }, [value]);

  return (
    <p ref={ref} className="text-4xl sm:text-5xl font-bold tracking-tight text-white tabular-nums">
      {value === null ? "—" : `${prefix}${format(shown, decimals)}${suffix}`}
    </p>
  );
}

export function StatsSection() {
  // só mostra os números já preenchidos no config; sem nenhum, a seção some
  const filled = stats.filter((s) => s.value !== null);
  if (filled.length === 0) return null;

  return (
    <section className="px-6 py-20">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-6 gap-y-12">
        {filled.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 120} className="text-center basis-[44%] sm:basis-[200px]">
            <Counter stat={stat} />
            <p className="mt-2 text-xs sm:text-sm uppercase tracking-wider text-silver/75">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
