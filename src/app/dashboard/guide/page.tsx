"use client";

import { BookOpen, UserPlus, ShoppingCart, Target, ArrowRight, CheckCircle, Package, DollarSign, FileText } from "lucide-react";

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" };

const steps = [
  {
    icon: UserPlus,
    title: "1. Registrar o cliente",
    where: "Clientes",
    steps: [
      "Vá até a aba \"Clientes\" no menu lateral",
      "Preencha o nome do cliente (obrigatório)",
      "Adicione o Discord ID e email se tiver",
      "Clique em \"Adicionar\"",
      "O cliente vai aparecer na lista e no select de vendas",
    ],
  },
  {
    icon: Package,
    title: "2. Cadastrar produtos",
    where: "Produtos",
    steps: [
      "Vá até a aba \"Produtos\" no menu lateral",
      "Preencha nome, preço, categoria e descrição",
      "Selecione o tipo de pagamento (mensal ou único)",
      "Opcionalmente adicione um badge (Popular, Novo, Destaque)",
      "O produto aparece no select de vendas e na página pública de produtos",
    ],
  },
  {
    icon: ShoppingCart,
    title: "3. Registrar uma venda",
    where: "Vendas",
    steps: [
      "Vá até a aba \"Vendas\" no menu lateral",
      "Selecione o vendedor (quem fez a venda)",
      "Selecione o cliente que você cadastrou",
      "Escolha o produto — o preço é preenchido automaticamente",
      "Se for algo fora do catálogo, selecione \"Outros\" e digite o valor",
      "Anexe o comprovante de pagamento (Pix)",
      "Clique em \"Registrar\" — a venda é notificada no Discord",
    ],
  },
  {
    icon: Target,
    title: "4. Acompanhar a meta",
    where: "Dashboard / Equipe",
    steps: [
      "Cada membro da equipe tem uma meta de 5 vendas por mês",
      "No Dashboard, veja sua meta pessoal e o ranking da equipe",
      "Na aba \"Equipe\", veja o progresso de todos os membros",
      "Clique em um membro para ver vendas e faturas mensais",
      "A meta reseta automaticamente todo mês",
    ],
  },
  {
    icon: DollarSign,
    title: "5. Comissões",
    where: "Comissões",
    steps: [
      "Antes de bater a meta: 10% do valor de cada venda vai pro vendedor",
      "Após bater a meta (5 vendas): 100% do valor vai pro vendedor",
      "Na aba \"Comissões\", veja o total a pagar pra cada membro",
      "Clique em um membro para ver o breakdown venda por venda",
      "As comissões resetam automaticamente todo mês",
    ],
  },
  {
    icon: FileText,
    title: "6. Formulários de candidatura",
    where: "Formulários",
    steps: [
      "Candidatos se inscrevem pelo site na página \"Fazer parte\"",
      "Os formulários chegam na aba \"Formulários\" e no Discord via webhook",
      "Clique em um formulário para ver as respostas completas",
      "Aprove ou reprove — a ação fica registrada nos logs",
      "Use os filtros (Pendentes, Aprovados, Reprovados) para organizar",
    ],
  },
];

const tips = [
  "Sempre anexe o comprovante de pagamento na venda",
  "Cadastre o cliente antes de registrar a venda",
  "Cadastre os produtos no catálogo para ter preço fixo automático",
  "Use a busca na tabela de vendas para encontrar registros rápido",
  "Exporte as vendas em CSV para controle externo",
  "Acompanhe suas comissões na aba dedicada",
  "Verifique os formulários pendentes regularmente",
];

export default function GuidePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6" /> Guia de Uso</h1>
        <p className="text-xs text-silver/40 mt-1">Passo a passo de como usar o painel</p>
      </div>

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.title} className="rounded-lg p-6" style={cardStyle}>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl backdrop-blur-sm" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <step.icon className="w-5 h-5 text-white/70" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{step.title}</h2>
                <p className="text-[10px] text-silver/30 uppercase tracking-wider">Aba: {step.where}</p>
              </div>
            </div>
            <div className="space-y-3 ml-1">
              {step.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                    {i + 1}
                  </div>
                  <p className="text-sm text-silver/60 leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg p-6" style={cardStyle}>
        <h2 className="text-sm font-semibold text-silver/60 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ArrowRight className="w-4 h-4" /> Dicas
        </h2>
        <div className="space-y-2.5">
          {tips.map((tip) => (
            <div key={tip} className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-green-400/50 shrink-0" />
              <p className="text-sm text-silver/50">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
