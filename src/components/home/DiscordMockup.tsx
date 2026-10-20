import { Bell, Hash, Headphones, Lock, Mic, Pin, Search, Settings, Ticket, Users, Volume2 } from "lucide-react";
import "./discord-mockup.css";

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

export function DiscordMockup() {
  return (
    <div
      className="dm-wrap"
      role="img"
      aria-label="Demonstração de um bot de tickets no Discord abrindo um ticket, respondendo ao membro e entregando um cargo"
    >
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

        <div className="dm-body">
          <div className="dm-rail">
            <div className="dm-server dm-server--active">V</div>
            <div className="dm-sep" />
            <div className="dm-server">G</div>
            <div className="dm-server">R</div>
            <div className="dm-server">+</div>
          </div>

          <div className="dm-side">
            <div className="dm-side-title">VØID Community</div>
            <div className="dm-channels">
              <div className="dm-cat">Informações</div>
              <div className="dm-ch">
                <Hash /> regras
              </div>
              <div className="dm-ch">
                <Hash /> avisos
              </div>
              <div className="dm-cat">Atendimento</div>
              <div className="dm-ch dm-ch--painel">
                <Ticket /> painel-tickets
              </div>
              <div className="dm-ch dm-ch--ticket">
                <Lock /> ticket-lucas
              </div>
              <div className="dm-cat">Voz</div>
              <div className="dm-ch">
                <Volume2 /> Geral
              </div>
            </div>
            <div className="dm-user">
              <span className="dm-mav dm-mav--user">
                L<i className="dm-status" />
              </span>
              <span className="dm-user-text">
                <b>Lucas</b>
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
                <Ticket /> painel-tickets
              </span>
              <span className="dm-head-b">
                <Lock /> ticket-lucas
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
                {/* Cena A: painel com o botão "Abrir ticket" */}
                <div className="dm-screen dm-screen-a">
                  <div className="dm-msg">
                    <div className="dm-avatar dm-avatar--bot">V</div>
                    <div className="dm-content">
                      <BotAuthor time="Hoje às 14:30" />
                      <div className="dm-embed">
                        <div className="dm-embed-row">
                          <div>
                            <div className="dm-embed-title">Central de Atendimento</div>
                            <div className="dm-embed-desc">
                              Precisa de ajuda? Clique no botão abaixo para abrir um ticket com a nossa equipe.
                            </div>
                          </div>
                          <span className="dm-thumb">
                            <Ticket />
                          </span>
                        </div>
                        <div className="dm-embed-foot">VØID Systems · Atendimento</div>
                      </div>
                      <div className="dm-btnwrap">
                        <span className="dm-btn dm-btn--blurple">
                          <Ticket /> Abrir ticket
                        </span>
                        <Cursor />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cena B: canal do ticket */}
                <div className="dm-screen dm-screen-b">
                  <div className="dm-msg">
                    <div className="dm-avatar dm-avatar--user">L</div>
                    <div className="dm-content">
                      <div className="dm-author">
                        <span className="dm-name dm-user-name">Lucas</span>
                        <span className="dm-role-pill">Cliente</span>
                        <span className="dm-time">Hoje às 14:32</span>
                      </div>
                      <div>Oi! Preciso de ajuda com o meu pedido.</div>
                    </div>
                  </div>

                  <div className="dm-msg dm-bot-reply">
                    <div className="dm-avatar dm-avatar--bot">V</div>
                    <div className="dm-content">
                      <BotAuthor time="Hoje às 14:32" />
                      <div className="dm-embed">
                        <div className="dm-embed-title">Ticket #0042 aberto</div>
                        <div className="dm-embed-desc">Olá, Lucas! Nossa equipe já foi avisada e responde em instantes.</div>
                        <div className="dm-fields">
                          <div>
                            <div className="dm-field-name">Categoria</div>
                            <div className="dm-field-value">Suporte</div>
                          </div>
                          <div>
                            <div className="dm-field-name">Prioridade</div>
                            <div className="dm-field-value">Normal</div>
                          </div>
                          <div>
                            <div className="dm-field-name">Status</div>
                            <div className="dm-field-value">Aguardando</div>
                          </div>
                        </div>
                        <div className="dm-embed-foot">VØID Systems · Ticket</div>
                      </div>
                      <div className="dm-buttons">
                        <span className="dm-btn dm-btn--danger">
                          <Lock /> Fechar ticket
                        </span>
                        <span className="dm-btn">Assumir</span>
                      </div>
                    </div>
                  </div>

                  <div className="dm-msg dm-role-msg">
                    <div className="dm-avatar dm-avatar--bot">V</div>
                    <div className="dm-content">
                      <BotAuthor time="Hoje às 14:33" />
                      <div className="dm-role-line">
                        Lucas recebeu o cargo <b>@Cliente</b>
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
                  <span className="dm-input-a">Conversar em #painel-tickets</span>
                  <span className="dm-input-b">Conversar em #ticket-lucas</span>
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
              <span className="dm-mav" style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}>
                L<i className="dm-status" />
              </span>
              <span className="dm-mname dm-user-name">Lucas</span>
            </div>
            <Member name="Davi" tone="#0ea5e9" />
            <Member name="Marina" tone="#10b981" />
          </div>
        </div>
      </div>
    </div>
  );
}
