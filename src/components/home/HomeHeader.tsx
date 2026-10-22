"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/#combos", label: "Combos" },
  { href: "/#recursos", label: "Recursos" },
  { href: "/#planos", label: "Planos" },
  { href: "/#clientes", label: "Clientes" },
  { href: "/#faq", label: "FAQ" },
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
      style={{ backgroundColor: "rgba(0,0,0,0.7)", borderColor: "#27272a", viewTransitionName: "site-header" }}
    >
      {/* logo na ponta esquerda; menu e botões na ponta direita */}
      <div className="wrap h-16 flex items-center justify-between gap-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-white shrink-0">
          VØID <span className="font-light text-silver">Systems</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href.split("#")[0] && link.href.endsWith("#combos") ? "page" : undefined}
                className="text-sm text-silver hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <span className="h-5 w-px" style={{ background: "#27272a" }} aria-hidden="true" />

          <div className="flex items-center gap-5">
            {isStaff && (
              <Link href="/dashboard" className="text-sm text-white hover:text-silver transition-colors">
                Painel
              </Link>
            )}
            <Link href={accountHref} className="text-sm text-silver hover:text-white transition-colors">
              {accountLabel}
            </Link>
            <Link href="/#combos" className="text-sm px-5 py-2 rounded-lg font-medium text-black bg-white hover:bg-zinc-200 transition-colors">
              Ver combos
            </Link>
          </div>
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="md:hidden p-2 -mr-2 cursor-pointer text-silver hover:text-white transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t" style={{ backgroundColor: "rgba(0,0,0,0.95)", borderColor: "#27272a" }}>
          <div className="wrap py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === link.href.split("#")[0] && link.href.endsWith("#combos") ? "page" : undefined}
                className="block text-sm transition-colors py-2.5 text-silver hover:text-white"
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
                style={{ border: "1px solid #3f3f46" }}
              >
                {accountLabel}
              </Link>
              <Link href="/#combos" onClick={() => setOpen(false)} className="flex-1 text-sm text-center py-2.5 rounded-lg font-medium text-black bg-white">
                Ver combos
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
