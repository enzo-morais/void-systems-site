"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/bots", label: "Bots" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/clientes", label: "Clientes" },
  { href: "/faq", label: "FAQ" },
];

export function HomeHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const accountHref = session ? "/perfil" : "/login";
  const accountLabel = session ? "Perfil" : "Entrar";
  const isStaff = (session?.user as { isStaff?: boolean } | undefined)?.isStaff === true;

  return (
    <header
      className="site-header fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.08)", viewTransitionName: "site-header" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          VØID <span className="font-light text-silver">Systems</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`text-sm transition-colors ${pathname === link.href ? "text-white" : "text-silver/80 hover:text-white"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isStaff && (
            <Link href="/dashboard" className="text-sm text-white/90 hover:text-white transition-colors">
              Painel
            </Link>
          )}
          <Link href={accountHref} className="text-sm text-silver/75 hover:text-white transition-colors">
            {accountLabel}
          </Link>
          <Link
            href="/bots"
            className="text-sm px-5 py-2 rounded-lg font-medium text-black bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-shadow"
          >
            Ver bots
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="md:hidden p-2 cursor-pointer text-silver hover:text-white transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div
          className="md:hidden border-t px-6 py-4 space-y-1"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", borderColor: "rgba(255,255,255,0.06)" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`block text-sm transition-colors py-2.5 ${pathname === link.href ? "text-white" : "text-silver hover:text-white"}`}
            >
              {link.label}
            </Link>
          ))}
          {isStaff && (
            <Link href="/dashboard" onClick={() => setOpen(false)} className="block text-sm py-2.5 text-white">
              Painel administrativo
            </Link>
          )}
          <div className="pt-3 flex items-center gap-3">
            <Link
              href={accountHref}
              onClick={() => setOpen(false)}
              className="flex-1 text-sm text-center py-2.5 rounded-lg text-silver"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {accountLabel}
            </Link>
            <Link
              href="/bots"
              onClick={() => setOpen(false)}
              className="flex-1 text-sm text-center py-2.5 rounded-lg font-medium text-black bg-white"
            >
              Ver bots
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
