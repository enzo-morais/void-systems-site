import Link from "next/link";
import "@/components/home/home.css";
import "@/components/home/hero.css";

export default function NotFound() {
  return (
    <main className="site-root relative z-10 min-h-screen flex items-center">
      <div className="wrap">
        <p className="font-display text-[9rem] sm:text-[14rem] font-bold leading-none tracking-tighter" style={{ color: "rgba(255, 255, 255, 0.08)" }}>
          404
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold -mt-6 sm:-mt-12 mb-3">Página não encontrada</h1>
        <p className="sec-lead mb-8">A página que você está procurando não existe ou foi movida.</p>
        <Link href="/" className="hero-cta hero-cta--primary">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
