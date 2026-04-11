import Link from "next/link";
import { VoidBackground } from "@/components/landing/void-background";

export default function NotFound() {
  return (
    <>
      <VoidBackground />
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[10rem] font-bold leading-none tracking-tighter" style={{ color: "rgba(255,255,255,0.04)" }}>404</p>
        <h1 className="text-2xl font-bold -mt-8 mb-3">Página não encontrada</h1>
        <p className="text-sm text-silver/40 mb-8 max-w-sm">A página que você está procurando não existe ou foi movida.</p>
        <Link href="/" className="text-sm px-6 py-2.5 rounded-lg bg-white text-black font-medium transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]">
          Voltar ao início
        </Link>
      </main>
    </>
  );
}
