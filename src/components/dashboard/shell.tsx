"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, ShoppingCart, Users, ListTodo, ScrollText, LogOut, ChevronRight, Package, Users2, BookOpen, FileText, DollarSign } from "lucide-react";
import { VoidBackground } from "@/components/landing/void-background";

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
];

interface ShellProps {
  user: { name?: string | null; image?: string | null; username?: string };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: ShellProps) {
  const pathname = usePathname();

  return (
    <>
      <VoidBackground />
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className="w-60 flex flex-col shrink-0 border-r backdrop-blur-md overflow-y-auto"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight">
                VØID <span className="font-light text-silver/60">Systems</span>
              </span>
            </Link>
            <p className="text-[10px] text-silver/30 mt-0.5">Painel Staff</p>
          </div>

          <nav className="flex-1 p-2 space-y-0.5 mt-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    active ? "text-white" : "text-silver/50 hover:text-white hover:bg-white/[0.04]"
                  }`}
                  style={active ? { backgroundColor: "rgba(255,255,255,0.08)" } : {}}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {active && <ChevronRight className="w-3 h-3 ml-auto opacity-30" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2.5 mb-2 px-2">
              {user.image ? (
                <Image src={user.image} alt="" width={28} height={28} className="rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                  {(user.username || user.name || "?")[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{user.username || user.name}</p>
                <p className="text-[10px] text-silver/30">Staff</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-silver/40 hover:text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
