import Link from "next/link";
import { DISCORD_STORE_URL } from "@/config/store";

export function Footer() {
  return (
    <footer className="px-6 pb-10 pt-10" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="text-center sm:text-left">
          <p className="text-lg font-bold tracking-tight text-white">
            VØID <span className="font-light text-silver">Systems</span>
          </p>
          <p className="mt-1 text-xs text-silver/75">&copy; 2026 VØID Systems. Todos os direitos reservados.</p>
        </div>

        <nav className="flex items-center gap-6 text-sm text-silver/75">
          <a href={DISCORD_STORE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Discord
          </a>
          <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
          <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
        </nav>
      </div>
    </footer>
  );
}
