"use client";

import Link from "next/link";
import "@/components/home/home.css";
import "@/components/home/hero.css";

/** Erro inesperado em uma página: mesmo tema do site, sem mostrar detalhes técnicos. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="site-root relative z-10 min-h-screen flex items-center">
      <div className="wrap">
        <p className="font-display text-[9rem] sm:text-[14rem] font-bold leading-none tracking-tighter" style={{ color: "rgba(255, 255, 255, 0.08)" }}>
          Erro
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold -mt-6 sm:-mt-12 mb-3">Algo deu errado</h1>
        <p className="sec-lead mb-8">Tivemos um problema ao carregar esta página. Tente de novo; se continuar, fale com a gente no Discord.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={reset} className="hero-cta hero-cta--primary cursor-pointer">
            Tentar de novo
          </button>
          <Link href="/" className="hero-cta hero-cta--ghost">
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
