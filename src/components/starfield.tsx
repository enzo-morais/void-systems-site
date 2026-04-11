"use client";

import { useEffect, useRef } from "react";

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; color: string;
    }

    const particles: Particle[] = [];
    const NUM_PARTICLES = 120;

    const dustColors = [
      "255,255,255",
      "200,210,255",
      "180,190,240",
      "220,200,255",
    ];

    function resize() {
      canvas!.width = canvas!.offsetWidth * window.devicePixelRatio;
      canvas!.height = canvas!.offsetHeight * window.devicePixelRatio;
    }
    resize();
    window.addEventListener("resize", resize);

    // Init particles
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: Math.random() * 3000,
        y: Math.random() * 2000,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2 - 0.1,
        size: 0.5 + Math.random() * 2,
        alpha: 0.1 + Math.random() * 0.3,
        color: dustColors[Math.floor(Math.random() * dustColors.length)],
      });
    }

    function drawAurora() {
      const w = canvas!.width;
      const h = canvas!.height;
      const t = time * 0.0003;

      // Multiple aurora layers
      for (let layer = 0; layer < 3; layer++) {
        const yBase = h * (0.3 + layer * 0.15);
        const hue = layer === 0 ? 260 : layer === 1 ? 220 : 280;
        const alpha = 0.015 - layer * 0.003;

        ctx!.beginPath();
        ctx!.moveTo(0, h);

        for (let x = 0; x <= w; x += 8) {
          const wave1 = Math.sin(x * 0.002 + t * (1 + layer * 0.3)) * h * 0.15;
          const wave2 = Math.sin(x * 0.005 + t * 1.5 + layer) * h * 0.08;
          const wave3 = Math.sin(x * 0.001 + t * 0.7 + layer * 2) * h * 0.1;
          const y = yBase + wave1 + wave2 + wave3;
          ctx!.lineTo(x, y);
        }

        ctx!.lineTo(w, h);
        ctx!.closePath();

        const grad = ctx!.createLinearGradient(0, yBase - h * 0.3, 0, yBase + h * 0.2);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.3, `hsla(${hue},60%,50%,${alpha})`);
        grad.addColorStop(0.5, `hsla(${hue},70%,40%,${alpha * 1.5})`);
        grad.addColorStop(0.7, `hsla(${hue},60%,30%,${alpha})`);
        grad.addColorStop(1, "transparent");
        ctx!.fillStyle = grad;
        ctx!.fill();
      }
    }

    function drawParticles() {
      const w = canvas!.width;
      const h = canvas!.height;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Gentle floating
        p.vx += (Math.random() - 0.5) * 0.01;
        p.vy += (Math.random() - 0.5) * 0.01;
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Draw
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx!.fill();

        // Soft glow for larger particles
        if (p.size > 1.5) {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${p.color},${p.alpha * 0.1})`;
          ctx!.fill();
        }
      }
    }

    function drawStars() {
      // Static background stars
      if (time < 20) {
        for (let i = 0; i < 300; i++) {
          const x = Math.random() * canvas!.width;
          const y = Math.random() * canvas!.height;
          const size = Math.random() * 1.2;
          const alpha = 0.1 + Math.random() * 0.2;
          ctx!.beginPath();
          ctx!.arc(x, y, size, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx!.fill();
        }
      }
    }

    function draw() {
      time += 16;
      const w = canvas!.width;
      const h = canvas!.height;

      // Fade trail
      ctx!.fillStyle = "rgba(0,0,0,0.03)";
      ctx!.fillRect(0, 0, w, h);

      drawAurora();
      drawParticles();

      animId = requestAnimationFrame(draw);
    }

    // Initial fill
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawStars();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
