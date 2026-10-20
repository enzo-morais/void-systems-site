// Catálogo de bots da home. Todos os dados dos cards ficam neste array.

export type Badge = "Destaque" | "Popular" | "Novo";

/** Passo da mini-animação que aparece ao passar o mouse no card. */
export interface DemoStep {
  /** user = membro, btn = clique em botão, bot = resposta do bot, sys = aviso do servidor */
  kind: "user" | "btn" | "bot" | "sys";
  text: string;
}

export interface BotItem {
  id: string;
  name: string;
  description: string;
  /** Preço por mês em reais. Use null para "Sob orçamento" (preço 0 também nunca é exibido). */
  price: number | null;
  tags: string[];
  badge?: Badge;
  /** Texto buscado no catálogo (/produtos) ao clicar em "Contratar". */
  search: string;
  demo: DemoStep[];
}

export const bots: BotItem[] = [
  {
    id: "ticket",
    name: "Bot de Ticket",
    description: "Painel de atendimento com canais privados, categorias e logs de cada ticket.",
    price: 12.9,
    tags: ["Discord"],
    badge: "Destaque",
    search: "Bot de Ticket",
    demo: [
      { kind: "btn", text: "Abrir ticket" },
      { kind: "bot", text: "Ticket #0042 criado em #ticket-lucas" },
      { kind: "bot", text: "Equipe avisada. Já já respondemos." },
    ],
  },
  {
    id: "boas-vindas",
    name: "Bot de Boas-vindas + Auto Role",
    description: "Recebe cada novo membro com mensagem personalizada e já entrega o cargo certo.",
    price: 5.9,
    tags: ["Discord"],
    badge: "Popular",
    search: "Bot de Boas-vindas",
    demo: [
      { kind: "sys", text: "Lucas entrou no servidor" },
      { kind: "bot", text: "Bem-vindo, @Lucas! Leia as #regras." },
      { kind: "bot", text: "Cargo @Membro adicionado." },
    ],
  },
  {
    id: "registro",
    name: "Bot de Registro",
    description: "Formulário de registro de membros com aprovação da staff e cargo automático.",
    price: 9.9,
    tags: ["Discord"],
    badge: "Popular",
    search: "Bot de Registro",
    demo: [
      { kind: "btn", text: "Registrar-se" },
      { kind: "bot", text: "Registro enviado para análise." },
      { kind: "bot", text: "Aprovado! Cargo @Registrado entregue." },
    ],
  },
  {
    id: "registro-cla",
    name: "Bot de Registro de Clã",
    description: "Cadastro de clãs do seu servidor DayZ, com líder, membros e painel da staff.",
    price: 14.9,
    tags: ["Discord", "DayZ"],
    badge: "Popular",
    search: "Registro de Clã",
    demo: [
      { kind: "btn", text: "Registrar clã" },
      { kind: "bot", text: "Clã RedWolves registrado." },
      { kind: "bot", text: "Líder: Lucas · cargo @Líder de Clã entregue." },
    ],
  },
  {
    id: "status-ip",
    name: "Bot de Status de IP",
    description: "Mostra no Discord se o seu servidor DayZ está online, com jogadores e atualização automática.",
    price: 7.9,
    tags: ["Discord", "DayZ"],
    badge: "Popular",
    search: "Status de IP",
    demo: [
      { kind: "bot", text: "Servidor online · 42/60 jogadores" },
      { kind: "sys", text: "Atualizado automaticamente" },
      { kind: "bot", text: "Servidor reiniciando em 5 min" },
    ],
  },
  {
    id: "anuncio",
    name: "Bot de Anúncio",
    description: "Publique anúncios em embed no canal certo, com um comando simples.",
    price: 4.9,
    tags: ["Discord"],
    search: "Bot de Anúncio",
    demo: [
      { kind: "user", text: "/anunciar Evento neste sábado" },
      { kind: "bot", text: "Anúncio publicado em #avisos." },
      { kind: "sys", text: "@everyone notificado" },
    ],
  },
  {
    id: "bate-ponto",
    name: "Bot de Bate-ponto",
    description: "Controle de entrada e saída da sua equipe, com horas somadas e histórico.",
    price: 7.9,
    tags: ["Discord"],
    search: "Bate-ponto",
    demo: [
      { kind: "btn", text: "Bater ponto" },
      { kind: "bot", text: "Entrada registrada às 14:02." },
      { kind: "bot", text: "Horas de hoje: 03:15" },
    ],
  },
  {
    id: "verificacao",
    name: "Bot de Verificação",
    description: "Libera o acesso só para quem passa na verificação e barra contas suspeitas.",
    price: 19.9,
    tags: ["Discord"],
    search: "Bot de Verificação",
    demo: [
      { kind: "sys", text: "Novo membro aguardando" },
      { kind: "btn", text: "Verificar" },
      { kind: "bot", text: "Verificado! Acesso liberado." },
    ],
  },
  {
    id: "personalizado",
    name: "Bot Personalizado",
    description: "Um bot sob medida para o que o seu servidor precisa, do zero.",
    price: null,
    tags: ["Discord"],
    badge: "Novo",
    search: "Bot Personalizado",
    demo: [
      { kind: "user", text: "Quero um bot que faça isso..." },
      { kind: "bot", text: "Vamos montar o seu projeto." },
      { kind: "bot", text: "Orçamento sob medida para você." },
    ],
  },
];

/** Nunca devolve R$0,00: sem preço (ou preço 0), mostra "Sob orçamento". */
export function formatPrice(price: number | null): { main: string; suffix: string } {
  if (price === null || price <= 0) return { main: "Sob orçamento", suffix: "" };
  return { main: `R$${price.toFixed(2).replace(".", ",")}`, suffix: "/mês" };
}
