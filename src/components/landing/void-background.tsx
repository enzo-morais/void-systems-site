"use client";

import { useMemo, useState, useEffect } from "react";

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function VoidBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stars = useMemo(() => {
    return Array.from({ length: 150 }, (_, i) => ({
      left: seededRandom(i * 3 + 1) * 100,
      top: seededRandom(i * 3 + 2) * 100,
      size: 0.5 + seededRandom(i * 3 + 3) * 1.5,
      opacity: 0.15 + seededRandom(i * 7) * 0.3,
      twinkleDur: 5 + seededRandom(i * 11) * 10,
      twinkleDelay: seededRandom(i * 13) * 5,
      // Individual movement
      driftX: (seededRandom(i * 17 + 1) - 0.5) * 30,
      driftY: (seededRandom(i * 17 + 2) - 0.5) * 30,
      driftDur: 20 + seededRandom(i * 17 + 3) * 40,
    }));
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      left: `${seededRandom(i * 5 + 100) * 100}%`,
      size: 1 + seededRandom(i * 5 + 101) * 2,
      opacity: 0.15 + seededRandom(i * 5 + 102) * 0.25,
      duration: 15 + seededRandom(i * 5 + 103) * 25,
      delay: seededRandom(i * 5 + 104) * 20,
    }));
  }, []);

  const dustClouds = [
    { top: "10%", left: "20%", w: 400, h: 400, opacity: 0.06, anim: "drift1", dur: "60s" },
    { top: "60%", left: "70%", w: 500, h: 300, opacity: 0.04, anim: "drift2", dur: "80s" },
    { top: "30%", left: "50%", w: 600, h: 400, opacity: 0.08, anim: "drift3", dur: "45s" },
    { top: "80%", left: "10%", w: 350, h: 350, opacity: 0.03, anim: "drift1", dur: "100s" },
    { top: "5%", left: "80%", w: 300, h: 500, opacity: 0.05, anim: "drift2", dur: "70s" },
    { top: "50%", left: "30%", w: 450, h: 350, opacity: 0.01, anim: "drift3", dur: "90s" },
  ];

  if (!mounted) {
    return <div className="fixed inset-0 bg-black pointer-events-none" style={{ zIndex: 0 }} />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Radial center glow */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, #1a1a1a 0%, #000000 70%)", opacity: 0.4 }} />

      {/* Vertical gradient overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.8) 100%)" }} />

      {/* Dust clouds */}
      {dustClouds.map((cloud, i) => (
        <div key={i} className="absolute rounded-full" style={{
          top: cloud.top, left: cloud.left, width: cloud.w, height: cloud.h,
          filter: "blur(80px)",
          background: `radial-gradient(circle, rgba(255,255,255,${cloud.opacity}) 0%, transparent 70%)`,
          animation: `${cloud.anim} ${cloud.dur} ease-in-out infinite alternate`,
        }} />
      ))}

      {/* Stars */}
      {stars.map((star, i) => (
        <div
          key={`s${i}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animation: undefined,
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div key={`p${i}`} className="absolute rounded-full bg-white" style={{
          left: p.left, bottom: "-10px", width: p.size, height: p.size,
          ["--particle-opacity" as string]: p.opacity,
          animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
        }} />
      ))}

      {/* Inline keyframes for star movement variants */}
    </div>
  );
}
