import type { Metadata } from "next";
import { DISCORD_STORE_URL } from "@/config/store";

export const metadata: Metadata = {
  title: "Política de Privacidade — VØID Systems",
  description: "Como a VØID Systems trata os seus dados.",
};

export default function PrivacidadePage() {
  return (
    <>
      <main className="pt-36 pb-24 wrap min-h-screen">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-20">
        <header className="lg:sticky lg:top-32 self-start">
          <p className="eyebrow-l">Legal</p>
          <h1 className="sec-title mt-3">Política de Privacidade</h1>
          <p className="mt-3 text-xs text-zinc-500">Atualizado em 01/04/2026</p>
        </header>
        <div className="panel p-8 sm:p-12 max-w-4xl">

        <div className="space-y-6 text-sm text-silver leading-relaxed">
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
            <p>Para dúvidas sobre privacidade, entre em contato pelo nosso Discord: <a href={DISCORD_STORE_URL} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">discord.gg/voidsystems</a></p>
          </section>
        </div>
        </div>
      </div>
      </main>
    </>
  );
}
