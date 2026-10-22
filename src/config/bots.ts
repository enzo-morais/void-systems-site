// Catálogo de bots. Todos os dados dos cards (e da página de cada bot) ficam neste array.

export type Badge = "Destaque" | "Popular" | "Novo";
export type BotIcon = "ticket" | "welcome" | "register" | "clan" | "status" | "announce" | "clock" | "shield" | "custom";

/**
 * Passo da demonstração animada (roda ao passar o mouse no card):
 *  user  = membro mandando uma mensagem
 *  click = membro clicando em um botão
 *  bot   = resposta simples do bot
 *  embed = resposta do bot em embed (título, texto, campos e botões)
 *  sys   = aviso do servidor
 */
export type DemoStep =
  | { kind: "user"; name: string; text: string }
  | { kind: "click"; name: string; button: string }
  | { kind: "bot"; text: string }
  | { kind: "embed"; title: string; text?: string; fields?: [string, string][]; buttons?: string[]; color?: string }
  | { kind: "sys"; text: string };

export interface BotItem {
  id: string;
  name: string;
  description: string;
  /** Preço por mês em reais. Use null para "Sob orçamento" (preço 0 também nunca é exibido). */
  price: number | null;
  tags: string[];
  badge?: Badge;
  /** Ícone do card (nome em BotCard.tsx). */
  icon: BotIcon;
  /** Canal que aparece no topo da demonstração. */
  channel: string;
  demo: DemoStep[];
}

export const bots: BotItem[] = [
  {
    id: "ticket",
    icon: "ticket",
    name: "Bot de Ticket",
    description: "Painel de atendimento com canais privados, categorias e logs de cada ticket.",
    price: 12.9,
    tags: ["Discord"],
    badge: "Destaque",
    channel: "painel-tickets",
    demo: [
      { kind: "click", name: "Lucas", button: "Abrir ticket" },
      {
        kind: "embed",
        title: "Ticket #0042 criado",
        text: "Canal #ticket-lucas aberto só para você e a equipe.",
        fields: [["Categoria", "Suporte"], ["Status", "Aguardando"]],
        buttons: ["Fechar ticket", "Assumir"],
      },
      { kind: "bot", text: "Equipe avisada. Já já respondemos." },
    ],
  },
  {
    id: "boas-vindas",
    icon: "welcome",
    name: "Bot de Boas-vindas + Auto Role",
    description: "Recebe cada novo membro com mensagem personalizada e já entrega o cargo certo.",
    price: 5.9,
    tags: ["Discord"],
    badge: "Popular",
    channel: "boas-vindas",
    demo: [
      { kind: "sys", text: "Lucas entrou no servidor" },
      {
        kind: "embed",
        title: "Bem-vindo, Lucas!",
        text: "Leia as #regras e aproveite o servidor.",
        fields: [["Cargo", "@Membro"]],
        color: "#3ba55d",
      },
      { kind: "bot", text: "Cargo @Membro adicionado." },
    ],
  },
  {
    id: "registro",
    icon: "register",
    name: "Bot de Registro",
    description: "Formulário de registro de membros com aprovação da staff e cargo automático.",
    price: 9.9,
    tags: ["Discord"],
    badge: "Popular",
    channel: "registro",
    demo: [
      { kind: "click", name: "Lucas", button: "Registrar-se" },
      { kind: "bot", text: "Registro enviado para análise." },
      {
        kind: "embed",
        title: "Registro aprovado",
        text: "Lucas agora faz parte da comunidade.",
        fields: [["Status", "Aprovado"], ["Cargo", "@Registrado"]],
        color: "#3ba55d",
      },
    ],
  },
  {
    id: "registro-cla",
    icon: "clan",
    name: "Bot de Registro de Clã",
    description: "Cadastro de clãs do seu servidor DayZ, com líder, membros e painel da staff.",
    price: 14.9,
    tags: ["Discord", "DayZ"],
    badge: "Popular",
    channel: "registro-de-cla",
    demo: [
      { kind: "click", name: "Lucas", button: "Registrar clã" },
      {
        kind: "embed",
        title: "Clã RedWolves registrado",
        fields: [["Líder", "Lucas"], ["Cargo", "@Líder de Clã"]],
        buttons: ["Ver clã"],
      },
      { kind: "bot", text: "Painel da staff atualizado." },
    ],
  },
  {
    id: "status-ip",
    icon: "status",
    name: "Bot de Status de IP",
    description: "Mostra no Discord se o seu servidor DayZ está online, com jogadores e atualização automática.",
    price: 7.9,
    tags: ["Discord", "DayZ"],
    badge: "Popular",
    channel: "status-servidor",
    demo: [
      {
        kind: "embed",
        title: "Servidor online",
        fields: [["Jogadores", "42/60"], ["Status", "Online"]],
        color: "#3ba55d",
      },
      { kind: "sys", text: "Atualizado automaticamente" },
      { kind: "bot", text: "Servidor reiniciando em 5 min." },
    ],
  },
  {
    id: "anuncio",
    icon: "announce",
    name: "Bot de Anúncio",
    description: "Publique anúncios em embed no canal certo, com um comando simples.",
    price: 4.9,
    tags: ["Discord"],
    channel: "avisos",
    demo: [
      { kind: "user", name: "Ana", text: "/anunciar Evento neste sábado" },
      {
        kind: "embed",
        title: "Evento neste sábado",
        text: "Participe! Os detalhes estão no canal #eventos.",
        color: "#d4d4d8",
      },
      { kind: "sys", text: "@everyone notificado" },
    ],
  },
  {
    id: "bate-ponto",
    icon: "clock",
    name: "Bot de Bate-ponto",
    description: "Controle de entrada e saída da sua equipe, com horas somadas e histórico.",
    price: 7.9,
    tags: ["Discord"],
    channel: "bate-ponto",
    demo: [
      { kind: "click", name: "Lucas", button: "Bater ponto" },
      {
        kind: "embed",
        title: "Entrada registrada",
        fields: [["Horário", "14:02"], ["Hoje", "03:15"]],
      },
      { kind: "bot", text: "Bom trabalho, Lucas!" },
    ],
  },
  {
    id: "verificacao",
    icon: "shield",
    name: "Bot de Verificação",
    description: "Libera o acesso só para quem passa na verificação e barra contas suspeitas.",
    price: 19.9,
    tags: ["Discord"],
    channel: "verificacao",
    demo: [
      { kind: "sys", text: "Novo membro aguardando" },
      { kind: "click", name: "Lucas", button: "Verificar" },
      {
        kind: "embed",
        title: "Verificado!",
        text: "Acesso liberado ao servidor.",
        color: "#3ba55d",
      },
    ],
  },
  {
    id: "personalizado",
    icon: "custom",
    name: "Bot Personalizado",
    description: "Um bot sob medida para o que o seu servidor precisa, do zero.",
    price: null,
    tags: ["Discord"],
    badge: "Novo",
    channel: "orcamento",
    demo: [
      { kind: "user", name: "Lucas", text: "Quero um bot que faça isso..." },
      { kind: "bot", text: "Vamos montar o seu projeto." },
      { kind: "embed", title: "Orçamento sob medida", text: "Respondemos tudo pelo ticket." },
    ],
  },
];

/** Nunca devolve R$0,00: sem preço (ou preço 0), mostra "Sob orçamento". */
export function formatPrice(price: number | null): { main: string; suffix: string } {
  if (price === null || price <= 0) return { main: "Sob orçamento", suffix: "" };
  return { main: `R$${price.toFixed(2).replace(".", ",")}`, suffix: "/mês" };
}

/** Descontos por quantidade de bots mensais na calculadora (maior faixa primeiro). */
export const discountTiers = [
  { min: 4, pct: 20 },
  { min: 3, pct: 15 },
  { min: 2, pct: 10 },
];

export function getDiscountPct(count: number): number {
  return discountTiers.find((t) => count >= t.min)?.pct ?? 0;
}

/** Formata um valor em reais: 12.9 -> "R$12,90". */
export function brl(value: number): string {
  return `R$${value.toFixed(2).replace(".", ",")}`;
}
