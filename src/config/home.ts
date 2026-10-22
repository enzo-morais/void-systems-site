// Conteúdo editável da home. Altere aqui, sem mexer nos componentes.
import { PAYMENT_NOTE } from "./store";

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

/** Perguntas do FAQ da home (5 a 6). */
export const faqs = [
  { q: "Como funciona o pagamento?", a: PAYMENT_NOTE },
  { q: "Qual combo escolher?", a: "O Simples cobre o essencial de qualquer servidor. O Community soma economia, loja, níveis e eventos. DayZ e Server Games são feitos para comunidades desses jogos. Na dúvida, chame a equipe no Discord." },
  { q: "Quanto tempo leva pra configurar?", a: "A maioria dos combos fica pronta no mesmo dia. Configurações mais complexas podem levar 48 horas ou mais." },
  { q: "O bot fica hospedado onde?", a: "Os bots ficam hospedados em servidores nossos. Você não precisa se preocupar com hospedagem nem com manutenção." },
  { q: "Posso trocar de combo depois?", a: "Sim, você pode fazer upgrade ou downgrade a qualquer momento. A diferença é ajustada no próximo pagamento." },
  { q: "E se eu precisar de algo personalizado?", a: "Fazemos bots sob medida. Entre no Discord, abra um ticket e descreva o que precisa. Enviamos um orçamento sem compromisso." },
];

/** Diferenciais da VØID (grade numerada de 6). */
export const differentials = [
  { title: "Um único /config", desc: "Todos os módulos do seu combo ficam num só comando: liga, desliga e ajusta sem sair do Discord." },
  { title: "Emojis e cores da sua marca", desc: "Mensagens, painéis e botões usam os emojis e as cores do seu servidor, não os nossos." },
  { title: "Os dados são seus", desc: "Tudo o que o bot guarda pertence ao seu servidor, e você pode pedir uma cópia quando quiser." },
  { title: "Painel web", desc: "Acompanhe e ajuste o bot pelo navegador, com a visão completa do que está acontecendo." },
  { title: "Transcript web", desc: "O histórico de cada ticket vira uma página para a equipe consultar quando precisar." },
  { title: "Suporte direto no Discord", desc: "Atendimento de verdade pelo nosso Discord, sem robô no meio do caminho." },
] as const;

/** Frases da faixa em rolagem contínua (cinza, bem sutil). */
export const marqueeItems = ["Um único /config", "Hospedagem 24h", "Painel web", "Transcript web", "Seus dados são seus", "Suporte no Discord", "Pix pelo Discord", "Sem fidelidade"];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

/**
 * Depoimentos REAIS de clientes. Enquanto esta lista estiver vazia, a seção de depoimentos fica oculta.
 * Exemplo: { quote: "Texto do cliente", name: "Nome", role: "Dono do servidor X" }
 */
export const testimonials: Testimonial[] = [];

/** Itens de confiança abaixo dos botões do hero. */
export const trust = ["Pix pelo Discord", "Cancele quando quiser", "Suporte direto no Discord"];

/** Cards "Explore" da home, que levam às páginas do site. */
export const explore = [
  { href: "/bots", title: "Bots", desc: "Ticket, registro, verificação e mais. Veja o catálogo completo." },
  { href: "/como-funciona", title: "Como funciona", desc: "Do pedido ao bot rodando, e por que escolher a VØID." },
  { href: "/clientes", title: "Clientes", desc: "Os servidores que já rodam bots da VØID." },
  { href: "/faq", title: "FAQ", desc: "Pagamento, prazos, hospedagem e outras dúvidas." },
];

/** Ids (de src/config/bots.ts) dos bots mostrados em "Bots em destaque" na home. */
export const featuredBotIds = ["ticket", "registro-cla", "verificacao"];
