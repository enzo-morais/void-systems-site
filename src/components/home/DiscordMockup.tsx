"use client";

import { useRef, useState } from "react";
import {
  Bell,
  ClipboardList,
  Gift,
  Hash,
  Headphones,
  Lock,
  Mic,
  Pin,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Ticket,
  Users,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import "./discord-mockup.css";

interface MockButton {
  label: string;
  icon?: LucideIcon;
  tone?: "blurple" | "danger";
}

interface Variant {
  id: string;
  /** Nome do servidor e da categoria onde ficam os canais da demonstração. */
  server: string;
  category: string;
  panelChannel: { name: string; icon: LucideIcon };
  resultChannel: { name: string; icon: LucideIcon };
  user: { name: string; tone: string };
  roleLabel: string;
  /** Mensagem do bot com o botão que o membro clica (cena A). */
  panel: { title: string; desc: string; foot: string; icon: LucideIcon; button: MockButton & { icon: LucideIcon } };
  /** Cena B: mensagem do membro, resposta do bot e cargo entregue. */
  userMessage: string;
  reply: { title: string; desc: string; fields: [string, string][]; foot: string; buttons: MockButton[] };
  roleName: string;
  /** Texto para leitores de tela. */
  alt: string;
}

const VARIANTS: Variant[] = [
  {
    id: "tickets",
    server: "VØID Community",
    category: "Atendimento",
    panelChannel: { name: "painel-tickets", icon: Ticket },
    resultChannel: { name: "ticket-lucas", icon: Lock },
    user: { name: "Lucas", tone: "linear-gradient(135deg,#f59e0b,#ef4444)" },
    roleLabel: "Cliente",
    panel: {
      title: "Central de Atendimento",
      desc: "Precisa de ajuda? Clique no botão abaixo para abrir um ticket com a nossa equipe.",
      foot: "VØID Systems · Atendimento",
      icon: Ticket,
      button: { label: "Abrir ticket", icon: Ticket },
    },
    userMessage: "Oi! Preciso de ajuda com o meu pedido.",
    reply: {
      title: "Ticket #0042 aberto",
      desc: "Olá, Lucas! Nossa equipe já foi avisada e responde em instantes.",
      fields: [["Categoria", "Suporte"], ["Prioridade", "Normal"], ["Status", "Aguardando"]],
      foot: "VØID Systems · Ticket",
      buttons: [{ label: "Fechar ticket", icon: Lock, tone: "danger" }, { label: "Assumir" }],
    },
    roleName: "@Cliente",
    alt: "um bot de tickets abrindo um ticket, respondendo ao membro e entregando um cargo",
  },
  {
    id: "verificacao",
    server: "Comunidade Nova",
    category: "Entrada",
    panelChannel: { name: "verificacao", icon: ShieldCheck },
    resultChannel: { name: "boas-vindas", icon: Hash },
    user: { name: "Marina", tone: "linear-gradient(135deg,#10b981,#0ea5e9)" },
    roleLabel: "Membro",
    panel: {
      title: "Verificação de membros",
      desc: "Clique em Verificar para liberar o acesso a todos os canais do servidor.",
      foot: "VØID Systems · Segurança",
      icon: ShieldCheck,
      button: { label: "Verificar", icon: ShieldCheck },
    },
    userMessage: "Oi pessoal, cheguei agora!",
    reply: {
      title: "Bem-vinda, Marina!",
      desc: "Verificação concluída. Leia as regras e se apresente no chat.",
      fields: [["Status", "Verificada"], ["Membro nº", "#1.204"], ["Acesso", "Liberado"]],
      foot: "VØID Systems · Boas-vindas",
      buttons: [{ label: "Ver regras", tone: "blurple" }, { label: "Apresentar-se" }],
    },
    roleName: "@Membro",
    alt: "um bot de verificação liberando o acesso de um novo membro e entregando o cargo",
  },
  {
    id: "loja",
    server: "Loja Gamer",
    category: "Loja",
    panelChannel: { name: "vitrine", icon: ShoppingCart },
    resultChannel: { name: "pedido-davi", icon: Lock },
    user: { name: "Davi", tone: "linear-gradient(135deg,#0ea5e9,#6366f1)" },
    roleLabel: "Cliente",
    panel: {
      title: "Vitrine de produtos",
      desc: "Escolha o seu plano e finalize o pagamento por Pix em poucos cliques.",
      foot: "VØID Systems · Vendas",
      icon: ShoppingCart,
      button: { label: "Comprar", icon: ShoppingCart },
    },
    userMessage: "Quero o plano mensal, por favor.",
    reply: {
      title: "Pedido #118 criado",
      desc: "Davi, seu pedido está reservado. Pague para liberar o acesso na hora.",
      fields: [["Produto", "Plano Mensal"], ["Valor", "R$ 29,90"], ["Pagamento", "Pix"]],
      foot: "VØID Systems · Pedido",
      buttons: [{ label: "Pagar com Pix", tone: "blurple" }, { label: "Cancelar", tone: "danger" }],
    },
    roleName: "@Cliente",
    alt: "um bot de loja criando um pedido com pagamento por Pix e entregando o cargo de cliente",
  },
  {
    id: "sorteio",
    server: "Comunidade Games",
    category: "Eventos",
    panelChannel: { name: "sorteios", icon: Gift },
    resultChannel: { name: "participantes", icon: Hash },
    user: { name: "Rafa", tone: "linear-gradient(135deg,#a855f7,#ec4899)" },
    roleLabel: "Participante",
    panel: {
      title: "Sorteio: Nitro de 1 mês",
      desc: "Clique em Participar para entrar no sorteio. O resultado sai em 24 horas.",
      foot: "VØID Systems · Eventos",
      icon: Gift,
      button: { label: "Participar", icon: Gift },
    },
    userMessage: "Participando! Boa sorte pra todo mundo.",
    reply: {
      title: "Você está no sorteio!",
      desc: "Rafa, a sua participação foi registrada com sucesso.",
      fields: [["Prêmio", "Nitro 1 mês"], ["Participantes", "128"], ["Termina em", "23h 41min"]],
      foot: "VØID Systems · Sorteio",
      buttons: [{ label: "Sair do sorteio", tone: "danger" }, { label: "Ver regras" }],
    },
    roleName: "@Participante",
    alt: "um bot de sorteios registrando a participação de um membro e entregando o cargo de participante",
  },
  {
    id: "registro",
    server: "Cidade RP",
    category: "Cidadania",
    panelChannel: { name: "registro", icon: ClipboardList },
    resultChannel: { name: "registro-bruno", icon: Lock },
    user: { name: "Bruno", tone: "linear-gradient(135deg,#14b8a6,#22c55e)" },
    roleLabel: "Cidadão",
    panel: {
      title: "Registro de cidadão",
      desc: "Clique em Iniciar registro e preencha os seus dados para entrar na cidade.",
      foot: "VØID Systems · Registro",
      icon: ClipboardList,
      button: { label: "Iniciar registro", icon: ClipboardList },
    },
    userMessage: "Preenchi o formulário com os meus dados.",
    reply: {
      title: "Registro enviado",
      desc: "Bruno, a equipe vai analisar os seus dados em instantes.",
      fields: [["Nome", "Bruno Santos"], ["Idade", "24 anos"], ["Status", "Em análise"]],
      foot: "VØID Systems · Registro",
      buttons: [{ label: "Aprovar", tone: "blurple" }, { label: "Recusar", tone: "danger" }],
    },
    roleName: "@Cidadão",
    alt: "um bot de registro recebendo um formulário de cidadão e entregando o cargo após a análise",
  },
];

/** Sorteia a ordem das cenas; nunca repete a que acabou de passar. */
function shuffledQueue(current: number): number[] {
  const q = VARIANTS.map((_, i) => i);
  for (let i = q.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [q[i], q[j]] = [q[j], q[i]];
  }
  if (q[0] === current) [q[0], q[q.length - 1]] = [q[q.length - 1], q[0]];
  return q;
}

function Cursor() {
  return (
    <svg className="dm-cursor" viewBox="0 0 24 24" fill="#fff" stroke="#000" strokeWidth="1.2" aria-hidden="true">
      <path d="M4 2l15 9-6.5 1.5L9 19z" />
    </svg>
  );
}

function BotAuthor({ time }: { time: string }) {
  return (
    <div className="dm-author">
      <span className="dm-name dm-name--bot">VØID Bot</span>
      <span className="dm-tag">Bot</span>
      <span className="dm-time">{time}</span>
    </div>
  );
}

function Member({ name, color, tone, bot }: { name: string; color?: string; tone: string; bot?: boolean }) {
  return (
    <div className="dm-member">
      <span className="dm-mav" style={{ background: tone }}>
        {name[0]}
        <i className="dm-status" />
      </span>
      <span className="dm-mname" style={color ? { color } : undefined}>
        {name}
      </span>
      {bot && <span className="dm-tag dm-tag--sm">Bot</span>}
    </div>
  );
}

function MockBtn({ button }: { button: MockButton }) {
  const Icon = button.icon;
  return (
    <span className={`dm-btn${button.tone ? ` dm-btn--${button.tone}` : ""}`}>
      {Icon && <Icon />} {button.label}
    </span>
  );
}

export function DiscordMockup() {
  // a primeira cena é sempre a de tickets (igual no servidor e no cliente); as seguintes saem sorteadas
  const [index, setIndex] = useState(0);
  const queue = useRef<number[]>([]);

  // o próprio ciclo de animação (dm-life) é o relógio: ao terminar, entra a próxima cena.
  // Com movimento reduzido não há animação, então fica parado na primeira.
  function nextScene(e: React.AnimationEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || e.animationName !== "dm-life") return;
    if (queue.current.length === 0) queue.current = shuffledQueue(index);
    setIndex(queue.current.shift()!);
  }

  const v = VARIANTS[index];
  const PanelChIcon = v.panelChannel.icon;
  const ResultChIcon = v.resultChannel.icon;
  const PanelIcon = v.panel.icon;
  const userInitial = v.user.name[0];

  return (
    <div className="dm-wrap" role="img" aria-label={`Demonstração de ${v.alt}`}>
      <div className="dm-glow" />
      <div className="dm-window" aria-hidden="true">
        <div className="dm-titlebar">
          <span>Discord</span>
          <span className="dm-wc">
            <i />
            <i />
            <i />
          </span>
        </div>

        {/* key: reinicia a animação CSS do começo a cada troca de cena */}
        <div className="dm-body dm-body--in" key={v.id} onAnimationEnd={nextScene}>
          <div className="dm-rail">
            <div className="dm-server dm-server--active">V</div>
            <div className="dm-sep" />
            <div className="dm-server">G</div>
            <div className="dm-server">R</div>
            <div className="dm-server">+</div>
          </div>

          <div className="dm-side">
            <div className="dm-side-title">{v.server}</div>
            <div className="dm-channels">
              <div className="dm-cat">Informações</div>
              <div className="dm-ch">
                <Hash /> regras
              </div>
              <div className="dm-ch">
                <Hash /> avisos
              </div>
              <div className="dm-cat">{v.category}</div>
              <div className="dm-ch dm-ch--painel">
                <PanelChIcon /> {v.panelChannel.name}
              </div>
              <div className="dm-ch dm-ch--ticket">
                <ResultChIcon /> {v.resultChannel.name}
              </div>
              <div className="dm-cat">Voz</div>
              <div className="dm-ch">
                <Volume2 /> Geral
              </div>
            </div>
            <div className="dm-user">
              <span className="dm-mav dm-mav--user">
                {userInitial}
                <i className="dm-status" />
              </span>
              <span className="dm-user-text">
                <b>{v.user.name}</b>
                <small>Online</small>
              </span>
              <span className="dm-user-icons">
                <Mic />
                <Headphones />
                <Settings />
              </span>
            </div>
          </div>

          <div className="dm-main">
            <div className="dm-head">
              <span className="dm-head-a">
                <PanelChIcon /> {v.panelChannel.name}
              </span>
              <span className="dm-head-b">
                <ResultChIcon /> {v.resultChannel.name}
              </span>
              <span className="dm-head-icons">
                <Bell />
                <Pin />
                <Users />
                <Search />
              </span>
            </div>

            <div className="dm-area">
              <div className="dm-feed">
                {/* Cena A: painel com o botão que o membro clica */}
                <div className="dm-screen dm-screen-a">
                  <div className="dm-msg">
                    <div className="dm-avatar dm-avatar--bot">V</div>
                    <div className="dm-content">
                      <BotAuthor time="Hoje às 14:30" />
                      <div className="dm-embed">
                        <div className="dm-embed-row">
                          <div>
                            <div className="dm-embed-title">{v.panel.title}</div>
                            <div className="dm-embed-desc">{v.panel.desc}</div>
                          </div>
                          <span className="dm-thumb">
                            <PanelIcon />
                          </span>
                        </div>
                        <div className="dm-embed-foot">{v.panel.foot}</div>
                      </div>
                      <div className="dm-btnwrap">
                        <span className="dm-btn dm-btn--blurple">
                          <v.panel.button.icon /> {v.panel.button.label}
                        </span>
                        <Cursor />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cena B: resultado (canal do ticket, pedido, boas-vindas...) */}
                <div className="dm-screen dm-screen-b">
                  <div className="dm-msg">
                    <div className="dm-avatar dm-avatar--user">{userInitial}</div>
                    <div className="dm-content">
                      <div className="dm-author">
                        <span className="dm-name dm-user-name">{v.user.name}</span>
                        <span className="dm-role-pill">{v.roleLabel}</span>
                        <span className="dm-time">Hoje às 14:32</span>
                      </div>
                      <div>{v.userMessage}</div>
                    </div>
                  </div>

                  <div className="dm-msg dm-bot-reply">
                    <div className="dm-avatar dm-avatar--bot">V</div>
                    <div className="dm-content">
                      <BotAuthor time="Hoje às 14:32" />
                      <div className="dm-embed">
                        <div className="dm-embed-title">{v.reply.title}</div>
                        <div className="dm-embed-desc">{v.reply.desc}</div>
                        <div className="dm-fields">
                          {v.reply.fields.map(([name, value]) => (
                            <div key={name}>
                              <div className="dm-field-name">{name}</div>
                              <div className="dm-field-value">{value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="dm-embed-foot">{v.reply.foot}</div>
                      </div>
                      <div className="dm-buttons">
                        {v.reply.buttons.map((b) => (
                          <MockBtn key={b.label} button={b} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="dm-msg dm-role-msg">
                    <div className="dm-avatar dm-avatar--bot">V</div>
                    <div className="dm-content">
                      <BotAuthor time="Hoje às 14:33" />
                      <div className="dm-role-line">
                        {v.user.name} recebeu o cargo <b>{v.roleName}</b>
                      </div>
                    </div>
                  </div>

                  <div className="dm-typing">
                    <span className="dm-dots">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span>
                      <b>VØID Bot</b> está digitando...
                    </span>
                  </div>
                </div>
              </div>

              <div className="dm-input">
                <span className="dm-plus">+</span>
                <span className="dm-input-text">
                  <span className="dm-input-a">Conversar em #{v.panelChannel.name}</span>
                  <span className="dm-input-b">Conversar em #{v.resultChannel.name}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="dm-members">
            <div className="dm-cat">Equipe — 2</div>
            <Member name="Ana" color="#f0b232" tone="#7c3aed" />
            <Member name="VØID Bot" color="#5865f2" tone="#111" bot />
            <div className="dm-cat">Membros — 3</div>
            <div className="dm-member dm-member--lucas">
              <span className="dm-mav" style={{ background: v.user.tone }}>
                {userInitial}
                <i className="dm-status" />
              </span>
              <span className="dm-mname dm-user-name">{v.user.name}</span>
            </div>
            <Member name="Davi" tone="#0ea5e9" />
            <Member name="Marina" tone="#10b981" />
          </div>
        </div>
      </div>
    </div>
  );
}
