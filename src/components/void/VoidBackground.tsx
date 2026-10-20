"use client";

import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function VoidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile =
      window.matchMedia("(max-width: 767px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;

    const STAR_COUNT = isMobile ? 220 : 650;
    const DEPTH = 40;
    const SPREAD = 14;
    const GRID_GAP = 2.5;
    const GRID_LINES = isMobile ? 7 : 11;
    const GRID_SPACING = 2;
    const TRAVEL = 140; // profundidade percorrida ao rolar a página inteira
    const FRAME_MS = isMobile ? 1000 / 30 : 0;

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * SPREAD * 2,
      y: (Math.random() - 0.5) * SPREAD * 2,
      z: Math.random() * DEPTH,
      size: 0.4 + Math.random() * 1.1,
      alpha: 0.35 + Math.random() * 0.65,
    }));

    let w = 0;
    let h = 0;
    let focal = 1;

    const resize = () => {
      // no celular a barra do navegador esconde/mostra ao rolar e dispara resize só de altura: ignorar
      if (isMobile && w === window.innerWidth && h !== 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      focal = Math.max(w, h) * 0.62;
    };

    let targetP = 0;
    let curP = 0;
    let prevCamZ = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetP = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    };

    const draw = (time: number, speedScale: number) => {
      const t = time / 1000;
      const cx = w / 2 + mouse.x * -18;
      const cy = h / 2 + mouse.y * -12;
      const camZ = curP * TRAVEL + t * 0.9 * speedScale;
      const vel = Math.min(Math.abs(camZ - prevCamZ), 1.2);
      prevCamZ = camZ;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      // brilho do portal: cresce ao avançar e pulsa de leve entre seções
      const section = Math.sin(curP * TAU * 2.5);
      const intensity = 0.5 + curP * 0.35 + section * 0.08 + Math.sin(t * 0.6) * 0.03 * speedScale;
      const base = Math.min(w, h);
      const radius = base * (0.5 + curP * 0.45);
      const r = Math.round(lerp(120, 170, curP));
      const g = Math.round(lerp(130, 110, curP));
      const b = 255;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      glow.addColorStop(0, `rgba(${r},${g},${b},${0.32 * intensity})`);
      glow.addColorStop(0.35, `rgba(${r},${g},${b},${0.1 * intensity})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // anel fino do portal
      const ring = base * (0.07 + curP * 0.05);
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.14 * intensity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, ring, ring * 0.9, 0, 0, TAU);
      ctx.stroke();

      // grade em perspectiva (chão e teto)
      const near = 0.5;
      const far = 30;
      ctx.lineWidth = 1;
      for (let side = -1; side <= 1; side += 2) {
        const y = side * 2.2;
        for (let k = -GRID_LINES; k <= GRID_LINES; k++) {
          const x = k * GRID_SPACING;
          const x0 = cx + (x * focal) / near;
          const y0 = cy + (y * focal) / near;
          const x1 = cx + (x * focal) / far;
          const y1 = cy + (y * focal) / far;
          if (isMobile) {
            // celular: cor sólida, sem criar um gradiente por linha a cada quadro
            ctx.strokeStyle = `rgba(${r},${g},${b},0.08)`;
          } else {
            const grad = ctx.createLinearGradient(x0, y0, x1, y1);
            grad.addColorStop(0, "rgba(255,255,255,0)");
            grad.addColorStop(0.15, `rgba(${r},${g},${b},0.16)`);
            grad.addColorStop(1, "rgba(255,255,255,0)");
            ctx.strokeStyle = grad;
          }
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
        const offset = mod(camZ, GRID_GAP);
        for (let z = near - offset + GRID_GAP; z < far; z += GRID_GAP) {
          if (z < near) continue;
          const a = Math.max(0, 1 - z / far) * 0.2;
          const sy = cy + (y * focal) / z;
          const half = (GRID_LINES * GRID_SPACING * focal) / z;
          ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
          ctx.beginPath();
          ctx.moveTo(cx - half, sy);
          ctx.lineTo(cx + half, sy);
          ctx.stroke();
        }
      }

      // estrelas com parallax de profundidade
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#fff";
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const z = mod(s.z - camZ, DEPTH);
        if (z < 0.3) continue;
        const k = focal / z;
        const sx = cx + s.x * k + mouse.x * (30 / z);
        const sy = cy + s.y * k + mouse.y * (20 / z);
        if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;
        const alpha = s.alpha * (1 - z / DEPTH);
        const size = Math.min(s.size * (1 + k * 0.006), 3);
        ctx.globalAlpha = alpha;
        if (vel > 0.08) {
          const k2 = focal / (z + vel * 3);
          ctx.lineWidth = size;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(cx + s.x * k2 + mouse.x * (30 / z), cy + s.y * k2 + mouse.y * (20 / z));
          ctx.stroke();
        } else {
          ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;

      // vinheta e escurecimento leve para manter o texto legível
      const vig = ctx.createRadialGradient(w / 2, h / 2, base * 0.35, w / 2, h / 2, Math.max(w, h) * 0.8);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, 0, w, h);
    };

    resize();
    readScroll();
    curP = targetP;

    // movimento reduzido: um único quadro estático, sem loop
    if (reduced) {
      draw(0, 0);
      const onResizeStatic = () => {
        resize();
        readScroll();
        curP = targetP;
        draw(0, 0);
      };
      window.addEventListener("resize", onResizeStatic);
      window.addEventListener("scroll", onResizeStatic, { passive: true });
      return () => {
        window.removeEventListener("resize", onResizeStatic);
        window.removeEventListener("scroll", onResizeStatic);
      };
    }

    let raf = 0;
    let last = 0;
    let running = true;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!running) return;
      if (FRAME_MS && now - last < FRAME_MS) return;
      last = now;
      curP += (targetP - curP) * 0.07;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      draw(now, 1);
    };

    const onMouse = (e: MouseEvent) => {
      mouse.tx = (e.clientX / w - 0.5) * 2;
      mouse.ty = (e.clientY / h - 0.5) * 2;
    };
    const onVisibility = () => {
      running = !document.hidden;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", readScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    if (!isMobile) window.addEventListener("mousemove", onMouse, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", readScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none bg-black"
      style={{ zIndex: 0 }}
    />
  );
}
