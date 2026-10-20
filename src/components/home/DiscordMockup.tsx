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
      <span className="dm-name">VØID Bot</span>
      <span className="dm-tag">Bot</span>
      <span className="dm-time">{time}</span>
    </div>
  );
}

export function DiscordMockup() {
  return (
    <div className="dm-wrap" role="img" aria-label="Demonstração de um bot de tickets no Discord abrindo um ticket, respondendo ao membro e entregando um cargo">
      <div className="dm-glow" />
      <div className="dm-window" aria-hidden="true">
        <div className="dm-rail">
          <div className="dm-server dm-server--active">V</div>
          <div className="dm-server">G</div>
          <div className="dm-server">+</div>
        </div>

        <div className="dm-side">
          <div className="dm-side-title">Meu Servidor</div>
          <div className="dm-channels">
            <div className="dm-cat">Suporte</div>
            <div className="dm-ch dm-ch--painel">painel-tickets</div>
            <div className="dm-ch dm-ch--ticket">ticket-lucas</div>
            <div className="dm-ch">regras</div>
            <div className="dm-ch">avisos</div>
          </div>
        </div>

        <div className="dm-main">
          <div className="dm-head">
            <span className="dm-head-a">painel-tickets</span>
            <span className="dm-head-b">ticket-lucas</span>
          </div>

          <div className="dm-body">
            {/* Cena A: painel com o botão "Abrir ticket" */}
            <div className="dm-screen dm-screen-a">
              <div className="dm-msg">
                <div className="dm-avatar dm-avatar--bot">V</div>
                <div className="dm-content">
                  <BotAuthor time="Hoje às 14:30" />
                  <div className="dm-embed">
                    <div className="dm-embed-title">Central de Atendimento</div>
                    <div className="dm-embed-desc">Precisa de ajuda? Clique no botão abaixo para abrir um ticket com a nossa equipe.</div>
                  </div>
                  <div className="dm-btnwrap">
                    <span className="dm-btn dm-btn--blurple">Abrir ticket</span>
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
                    </div>
                    <div className="dm-buttons">
                      <span className="dm-btn dm-btn--danger">Fechar ticket</span>
                      <span className="dm-btn">Assumir</span>
                    </div>
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
                <span className="dm-dots"><i /><i /><i /></span>
                <span><b>VØID Bot</b> está digitando...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
