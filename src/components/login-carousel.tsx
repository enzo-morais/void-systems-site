"use client";

import { useState, useEffect } from "react";
import { Bot, Package, Users2, TrendingUp, Zap } from "lucide-react";

interface Slide {
  icon: typeof Bot;
  title: string;
  subtitle: string;
  description: string;
  items?: string[];
}

const staticSlides: Slide[] = [
  {
    icon: Zap,
    title: "VØID Systems",
    subtitle: "Automação completa para Discord",
    description: "Somos uma loja especializada em bots para Discord. Criamos soluções personalizadas para automatizar, organizar e melhorar seu servidor. Do ticket ao sorteio, tudo funcionando sozinho.",
  },
  {
    icon: Package,
    title: "Nossos Produtos",
    subtitle: "Bots profissionais para seu servidor",
    description: "Temos uma variedade de bots prontos para uso, cada um focado em resolver um problema específico do seu servidor. Confira nosso catálogo completo.",
    items: [],
  },
  {
    icon: Bot,
    title: "VØID Ticket",
    subtitle: "Gratuito e vitalício",
    description: "Nosso bot de ticket é 100% gratuito e já vem hospedado. Sistema completo com painéis customizáveis, transcripts HTML, logs detalhados e gerenciamento de equipe. Adicione e use — pra sempre.",
  },
  {
    icon: Users2,
    title: "Faça parte da equipe",
    subtitle: "Estamos contratando",
    description: "Buscamos pessoas comprometidas para fazer parte da VØID Systems. Trabalhe no seu tempo, ganhe comissão por venda e tenha acesso a ferramentas exclusivas. Candidate-se pelo nosso site.",
  },
  {
    icon: TrendingUp,
    title: "+50 servidores",
    subtitle: "Confiança e qualidade",
    description: "Mais de 50 servidores já confiam nos nossos bots. Suporte 24/7, uptime de 99.9% e atualizações constantes. Nosso compromisso é entregar qualidade e estabilidade.",
  },
];

export function LoginCarousel() {
  const [slides, setSlides] = useState<Slide[]>(staticSlides);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetch("/api/public/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const names = data.map((p: { name: string }) => p.name);
          setSlides((prev) =>
            prev.map((s, i) => (i === 1 ? { ...s, items: names } : s))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setVisible(true);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div
      className="w-full max-w-3xl rounded-2xl p-16 backdrop-blur-md"
      style={{
        backgroundColor: "rgba(255,255,255,0.005)",
        border: "1px solid rgba(255,255,255,0.03)",
        boxShadow: "0 0 60px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="transition-all duration-500"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
        }}
      >
        <div
          className="inline-flex p-3.5 rounded-xl mb-6"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Icon className="w-7 h-7 text-white/40" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-1">{slide.title}</h2>
        <p className="text-silver/40 text-sm mb-4">{slide.subtitle}</p>

        <p className="text-sm text-silver/30 leading-relaxed mb-6">{slide.description}</p>

        {slide.items && slide.items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {slide.items.map((item) => (
              <span
                key={item}
                className="text-xs px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-8">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setVisible(false); setTimeout(() => { setCurrent(i); setVisible(true); }, 300); }}
            className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
            style={{
              backgroundColor: i === current ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.1)",
              width: i === current ? 24 : 6,
            }}
          />
        ))}
      </div>
    </div>
  );
}
