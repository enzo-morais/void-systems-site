import Link from "next/link";
import { DISCORD_STORE_URL } from "@/config/store";

const columns = [
  {
    title: "Loja",
    links: [
      { href: "/#combos", label: "Combos" },
      { href: "/bots", label: "Bots avulsos" },
      { href: "/#comparar", label: "Comparar combos" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "/como-funciona", label: "Como funciona" },
      { href: "/clientes", label: "Clientes" },
      { href: "/faq", label: "FAQ" },
      { href: "/sobre", label: "Sobre" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/termos", label: "Termos" },
      { href: "/privacidade", label: "Privacidade" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="pt-16 pb-10" style={{ borderTop: "1px solid #27272a" }}>
      <div className="wrap">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
          <div>
            <p className="text-xl font-bold tracking-tight text-white">
              VØID <span className="font-light text-silver">Systems</span>
            </p>
            <p className="mt-3 text-sm text-silver max-w-xs leading-relaxed">Bots e sistemas para Discord, hospedados e atendidos pela nossa equipe.</p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="eyebrow-l">{col.title}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-silver hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Contato">
            <p className="eyebrow-l">Contato</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={DISCORD_STORE_URL} target="_blank" rel="noopener noreferrer" className="text-silver hover:text-white transition-colors">
                  Discord
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-14 pt-6 text-xs text-zinc-500" style={{ borderTop: "1px solid #27272a" }}>
          &copy; 2026 VØID Systems. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
