// Testes dos textos jurídicos (src/config/legal.ts): estrutura, dados da empresa e frases que não podem voltar.
// Rodar:  npx -y tsx --test scripts/security/legal.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { POLICY, privacidade, reembolso, termos, type LegalDoc } from "../../src/config/legal";

const text = (d: LegalDoc) =>
  d.sections.flatMap((s) => [s.title, ...s.blocks.flatMap((b) => ("p" in b ? [b.p] : b.ul))]).join("\n");
const titles = (d: LegalDoc) => d.sections.map((s) => s.title);
const allDocs = () => [termos(), privacidade(), reembolso()];

describe("nada a preencher nos textos", () => {
  it("nenhum texto tem placeholder, dado vazio ou lixo de template", () => {
    for (const d of allDocs()) {
      const t = text(d);
      assert.doesNotMatch(t, /PREENCHER|undefined|null|\$\{|\[\s*\]/);
      assert.doesNotMatch(t, /CNPJ|Razão Social|@\w+\.\w+/i); // sem dados de empresa nem e-mails
    }
  });

  it("o contato é sempre o ticket no Discord", () => {
    assert.match(text(termos()), /Contato: ticket no nosso Discord\./);
    assert.match(text(termos()), /Dúvidas sobre estes Termos: ticket no nosso Discord\./);
    assert.match(text(reembolso()), /Ticket no Discord\./);
    assert.match(text(privacidade()), /abra um ticket no nosso Discord/);
  });

  it("'Como pedir' tem só o ticket no Discord, sem ponto final", () => {
    const how = reembolso().sections.find((s) => s.title === "Como pedir")!;
    const list = how.blocks.find((b) => "ul" in b) as { ul: string[] };
    assert.deepEqual(list.ul, ["Abra um ticket no nosso Discord e diga que quer desistir"]);
  });

  it("não há seção de encarregado", () => {
    assert.ok(!titles(privacidade()).some((x) => x.includes("Encarregado")));
  });
});

describe("Termos de Uso", () => {
  const t = text(termos());
  it("não tem mais as frases antigas", () => {
    assert.doesNotMatch(t, /99[.,]9/);
    assert.doesNotMatch(t, /Não realizamos reembolsos/i);
    assert.doesNotMatch(t, /sem aviso prévio/i);
  });
  it("tem o que a lei e o pedido exigem", () => {
    assert.match(t, /esforço razoável/i);
    assert.match(t, /antecedência razoável/i);
    assert.match(t, /maiores de 18 anos/i);
    assert.match(t, /não é afiliada ao Discord/i);
    assert.match(t, /foro é o do domicílio do consumidor/i);
    assert.match(t, /Política de Reembolso/);
    assert.match(t, /licença de uso/i);
    assert.match(t, /operadora/i);
    assert.match(t, /Simples, Community, DayZ e Server Games/);
  });
});

describe("Política de Reembolso", () => {
  const t = text(reembolso());
  it("cobre arrependimento, Pix, cancelamento e falha do serviço", () => {
    assert.equal(POLICY.ARREPENDIMENTO_DIAS, 7);
    assert.match(t, /7 dias corridos/);
    assert.match(t, /art\. 49/);
    assert.match(t, /Pix/);
    assert.match(t, /sem multa/i);
    assert.match(t, /fora do ar/i);
    assert.match(t, /ticket no nosso Discord/i);
  });
});

describe("Política de Privacidade (LGPD)", () => {
  const d = privacidade();
  const t = text(d);
  it("tem as seções pedidas", () => {
    const want = ["Quem somos", "Dados que coletamos", "base legal", "Com quem compartilhamos", "Por quanto tempo", "Seus direitos", "Segurança", "Cookies", "Menores", "Dados dos servidores dos nossos clientes", "Alterações"];
    for (const w of want) assert.ok(titles(d).some((x) => x.includes(w)), `falta a seção: ${w}`);
  });
  it("lista os 9 direitos do art. 18", () => {
    const rights = d.sections.find((s) => s.title === "Seus direitos")!.blocks.find((b) => "ul" in b) as { ul: string[] };
    assert.equal(rights.ul.length, 9);
  });
  it("não tem as promessas antigas nem afirmações que o sistema não cumpre", () => {
    assert.doesNotMatch(t, /não (vendemos, alugamos ou )?compartilhamos/i);
    assert.doesNotMatch(t, /em até 30 dias/i);
    assert.doesNotMatch(t, /criptografia/i);
  });
  it("explica operadora x controlador e o prazo de 15 dias", () => {
    assert.match(t, /CONTROLADOR/);
    assert.match(t, /OPERADORA/);
    assert.match(t, new RegExp(`em até ${POLICY.RESPOSTA_TITULAR_DIAS} dias`));
    assert.match(t, /bcrypt/);
    assert.match(t, /art\. 33/);
  });
  it("cita os provedores reais do sistema", () => {
    for (const p of ["Discord", "Vercel", "Supabase", "Resend", "Discloud", "GitHub"]) assert.match(t, new RegExp(p));
  });
});
