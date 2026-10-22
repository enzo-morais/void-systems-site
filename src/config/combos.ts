// COMBOS DA LOJA: o único arquivo para editar preços, textos, recursos e chips dos combos.
// Nada aqui mexe no layout. Os cards, as seções de destaque, a tabela de comparação, os planos e o botão
// "Contratar" leem tudo deste arquivo.
//
// Como editar:
//  - Preço: troque `oldPrice` (preço antigo, riscado) e `price` (preço atual). A % de desconto é calculada sozinha.
//  - Card da grade: `name`, `tagline` e `highlights` (de 4 a 6 linhas curtas, aparecem com o ícone de check).
//  - Seção de destaque: tudo em `spotlight` (rótulo, título em 2 linhas, subtítulo, 3 itens, chips e o texto do cartão verde).
//  - Tabela de comparação: `features` lista os ids (de `featureRows`) que o combo inclui; quem não está na lista aparece com "—".
//  - Novo recurso na tabela: adicione uma linha em `featureRows` e o id dela em `features` dos combos que o têm.
//  - Combo em destaque (selo "Mais escolhido"): `featured: true`.
//  - Ordem dos combos na tela = ordem deste array (as seções de destaque alternam o lado sozinhas).

export interface SpotlightItem {
  title: string;
  desc: string;
}

export interface Spotlight {
  /** Rótulo pequeno em caixa alta acima do título. */
  label: string;
  /** Título grande em duas linhas. */
  title: [string, string];
  subtitle: string;
  /** "steps" = passos numerados (01, 02, 03); "checks" = lista com check. */
  style: "steps" | "checks";
  /** Exatamente 3 itens. */
  items: [SpotlightItem, SpotlightItem, SpotlightItem];
  /** Chips pequenos no pé da seção. */
  chips: string[];
  /** Texto do cartão verde de resultado no pé do mockup do tablet. */
  result: string;
}

export interface Combo {
  id: string;
  name: string;
  /** Frase curta sob o nome. */
  tagline: string;
  /** Preço antigo (riscado), em reais por mês. */
  oldPrice: number;
  /** Preço atual, em reais por mês. */
  price: number;
  /** Selo "Mais escolhido" no card. */
  featured?: boolean;
  /** Recursos principais do card (4 a 6 linhas). */
  highlights: string[];
  /** Ids de `featureRows` incluídos neste combo (usado pela tabela de comparação). */
  features: string[];
  spotlight: Spotlight;
}

export interface FeatureRow {
  id: string;
  label: string;
}

/** Linhas da tabela de comparação, na ordem em que aparecem. */
export const featureRows: FeatureRow[] = [
  { id: "ticket", label: "Tickets de atendimento" },
  { id: "welcome", label: "Boas-vindas" },
  { id: "roles", label: "Cargos automáticos" },
  { id: "moderation", label: "Moderação" },
  { id: "utilities", label: "Utilidades" },
  { id: "economy", label: "Economia" },
  { id: "shop", label: "Loja" },
  { id: "levels", label: "Níveis" },
  { id: "reputation", label: "Reputação" },
  { id: "suggestions", label: "Sugestões" },
  { id: "polls", label: "Votações" },
  { id: "events", label: "Eventos" },
  { id: "status", label: "Status multi-servidor" },
  { id: "clans", label: "Clãs e times" },
  { id: "giveaways", label: "Sorteios" },
  { id: "webpanel", label: "Painel web" },
  { id: "recruitment", label: "Recrutamento" },
  { id: "lfg", label: "Procura de jogadores (LFG)" },
  { id: "tempvoice", label: "Salas de voz temporárias" },
  { id: "tournaments", label: "Torneios" },
];

export const combos: Combo[] = [
  {
    id: "simples",
    name: "Simples",
    tagline: "O essencial bem feito.",
    oldPrice: 29.9,
    price: 19.9,
    highlights: ["Tickets de atendimento", "Boas-vindas", "Cargos automáticos", "Moderação", "Utilidades"],
    features: ["ticket", "welcome", "roles", "moderation", "utilities"],
    spotlight: {
      label: "VØID Simples",
      title: ["O essencial do seu servidor,", "pronto em minutos."],
      subtitle: "Atendimento, entrada de membros e moderação num pacote enxuto, configurado por um único comando.",
      style: "steps",
      items: [
        { title: "Abra o /config", desc: "Todos os módulos ficam num só painel: ligue o que quiser e deixe o resto desligado." },
        { title: "Ajuste com a sua cara", desc: "Escolha canais, cargos, mensagens e as cores do seu servidor, sem escrever código." },
        { title: "O bot trabalha sozinho", desc: "Tickets, boas-vindas e moderação rodando 24h, com histórico de tudo que acontece." },
      ],
      chips: ["Ticket", "Boas-vindas", "Cargos", "Moderação", "Utilidades"],
      result: "Resolvido",
    },
  },
  {
    id: "community",
    name: "Community",
    tagline: "Tudo do Simples, mais engajamento.",
    oldPrice: 69.9,
    price: 49.9,
    featured: true,
    highlights: ["Tudo do combo Simples", "Economia e loja", "Níveis e reputação", "Sugestões e votações", "Eventos"],
    features: ["ticket", "welcome", "roles", "moderation", "utilities", "economy", "shop", "levels", "reputation", "suggestions", "polls", "events"],
    spotlight: {
      label: "VØID Community",
      title: ["Uma comunidade viva,", "do primeiro dia."],
      subtitle: "Tudo do Simples mais economia, loja, níveis e eventos para o seu pessoal ter motivo de voltar todo dia.",
      style: "steps",
      items: [
        { title: "Membros ganham XP", desc: "Cada mensagem e participação rende pontos, níveis e reputação, com ranking sempre atualizado." },
        { title: "Moeda e loja própria", desc: "Crie a economia do servidor e venda cargos, itens e vantagens com a moeda da comunidade." },
        { title: "A comunidade decide", desc: "Sugestões, votações e eventos para o servidor crescer junto com quem participa." },
      ],
      chips: ["Economia", "Loja", "Níveis", "Reputação", "Sugestões", "Votações", "Eventos"],
      result: "Nova venda",
    },
  },
  {
    id: "dayz",
    name: "DayZ",
    tagline: "Feito para servidores de DayZ.",
    oldPrice: 59.9,
    price: 39.9,
    highlights: ["Status multi-servidor", "Clãs", "Sorteios", "Painel web"],
    features: ["status", "clans", "giveaways", "webpanel"],
    spotlight: {
      label: "VØID DayZ",
      title: ["Seu servidor de DayZ", "sempre à vista."],
      subtitle: "Status em tempo real de todos os seus servidores, clãs organizados e um painel web para a staff.",
      style: "checks",
      items: [
        { title: "Status multi-servidor", desc: "Jogadores, ping, mapa e tempo no ar de cada servidor, atualizados direto no Discord." },
        { title: "Clãs e sorteios", desc: "Registro de clãs com líder e membros, e sorteios para animar a comunidade." },
        { title: "Painel web", desc: "Gerencie tudo pelo navegador, com a visão completa do seu servidor." },
      ],
      chips: ["Status", "Multi-servidor", "Clãs", "Sorteios", "Painel web"],
      result: "Servidor online",
    },
  },
  {
    id: "server-games",
    name: "Server Games",
    tagline: "Para comunidades de jogos e competição.",
    oldPrice: 89.9,
    price: 59.9,
    highlights: ["Clãs e times", "Recrutamento e procura de jogadores (LFG)", "Salas de voz temporárias", "Torneios e eventos", "Votação e níveis"],
    features: ["clans", "recruitment", "lfg", "tempvoice", "tournaments", "events", "polls", "levels"],
    spotlight: {
      label: "VØID Server Games",
      title: ["Times, torneios", "e jogo de verdade."],
      subtitle: "Organize clãs, recrute jogadores, abra salas de voz sob demanda e rode torneios completos no seu servidor.",
      style: "checks",
      items: [
        { title: "Clãs, times e recrutamento", desc: "Monte times, abra vagas e ache jogadores com a procura de grupo (LFG)." },
        { title: "Salas de voz temporárias", desc: "Cada grupo ganha a sua sala, que some sozinha quando todo mundo sai." },
        { title: "Torneios e eventos", desc: "Chaves, partidas, votação e níveis para a competição rolar do começo ao campeão." },
      ],
      chips: ["Clãs", "Recrutamento", "LFG", "Salas de voz", "Torneios", "Eventos", "Votação", "Níveis"],
      result: "Campeão definido",
    },
  },
];

/** Porcentagem de desconto, calculada a partir dos dois preços (nunca digitada). Ex.: 29,90 -> 19,90 = 33%. */
export function discountPercent(combo: Pick<Combo, "oldPrice" | "price">): number {
  if (combo.oldPrice <= 0 || combo.price >= combo.oldPrice) return 0;
  return Math.round((1 - combo.price / combo.oldPrice) * 100);
}
