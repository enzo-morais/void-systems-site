// TEXTOS JURÍDICOS E DADOS DA EMPRESA: o único arquivo para editar.
//
// ATENÇÃO: os textos abaixo são um MODELO e precisam de revisão de advogado antes de serem publicados.
// Nada aqui inventa dados da empresa: o que estiver VAZIO em LEGAL é simplesmente omitido das páginas.
// Quando você preencher um campo, ele passa a aparecer sozinho nos Termos, na Privacidade, no Reembolso,
// no rodapé e na tela de contratar.
//
// Como preencher: escreva os dados entre aspas em LEGAL (ex.: CNPJ: "00.000.000/0001-00").
// Prazos e números dos textos (7 dias, 5 dias úteis...) ficam em POLICY, logo abaixo.

/** Dados da empresa. NUNCA preencher com dados que você não confirmou. */
export const LEGAL = {
  RAZAO_SOCIAL: "",
  CNPJ: "",
  ENDERECO: "",
  EMAIL_CONTATO: "",
  EMAIL_PRIVACIDADE: "",
  NOME_ENCARREGADO: "",
};

export type LegalKey = keyof typeof LEGAL;

/** Prazos e números usados nos textos (edite aqui, as páginas acompanham). */
export const POLICY = {
  /** Direito de arrependimento (CDC, art. 49). A lei fixa 7 dias corridos para compras fora do estabelecimento. */
  ARREPENDIMENTO_DIAS: 7,
  /** Prazo para devolver o valor pelo Pix depois do pedido. MODELO: confirme se a operação consegue cumprir. */
  DEVOLUCAO_DIAS_UTEIS: 5,
  /** "Tempo relevante" fora do ar, por culpa da VØID, a partir do qual há proporcional ou crédito. MODELO. */
  FALHA_RELEVANTE_HORAS: 24,
  /** Prazo dado no aviso antes de suspender por falta de pagamento. MODELO. */
  AVISO_SUSPENSAO_DIAS: 3,
  /** Prazo para responder pedidos de titulares (LGPD). */
  RESPOSTA_TITULAR_DIAS: 15,
  /** Guarda de dados de pedidos e comprovantes (prazo fiscal). MODELO: confirme com o contador. */
  GUARDA_FISCAL_ANOS: 5,
};

export const LEGAL_VERSION = "1.0";
export const LEGAL_UPDATED = "22/10/2026";

/** Campos de LEGAL que ainda estão vazios (para conferência). */
export function missingLegalFields(): LegalKey[] {
  return (Object.keys(LEGAL) as LegalKey[]).filter((k) => !LEGAL[k].trim());
}

/** Dado preenchido (sem espaços nas pontas), ou "" se estiver vazio. */
export const filled = (key: LegalKey): string => LEGAL[key].trim();

// ---------------------------------------------------------------- estrutura dos documentos

export type LegalBlock = { p: string } | { ul: string[] };
export interface LegalSection {
  title: string;
  blocks: LegalBlock[];
}
export interface LegalDoc {
  slug: string;
  title: string;
  /** Descrição para o Google e para o cartão de compartilhamento. */
  description: string;
  sections: LegalSection[];
}

const P = (p: string): LegalBlock => ({ p });
const UL = (ul: string[]): LegalBlock => ({ ul });

/** " (Razão Social, CNPJ ..., endereço)" só com o que estiver preenchido; vazio se não houver nada. */
const dadosEmpresa = () => {
  const partes = [filled("RAZAO_SOCIAL"), filled("CNPJ") && `CNPJ ${filled("CNPJ")}`, filled("ENDERECO")].filter(Boolean);
  return partes.length ? ` (${partes.join(", ")})` : "";
};

/** Canal de contato: e-mail (se houver) e sempre o ticket no Discord. */
const contato = (key: "EMAIL_CONTATO" | "EMAIL_PRIVACIDADE" = "EMAIL_CONTATO") =>
  filled(key) ? `${filled(key)} ou ticket no nosso Discord` : "ticket no nosso Discord";

// ---------------------------------------------------------------- TERMOS DE USO

export const termos = (): LegalDoc => ({
  slug: "termos",
  title: "Termos de Uso",
  description: "Termos de uso dos serviços da VØID Systems: combos e bots para Discord, pagamento, cancelamento e responsabilidades.",
  sections: [
    {
      title: "Identificação, aceitação e idade",
      blocks: [
        P(`Estes Termos valem para o uso deste site e dos serviços da VØID Systems${dadosEmpresa()}. Contato: ${contato()}.`),
        P("A VØID Systems não é afiliada ao Discord Inc. \"Discord\" é marca dos seus titulares."),
        P("Ao contratar ou usar os serviços, você aceita estes Termos, a Política de Privacidade e a Política de Reembolso."),
        P("O serviço é para maiores de 18 anos. Menores de idade só podem contratar com autorização e acompanhamento do responsável legal, que responde pela contratação."),
      ],
    },
    {
      title: "Serviços",
      blocks: [
        P("Oferecemos bots e sistemas para Discord em dois formatos: combos (Simples, Community, DayZ e Server Games) e bots avulsos, conforme descrição no site. Cada contratação inclui a configuração, a hospedagem do bot e o suporte técnico pelo Discord."),
        P("Bots sob medida são orçados à parte, antes de qualquer cobrança."),
        P("Mudanças relevantes no serviço serão avisadas pelo Discord com antecedência razoável."),
      ],
    },
    {
      title: "Preço, pagamento e cobrança",
      blocks: [
        UL([
          "O preço é o que está no site no momento da contratação, em reais.",
          "A cobrança é mensal, a cada 30 dias, por Pix feito pelo nosso Discord, com atendimento direto da equipe.",
          `Se um pagamento não for feito, avisamos pelo Discord. Depois do prazo dado no aviso (modelo: ${POLICY.AVISO_SUSPENSAO_DIAS} dias), podemos suspender o bot até a regularização. Nada é apagado durante a suspensão sem novo aviso.`,
          "Pedidos de devolução seguem a Política de Reembolso.",
        ]),
      ],
    },
    {
      title: "Uso aceitável",
      blocks: [
        P("Você se compromete a não usar nossos bots e sistemas para:"),
        UL([
          "atividades ilegais, fraude, spam, assédio ou qualquer prática que viole os Termos de Serviço e as Diretrizes da Comunidade do Discord;",
          "invadir, sobrecarregar ou tentar burlar a segurança do site e dos bots;",
          "revender, redistribuir ou fazer engenharia reversa dos produtos.",
        ]),
        P("Em caso de violação, podemos suspender ou cancelar o serviço. Sempre que possível, avisamos antes; em violações graves, a suspensão pode ser imediata, sem prejuízo dos seus direitos de consumidor."),
      ],
    },
    {
      title: "Propriedade intelectual e licença de uso",
      blocks: [
        P("O código, o design e os sistemas da VØID Systems continuam sendo nossos. Você recebe uma licença de uso, limitada, não exclusiva e intransferível, enquanto o serviço estiver ativo. Não há transferência de propriedade."),
        P("O conteúdo do seu servidor (mensagens, imagens, nomes, marcas) continua sendo seu."),
      ],
    },
    {
      title: "Disponibilidade e dependência do Discord",
      blocks: [
        P("Fazemos esforço razoável para manter o serviço disponível. Manutenções programadas são avisadas com antecedência quando possível. Não prometemos um percentual fixo de disponibilidade."),
        P("Os bots funcionam dentro do Discord e dependem da plataforma, das regras e das mudanças feitas por ela. Não respondemos por indisponibilidade, bloqueios ou mudanças do Discord ou de outros terceiros fora do nosso controle."),
        P("Se o bot ficar fora do ar por tempo relevante por culpa da VØID Systems, você tem direito ao proporcional ou a crédito, como explica a Política de Reembolso."),
      ],
    },
    {
      title: "Cancelamento e reembolso",
      blocks: [
        P(`Você pode desistir em até ${POLICY.ARREPENDIMENTO_DIAS} dias corridos da contratação, sem justificar, e receber o valor pago de volta. Depois disso, pode cancelar quando quiser: o bot é desativado ao fim do período já pago, sem multa. Todos os detalhes estão na Política de Reembolso.`),
      ],
    },
    {
      title: "Dados do servidor do cliente",
      blocks: [
        P("Quando o bot trata dados de membros do seu servidor (por exemplo tickets, transcripts, sugestões e registros), você é o controlador desses dados e a VØID Systems age como operadora: trata só para prestar o serviço contratado."),
        P("Você é responsável por informar os membros do seu servidor sobre esse tratamento. Quando você pedir, ou ao cancelar, apagamos ou entregamos esses dados. Veja os detalhes na Política de Privacidade."),
      ],
    },
    {
      title: "Responsabilidade",
      blocks: [
        P("Nada nestes Termos exclui ou limita direitos que a lei garante ao consumidor nem responsabilidades que a lei não permite limitar."),
        P("Dentro do que a lei permite, não respondemos por danos causados por uso indevido do bot, por conteúdo publicado no seu servidor, por falhas do Discord ou de outros terceiros, nem por lucros que você deixou de ter por esses motivos."),
      ],
    },
    {
      title: "Alterações destes Termos",
      blocks: [
        P("Podemos atualizar estes Termos. Mudanças relevantes serão avisadas pelo Discord com antecedência razoável. A data e a versão ficam no topo da página. Se você não concordar com uma mudança, pode cancelar, sem multa."),
      ],
    },
    {
      title: "Lei aplicável e foro",
      blocks: [
        P("Estes Termos seguem a lei brasileira. Em caso de conflito, o foro é o do domicílio do consumidor."),
      ],
    },
    {
      title: "Contato",
      blocks: [
        P(`Dúvidas sobre estes Termos: ${contato()}.`),
      ],
    },
  ],
});

// ---------------------------------------------------------------- POLÍTICA DE REEMBOLSO

export const reembolso = (): LegalDoc => ({
  slug: "reembolso",
  title: "Política de Reembolso",
  description: `Direito de arrependimento em até ${POLICY.ARREPENDIMENTO_DIAS} dias, cancelamento sem multa e o que acontece se o serviço falhar.`,
  sections: [
    {
      title: `Você pode desistir em até ${POLICY.ARREPENDIMENTO_DIAS} dias`,
      blocks: [
        P(`Você pode desistir da contratação em até ${POLICY.ARREPENDIMENTO_DIAS} dias corridos, contados da data da contratação, sem precisar dar motivo, e receber de volta todo o valor pago (Código de Defesa do Consumidor, art. 49).`),
      ],
    },
    {
      title: "Como pedir",
      blocks: [
        UL([
          "Abra um ticket no nosso Discord e diga que quer desistir",
          ...(filled("EMAIL_CONTATO") ? [`Ou mande um e-mail para ${filled("EMAIL_CONTATO")} com o seu nome, o seu usuário do Discord e o combo ou bot contratado.`] : []),
        ]),
        P("Confirmamos o pedido na mesma conversa."),
      ],
    },
    {
      title: "Como devolvemos o valor",
      blocks: [
        P(`A devolução é feita pelo mesmo meio de pagamento (Pix), em até ${POLICY.DEVOLUCAO_DIAS_UTEIS} dias úteis depois do seu pedido. O valor devolvido é o valor total que você pagou.`),
      ],
    },
    {
      title: `Cancelamento depois dos ${POLICY.ARREPENDIMENTO_DIAS} dias`,
      blocks: [
        P("Você pode cancelar a qualquer momento, sem multa. O bot continua funcionando até o fim do período que você já pagou e é desativado depois disso. Não cobramos nada a mais."),
      ],
    },
    {
      title: "Se o serviço falhar",
      blocks: [
        P(`Se o seu bot ficar fora do ar por mais de ${POLICY.FALHA_RELEVANTE_HORAS} horas seguidas por culpa da VØID Systems, você tem direito ao valor proporcional ao tempo parado ou a crédito para o próximo mês, como preferir. Falhas do Discord ou de outros terceiros, que não dependem de nós, não entram nessa regra.`),
      ],
    },
    {
      title: "Fale com a gente",
      blocks: [
        P(`Ticket no Discord${filled("EMAIL_CONTATO") ? ` ou ${filled("EMAIL_CONTATO")}` : ""}.`),
      ],
    },
  ],
});

// ---------------------------------------------------------------- POLÍTICA DE PRIVACIDADE (LGPD)

export const privacidade = (): LegalDoc => ({
  slug: "privacidade",
  title: "Política de Privacidade",
  description: "Como a VØID Systems trata dados pessoais, para quê, por quanto tempo e como você exerce os seus direitos (LGPD).",
  sections: [
    {
      title: "Quem somos",
      blocks: [
        P(`A controladora dos dados tratados neste site é a VØID Systems${dadosEmpresa()}. Contato: ${contato()}.${filled("EMAIL_PRIVACIDADE") ? ` Para assuntos de privacidade: ${filled("EMAIL_PRIVACIDADE")}.` : ""}`),
        P("A VØID Systems não é afiliada ao Discord Inc."),
      ],
    },
    // só aparece quando o encarregado (nome ou canal) estiver preenchido em LEGAL
    ...(filled("NOME_ENCARREGADO") || filled("EMAIL_PRIVACIDADE")
      ? [
          {
            title: "Encarregado de dados (DPO)",
            blocks: [
              P(
                `${filled("NOME_ENCARREGADO") ? `Encarregado: ${filled("NOME_ENCARREGADO")}. ` : ""}${
                  filled("EMAIL_PRIVACIDADE") ? `Canal: ${filled("EMAIL_PRIVACIDADE")}.` : "Canal: ticket no nosso Discord."
                }`,
              ),
            ],
          },
        ]
      : []),
    {
      title: "Dados que coletamos e como",
      blocks: [
        UL([
          "Conta no site: nome, e-mail e senha. A senha é guardada só como hash (bcrypt), nunca em texto puro. O código de verificação por e-mail também é guardado só como hash e vale 15 minutos.",
          "Login com Discord: ID, nome de usuário, avatar e os cargos que você tem no nosso servidor do Discord (usados para liberar o acesso certo). O Discord também nos disponibiliza a sua lista de servidores, mas só consultamos o nosso. Quando alguém entra, um aviso de login (nome e ID do Discord ou e-mail) é enviado a um canal interno da nossa equipe no Discord.",
          "Pedidos: nome do cliente, produto, valor, observações, vendedor e o comprovante do Pix (imagem ou PDF), guardado em armazenamento privado.",
          "Cadastro de clientes: nome, ID do Discord, e-mail e observações da equipe.",
          "Bots hospedados: o vínculo entre o dono (ID do Discord ou da conta), o bot e o seu estado.",
          "Candidaturas à equipe: nome, idade, Discord e as respostas do formulário.",
          "Navegação e segurança: endereço IP e e-mail usados para limitar tentativas de login e cadastro (guardados só por alguns minutos) e registros técnicos do provedor de hospedagem.",
          "Registros de ações da equipe no painel (quem fez o quê e quando).",
          "Dentro do bot, nos servidores dos nossos clientes: veja a seção 11.",
        ]),
        P("Coletamos esses dados diretamente de você, do Discord (quando você entra com Discord) e da nossa equipe (pedidos e cadastros)."),
      ],
    },
    {
      title: "Para que usamos e qual a base legal",
      blocks: [
        UL([
          "Criar e manter a sua conta, fazer o login e verificar o seu e-mail: execução de contrato (LGPD, art. 7º, V).",
          "Prestar o serviço contratado, hospedar o bot e dar suporte: execução de contrato (art. 7º, V).",
          "Cobrança, comprovantes, controle de pedidos e obrigações fiscais e contábeis: execução de contrato e cumprimento de obrigação legal (art. 7º, V e II).",
          "Segurança do site, prevenção a fraude e abuso e limite de tentativas: legítimo interesse (art. 7º, IX).",
          "Avisos essenciais sobre o serviço (código de verificação, cobrança, manutenção): execução de contrato (art. 7º, V).",
          "Análise de candidaturas à equipe: procedimentos preliminares ligados a contrato (art. 7º, V).",
          "Defesa em processos e exercício regular de direitos: art. 7º, VI.",
          "Qualquer outro uso só acontece com o seu consentimento (art. 7º, I), que você pode retirar quando quiser.",
        ]),
      ],
    },
    {
      title: "Com quem compartilhamos",
      blocks: [
        P("Compartilhamos dados só com quem precisa deles para o serviço funcionar:"),
        UL([
          "Discord: login, comunicação e funcionamento dos bots.",
          "Vercel: hospedagem do site.",
          "Supabase: banco de dados e armazenamento dos comprovantes.",
          "Resend: envio dos e-mails (códigos e avisos).",
          "Discloud: hospedagem dos bots.",
          "GitHub: armazenamento privado dos transcripts de tickets, quando o seu bot usa a página web de transcripts.",
          "Instituições de pagamento envolvidas no Pix e serviços contábeis ou fiscais, quando necessário para cumprir obrigações legais.",
          "Autoridades públicas, quando a lei exigir.",
        ]),
        P("Não vendemos seus dados. Alguns desses provedores podem tratar dados fora do Brasil (por exemplo nos Estados Unidos). Quando isso acontece, a transferência segue o art. 33 da LGPD, com as garantias oferecidas pelos próprios provedores."),
      ],
    },
    {
      title: "Por quanto tempo guardamos",
      blocks: [
        UL([
          "Conta no site (nome, e-mail, hash da senha): enquanto a conta existir. Depois de um pedido de exclusão, apagamos ou anonimizamos, exceto o que a lei exigir guardar.",
          "Código de verificação: 15 minutos. Sessão de login: 24 horas.",
          "Contadores de limite de tentativas (IP e e-mail): poucos minutos, apagados automaticamente.",
          `Pedidos, comprovantes e dados fiscais: ${POLICY.GUARDA_FISCAL_ANOS} anos, pelo prazo fiscal.`,
          "Candidaturas: pelo tempo do processo seletivo.",
          "Registros de ações da equipe: pelo tempo necessário para segurança e auditoria.",
          "Transcripts e dados dos bots nos servidores dos clientes: conforme o cliente configurar, durante o contrato. No cancelamento ou a pedido, apagamos ou entregamos ao cliente.",
        ]),
        P("Terminado o prazo, apagamos ou anonimizamos os dados, salvo se a lei exigir guardar por mais tempo."),
      ],
    },
    {
      title: "Seus direitos",
      blocks: [
        P("Pela LGPD (art. 18) você pode pedir, a qualquer momento:"),
        UL([
          "confirmação de que tratamos seus dados;",
          "acesso aos dados;",
          "correção de dados incompletos, inexatos ou desatualizados;",
          "anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados fora da lei;",
          "portabilidade dos dados;",
          "eliminação dos dados tratados com o seu consentimento;",
          "informação sobre com quem compartilhamos os dados;",
          "informação sobre a possibilidade de não dar consentimento e as consequências;",
          "revogação do consentimento.",
        ]),
        P(`Para exercer qualquer direito, ${filled("EMAIL_PRIVACIDADE") ? `escreva para ${filled("EMAIL_PRIVACIDADE")} ou ` : ""}abra um ticket no Discord. É gratuito e respondemos em até ${POLICY.RESPOSTA_TITULAR_DIAS} dias. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).`),
      ],
    },
    {
      title: "Segurança",
      blocks: [
        P("Medidas que usamos hoje:"),
        UL([
          "conexão protegida por HTTPS;",
          "senhas e códigos de verificação guardados só como hash;",
          "limite de tentativas de login, cadastro e recuperação de senha;",
          "sessões de 24 horas e conferência periódica dos cargos de quem acessa o painel;",
          "comprovantes em armazenamento privado, abertos só pela equipe autorizada, por links temporários;",
          "painel restrito à equipe e cabeçalhos de segurança no site.",
        ]),
        P("Nenhum sistema é totalmente imune a falhas. Se houver um incidente que possa causar risco ou dano relevante, avisamos os titulares afetados e a ANPD, em prazo razoável e conforme a regulamentação."),
      ],
    },
    {
      title: "Cookies",
      blocks: [
        P("Usamos apenas cookies essenciais: os de login e segurança (sessão, proteção contra CSRF e endereço de retorno). Sem eles o login não funciona. Não usamos cookies de análise, publicidade ou rastreamento, e por isso não mostramos banner de cookies."),
        P("Se um dia usarmos cookies não essenciais, vamos pedir o seu consentimento antes, com opção de aceitar, recusar e gerenciar. Algumas imagens do site, como avatares, vêm do Discord e podem expor o seu IP a eles."),
      ],
    },
    {
      title: "Menores de idade",
      blocks: [
        P("O serviço é para maiores de 18 anos. Adolescentes só podem usar com autorização e acompanhamento do responsável legal, e não direcionamos o serviço a crianças. Se soubermos que tratamos dados de uma criança sem o consentimento de um responsável, vamos apagá-los."),
      ],
    },
    {
      title: "Dados dos servidores dos nossos clientes",
      blocks: [
        P("Quando o bot trata dados de membros de um servidor (por exemplo tickets, transcripts, sugestões, registros e níveis), o dono do servidor é o CONTROLADOR desses dados e a VØID Systems é a OPERADORA."),
        UL([
          "O cliente decide quais dados o bot guarda e é responsável por avisar os membros do seu servidor sobre isso.",
          "A VØID Systems trata esses dados só para prestar o serviço contratado e seguindo as instruções do cliente.",
          "Quando o cliente pedir, ou ao cancelar o serviço, apagamos esses dados ou os entregamos ao cliente.",
          "Se um membro do servidor quiser exercer direitos sobre esses dados, deve falar primeiro com o dono do servidor; nós ajudamos o cliente a atender o pedido.",
        ]),
      ],
    },
    {
      title: "Alterações e versão",
      blocks: [
        P("Podemos atualizar esta Política. Mudanças relevantes serão avisadas pelo Discord com antecedência razoável. A versão e a data ficam no topo da página."),
      ],
    },
  ],
});
