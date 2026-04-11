"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";

const DISCORD_LINK = "https://discord.gg/voidsystems";

const navLinks = [
  { href: "/produtos", label: "Produtos" },
  { href: "/equipe", label: "Fazer parte" },
  { href: "/sobre", label: "Sobre" },
];

export function Header() {
  const { data: session, status } = useSession();
  const isStaff = session?.user?.isStaff === true;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-sm border-b"
      style={{ backgroundColor: "rgba(10,10,10,0.5)", borderColor: "rgba(255,255,255,0.1)" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
        <Link href="/" className="text-xl font-bold tracking-tight">
          VØID <span className="font-light text-silver">Systems</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="relative text-sm text-silver hover:text-white transition-colors group">
              {link.label}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-3">
          {status === "loading" ? (
            <div className="w-20 h-9 rounded-lg animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
          ) : session ? (
            <>
              {isStaff && (
                <Link href="/dashboard" className="text-sm px-4 py-2 rounded-lg font-medium text-black bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300">
                  Painel Staff
                </Link>
              )}
              <Link href="/perfil" className="text-sm px-4 py-2 rounded-lg font-medium text-silver hover:text-white transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                Perfil
              </Link>
              <button onClick={() => signOut()} className="text-sm px-4 py-2 rounded-lg font-medium text-silver hover:text-white transition-colors cursor-pointer"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                Sair
              </button>
            </>
          ) : (
            <>
              <button onClick={() => signIn("discord")} className="text-sm px-5 py-2 rounded-lg font-medium text-white bg-[#5865F2] hover:bg-[#4752C4] transition-colors flex items-center gap-2 cursor-pointer">
                Login
              </button>
              <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer" className="text-sm px-5 py-2 rounded-lg font-medium text-silver hover:text-white transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                Discord
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 cursor-pointer text-silver hover:text-white transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t px-6 py-4 space-y-3" style={{ backgroundColor: "rgba(10,10,10,0.95)", borderColor: "rgba(255,255,255,0.06)" }}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block text-sm text-silver hover:text-white transition-colors py-2">
              {link.label}
            </a>
          ))}
          <div className="pt-3 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {session ? (
              <>
                {isStaff && (
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block text-sm text-center py-2 rounded-lg bg-white text-black font-medium">
                    Painel Staff
                  </Link>
                )}
                <Link href="/perfil" onClick={() => setMobileOpen(false)} className="block text-sm text-center py-2 rounded-lg text-silver"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  Perfil
                </Link>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="block w-full text-sm text-center py-2 rounded-lg text-silver cursor-pointer"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  Sair
                </button>
              </>
            ) : (
              <button onClick={() => { signIn("discord"); setMobileOpen(false); }} className="block w-full text-sm text-center py-2 rounded-lg bg-[#5865F2] text-white font-medium cursor-pointer">
                Login com Discord
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
