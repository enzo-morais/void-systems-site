"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BookOpen,
  DollarSign,
  FileText,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Package,
  ScrollText,
  Server,
  ShoppingCart,
  Users,
  Users2,
  X,
} from "lucide-react";
import "@/components/home/home.css";
import "./panel-theme.css";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/guide", label: "Guia", icon: BookOpen },
  { href: "/dashboard/sales", label: "Vendas", icon: ShoppingCart },
  { href: "/dashboard/products", label: "Produtos", icon: Package },
  { href: "/dashboard/clients", label: "Clientes", icon: Users },
  { href: "/dashboard/team", label: "Equipe", icon: Users2 },
  { href: "/dashboard/commissions", label: "Comissões", icon: DollarSign },
  { href: "/dashboard/tasks", label: "Tarefas", icon: ListTodo },
  { href: "/dashboard/applications", label: "Formulários", icon: FileText },
  { href: "/dashboard/logs", label: "Logs", icon: ScrollText },
  { href: "/discloud", label: "Bots hospedados", icon: Server },
];

interface ShellProps {
  user: { name?: string | null; image?: string | null; username?: string };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: ShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // fecha o menu do celular ao trocar de página
  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <nav className="flex-1 p-3 space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={`pt-nav ${active ? "pt-nav--active" : ""}`} aria-current={active ? "page" : undefined}>
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const account = (
    <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
      <div className="flex items-center gap-3 mb-3">
        {user.image ? (
          <Image src={user.image} alt="" width={32} height={32} className="rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(255, 255, 255, 0.1)" }}>
            {(user.username || user.name || "?")[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user.username || user.name}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-silver/70">Staff</p>
        </div>
      </div>
      <button onClick={() => signOut({ callbackUrl: "/" })} className="pt-nav w-full cursor-pointer hover:!text-red-400">
        <LogOut className="w-4 h-4" />
        Sair
      </button>
    </div>
  );

  const brand = (
    <Link href="/" className="block">
      <span className="font-display text-lg font-bold tracking-tight">
        VØID <span className="font-medium text-silver/80">Systems</span>
      </span>
      <span className="block font-mono text-[10px] uppercase tracking-wider text-silver/70 mt-0.5">Painel staff</span>
    </Link>
  );

  return (
    <div className="site-root pt relative z-10 flex h-screen overflow-hidden">
      {/* barra lateral (desktop) */}
      <aside className="pt-side hidden md:flex w-64 flex-col shrink-0 overflow-y-auto">
        <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>{brand}</div>
        {nav}
        {account}
      </aside>

      {/* barra superior (celular) */}
      <div className="pt-top md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14">
        {brand}
        <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="p-2 text-silver hover:text-white cursor-pointer">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="pt-side relative w-72 max-w-[85vw] flex flex-col overflow-y-auto">
            <div className="p-5 border-b flex items-start justify-between" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              {brand}
              <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="p-1 text-silver hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            {nav}
            {account}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 overflow-y-auto px-4 md:px-8 pt-20 md:pt-8 pb-12">
        <div className="w-full max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}
