// Conteúdo editável da home. Altere aqui, sem mexer nos componentes.

/** Clientes exibidos na faixa em carrossel (ordem = ordem de exibição). */
export const clients: string[] = ["Rust Brasil", "Junin", "IdosoZ", "RubyHub", "Berdo"];

export interface Stat {
  label: string;
  /** Número final do contador. */
  value: number;
  prefix?: string;
  /** Símbolo que fica no final, depois do número (ex.: "+", "/5", "%"). */
  suffix?: string;
  /** Casas decimais (ex.: 1 para 99,9). */
  decimals?: number;
  /** true = sem contagem: o valor aparece direto, só com fade (ex.: um ano). Também não usa separador de milhar. */
  still?: boolean;
}

/** Números da seção de contadores da home e da página de clientes. */
export const stats: Stat[] = [
  { label: "Projetos entregues", value: 10, suffix: "+" },
  { label: "Avaliação média", value: 5, suffix: "/5" },
  { label: "No mercado desde", value: 2025, still: true },
  { label: "Estabilidade pós-entrega", value: 100, suffix: "%" },
];

/** Discord da loja (orçamentos, tickets e suporte). */
export const DISCORD_LINK = "https://discord.gg/voidsystems";

/** Passos da seção "Como funciona". */
export const steps = [
  { title: "Escolha o bot", desc: "Veja o catálogo, compare e adicione ao carrinho o que o seu servidor precisa." },
  { title: "Configure em minutos", desc: "Feche pelo Discord e a nossa equipe deixa tudo pronto com você, de forma simples." },
  { title: "O bot trabalha 24h", desc: "Hospedado por nós, o bot roda sozinho no seu servidor, sem você se preocupar." },
];

/** Cards da seção "Por que a VØID". `icon` é o nome do ícone em ReasonsSection. */
export const reasons = [
  { icon: "support", title: "Suporte rápido", desc: "Atendimento direto pelo Discord, com gente de verdade do outro lado." },
  { icon: "server", title: "Hospedagem e estabilidade", desc: "Seus bots ficam hospedados com a gente, rodando de forma estável." },
  { icon: "language", title: "Tudo em português", desc: "Bots, comandos, painéis e atendimento em português do Brasil." },
  { icon: "setup", title: "Configuração simples", desc: "Sem código e sem complicação: você configura e a gente ajuda no que precisar." },
] as const;

/** Perguntas do FAQ. */
export const faqs = [
  { q: "Como funciona o pagamento?", a: "Aceitamos apenas Pix. O pagamento é mensal e você pode cancelar a qualquer momento pelo Discord." },
  { q: "Quanto tempo leva pra configurar?", a: "A maioria dos bots fica pronto no mesmo dia. Configurações mais complexas podem levar 48 horas ou mais." },
  { q: "O bot fica hospedado onde?", a: "Os bots ficam hospedados em servidores nossos. Você não precisa se preocupar com hospedagem nem com manutenção." },
  { q: "E se eu precisar de algo personalizado?", a: "Fazemos bots sob medida. Entre no Discord, abra um ticket e descreva o que precisa. Enviamos um orçamento sem compromisso." },
  { q: "Posso trocar de plano depois?", a: "Sim, você pode fazer upgrade ou downgrade a qualquer momento. A diferença é ajustada no próximo pagamento." },
];

/** Itens de confiança abaixo dos botões do hero. */
export const trust = ["Pagamento via Pix", "Cancele quando quiser", "Suporte direto no Discord"];

/** Cards "Explore" da home, que levam às páginas do site. */
export const explore = [
  { href: "/bots", title: "Bots", desc: "Ticket, registro, verificação e mais. Veja o catálogo completo." },
  { href: "/como-funciona", title: "Como funciona", desc: "Do pedido ao bot rodando, e por que escolher a VØID." },
  { href: "/clientes", title: "Clientes", desc: "Os servidores que já rodam bots da VØID." },
  { href: "/faq", title: "FAQ", desc: "Pagamento, prazos, hospedagem e outras dúvidas." },
];

/** Ids (de src/config/bots.ts) dos bots mostrados em "Bots em destaque" na home. */
export const featuredBotIds = ["ticket", "registro-cla", "verificacao"];
