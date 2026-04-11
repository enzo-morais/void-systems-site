import { VoidBackground } from "@/components/landing/void-background";
import { Header } from "@/components/landing/header";

export default function PrivacidadePage() {
  return (
    <>
      <VoidBackground />
      <Header />
      <main className="relative z-10 pt-8 pb-20 px-6 max-w-3xl mx-auto min-h-screen">
        <div className="rounded-2xl p-10 sm:p-14 backdrop-blur-md" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-xs text-silver/30 mb-10">Atualizado em 01/04/2026</p>

        <div className="space-y-6 text-sm text-silver/50 leading-relaxed">
          <section>
            <h2 className="text-white font-semibold mb-2">1. Dados Coletados</h2>
            <p>Ao utilizar nosso site e serviços, podemos coletar: nome de usuário do Discord, ID do Discord, email (quando cadastrado), avatar e informações de navegação. Não coletamos dados sensíveis como senhas do Discord.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">2. Uso dos Dados</h2>
            <p>Os dados coletados são utilizados para: autenticação no site, identificação de clientes, registro de vendas, verificação de cargos no Discord e comunicação sobre serviços contratados.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">3. Armazenamento</h2>
            <p>Os dados são armazenados em servidores seguros com criptografia. Senhas de contas criadas no site são armazenadas com hash bcrypt e nunca em texto puro.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">4. Compartilhamento</h2>
            <p>Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros. Os dados são acessíveis apenas pela equipe autorizada da VØID Systems para fins operacionais.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">5. Cookies</h2>
            <p>Utilizamos cookies essenciais para manter sua sessão de login ativa. Não utilizamos cookies de rastreamento ou publicidade.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">6. Discord OAuth2</h2>
            <p>Ao fazer login com Discord, acessamos apenas as informações autorizadas pelo escopo solicitado: identificação, servidores e cargos. Não temos acesso às suas mensagens, amigos ou qualquer dado privado do Discord.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">7. Seus Direitos</h2>
            <p>Você pode solicitar a exclusão dos seus dados a qualquer momento entrando em contato pelo Discord. Após a solicitação, seus dados serão removidos em até 30 dias.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">8. Alterações</h2>
            <p>Esta política pode ser atualizada periodicamente. Alterações significativas serão comunicadas pelo Discord.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold mb-2">9. Contato</h2>
            <p>Para dúvidas sobre privacidade, entre em contato pelo nosso Discord: <a href="https://discord.gg/voidsystems" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">discord.gg/voidsystems</a></p>
          </section>
        </div>
        </div>
      </main>
    </>
  );
}
