import Link from "next/link";
import "@/components/home/home.css";
import "@/components/home/hero.css";

export default function NotFound() {
  return (
    <main className="site-root relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-[9rem] sm:text-[12rem] font-bold leading-none tracking-tighter" style={{ color: "rgba(143,125,255,0.16)" }}>
        404
      </p>
      <h1 className="text-3xl font-bold -mt-6 sm:-mt-10 mb-3">Página não encontrada</h1>
      <p className="text-sm text-silver/80 mb-8 max-w-sm">A página que você está procurando não existe ou foi movida.</p>
      <Link href="/" className="hero-cta hero-cta--primary">
        Voltar ao início
      </Link>
    </main>
  );
}
