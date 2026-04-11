"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  label: string;
}

export function AnimatedCounter({ value, label }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState("0");
  const [started, setStarted] = useState(false);

  // Extract number and suffix (e.g. "50+" -> 50, "+")
  const match = value.match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : value;
  const isDecimal = value.includes(".");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // Ease out
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      current = target * eased;

      if (step >= steps) {
        setDisplay(isDecimal ? target.toFixed(1) : String(Math.round(target)));
        clearInterval(timer);
      } else {
        setDisplay(isDecimal ? current.toFixed(1) : String(Math.round(current)));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [started, target, isDecimal]);

  return (
    <div ref={ref} className="text-center py-6">
      <p className="text-3xl sm:text-4xl font-bold mb-1">
        {started ? display : "0"}{suffix}
      </p>
      <p className="text-xs text-silver/40 uppercase tracking-wider">{label}</p>
    </div>
  );
}
