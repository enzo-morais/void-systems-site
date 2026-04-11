import { VoidBackground } from "@/components/landing/void-background";
import { Header } from "@/components/landing/header";

export default function TermosPage() {
  return (
    <>
      <VoidBackground />
      <Header />
      <main className="relative z-10 pt-8 pb-20 px-6 max-w-3xl mx-auto min-h-screen">
        <div className="rounded-2xl p-10 sm:p-14 backdrop-blur-md" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
        <p className="text-xs text-silver/30 mb-10">Atualizado em 01/04/2026</p>

        <div className="space-y-6 text-sm text-silver/50 leading-relaxed">
          <section>
            <h2 className="text-white font-semibold mb-2">1. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar os serviços da VØID Systems, você concorda com estes Termos de Uso. Caso não concorde, não utilize nossos serviços.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">2. Serviços</h2>
            <p>A VØID Systems oferece bots e sistemas personalizados para Discord, incluindo desenvolvimento sob medida, hospedagem e suporte técnico. Os serviços são fornecidos conforme disponibilidade e podem ser alterados sem aviso prévio.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">3. Pagamento</h2>
            <p>Os pagamentos são realizados exclusivamente via Pix. Planos mensais são cobrados a cada 30 dias. O não pagamento pode resultar na suspensão do serviço. Não realizamos reembolsos após a entrega e configuração do produto.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">4. Uso Aceitável</h2>
            <p>Você se compromete a não utilizar nossos bots e sistemas para atividades ilegais, spam, assédio ou qualquer prática que viole os Termos de Serviço do Discord. O uso indevido pode resultar no cancelamento imediato do serviço sem reembolso.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">5. Propriedade Intelectual</h2>
            <p>Todo o código, design e sistemas desenvolvidos pela VØID Systems são de propriedade da empresa. O cliente recebe licença de uso, não de propriedade. É proibida a revenda, redistribuição ou engenharia reversa dos produtos.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">6. Disponibilidade</h2>
            <p>Nos esforçamos para manter 99.9% de uptime, mas não garantimos disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência quando possível.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">7. Cancelamento</h2>
            <p>O cliente pode cancelar o serviço a qualquer momento pelo Discord. Após o cancelamento, o bot será desativado ao final do período pago. Não há multa por cancelamento.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">8. Alterações</h2>
            <p>Reservamo-nos o direito de alterar estes termos a qualquer momento. Alterações significativas serão comunicadas pelo Discord.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">9. Contato</h2>
            <p>Para dúvidas sobre estes termos, entre em contato pelo nosso Discord: <a href="https://discord.gg/voidsystems" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">discord.gg/voidsystems</a></p>
          </section>
        </div>
        </div>
      </main>
    </>
  );
}
