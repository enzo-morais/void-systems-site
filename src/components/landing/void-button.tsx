"use client";

import { useRef } from "react";

interface VoidButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export function VoidButton({ href, children, variant = "primary", className = "" }: VoidButtonProps) {
  const btnRef = useRef<HTMLAnchorElement>(null);

  function handleClick(e: React.MouseEvent) {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ripple.style.cssText = `
      position:absolute;left:${x}px;top:${y}px;width:20px;height:20px;
      border-radius:50%;background:${variant === "primary" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"};
      transform:scale(0);animation:ripple 0.6s ease-out forwards;pointer-events:none;
      margin-left:-10px;margin-top:-10px;
    `;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  const base = "relative overflow-hidden inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-300 cursor-pointer";
  const scale = "hover:scale-105";

  const variants = {
    primary: `${base} ${scale} bg-white text-black px-8 py-3.5 text-base hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]`,
    secondary: `${base} ${scale} px-8 py-3.5 text-base text-white border`,
  };

  const secondaryStyle = variant === "secondary"
    ? { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)" }
    : {};

  return (
    <a
      ref={btnRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`${variants[variant]} ${className}`}
      style={{
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        ...secondaryStyle,
      }}
      onMouseEnter={(e) => {
        if (variant === "secondary") {
          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.1)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.4)";
        }
      }}
      onMouseLeave={(e) => {
        if (variant === "secondary") {
          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
        }
      }}
    >
      {variant === "primary" && (
        <span
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
            animation: "shine 3s linear infinite",
          }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </a>
  );
}
