"use client";

import { useEffect, useRef } from "react";
import "./kinetic-title.css";

interface KineticTitleProps {
  as?: "h1" | "h2";
  className?: string;
  /** Parte inicial do título. */
  children: string;
  /** Parte final, destacada na cor de destaque (--void-accent). */
  accent?: string;
}

/** Título com tipografia cinética: desliza com borrão e inclinação e estabiliza ao entrar na tela. */
export function KineticTitle({ as: Tag = "h2", className = "", children, accent }: KineticTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          // só na primeira entrada: ao rolar de volta o título não borra de novo
          el.classList.add("kin-hit");
          io.disconnect();
        }),
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`kin ${className}`}>
      {children}
      {accent && (
        <>
          {" "}
          <em className="kin-accent">{accent}</em>
        </>
      )}
    </Tag>
  );
}
