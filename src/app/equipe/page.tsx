"use client";

import { useState } from "react";
import { VoidBackground } from "@/components/landing/void-background";
import { Header } from "@/components/landing/header";
import { FadeIn } from "@/components/landing/fade-in";
import { VoidCard } from "@/components/landing/void-card";
import { Users2, CheckCircle, ArrowRight, Loader2, Clock, Shield, Zap, Send } from "lucide-react";

const inputClass = "w-full bg-black/40 border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-silver/30 backdrop-blur-sm";

const benefits = [
  { icon: Zap, title: "Comissão por venda", desc: "Ganhe uma porcentagem em cada venda realizada." },
  { icon: Shield, title: "Acesso ao painel", desc: "Ferramentas exclusivas para gerenciar vendas e clientes." },
  { icon: Clock, title: "Horário flexível", desc: "Trabalhe no seu tempo, sem horário fixo." },
];

export default function EquipePage() {
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [discord, setDiscord] = useState("");
  const [why, setWhy] = useState("");
  const [experience, setExperience] = useState("");
  const [hours, setHours] = useState("");
  const [extra, setExtra] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");

    const res = await fetch("/api/public/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age, discordId, discord, why, experience, hours, extra }),
    });

    setLoading(false);
    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao enviar formulário");
    }
  }

  return (
    <>
      <VoidBackground />
      <Header />
      <main className="relative z-10 pt-8 pb-20 px-6 max-w-7xl mx-auto min-h-screen">

        {!started && !submitted && (
          <>
            <FadeIn className="text-center mb-14">
              <p className="text-sm text-silver/60 uppercase tracking-widest mb-3">Faça parte</p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Entre para a Equipe</h1>
              <p className="text-silver/50 mt-4 max-w-lg mx-auto">
                Estamos sempre em busca de pessoas comprometidas para fazer parte da VØID Systems. Veja como funciona e candidate-se.
              </p>
            </FadeIn>

            {/* Como funciona */}
            <FadeIn>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                {benefits.map((b) => (
                  <VoidCard key={b.title} className="text-center py-8">
                    <b.icon className="w-7 h-7 text-white/50 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold mb-1">{b.title}</h3>
                    <p className="text-xs text-silver/40">{b.desc}</p>
                  </VoidCard>
                ))}
              </div>
            </FadeIn>

            <FadeIn>
              <VoidCard className="p-8">
                <h2 className="text-lg font-semibold mb-4">Como funciona?</h2>
                <div className="space-y-3 mb-8">
                  {[
                    "Preencha o formulário com suas informações",
                    "Nossa equipe vai analisar sua candidatura",
                    "Os aprovados serão anunciados no canal do Discord",
                    "Após aprovado, você recebe acesso ao painel staff",
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>{i + 1}</div>
                      <p className="text-sm text-silver/60">{step}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStarted(true)}
                  className="bg-white text-black font-medium px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-2 cursor-pointer"
                >
                  Iniciar formulário <ArrowRight className="w-4 h-4" />
                </button>
              </VoidCard>
            </FadeIn>
          </>
        )}

        {started && !submitted && (
          <FadeIn>
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold mb-2 flex items-center gap-2"><Users2 className="w-6 h-6" /> Formulário de Candidatura</h1>
              <p className="text-xs text-silver/40 mb-8">Preencha todos os campos com atenção</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-silver/40 mb-1.5">Seu nome *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nome completo" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
                  </div>
                  <div>
                    <label className="block text-xs text-silver/40 mb-1.5">Idade *</label>
                    <input type="text" value={age} onChange={(e) => setAge(e.target.value)} required placeholder="Ex: 18" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
                  </div>
                  <div>
                    <label className="block text-xs text-silver/40 mb-1.5">Seu Discord (user) *</label>
                    <input type="text" value={discord} onChange={(e) => setDiscord(e.target.value)} required placeholder="Ex: usuario" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
                  </div>
                  <div>
                    <label className="block text-xs text-silver/40 mb-1.5">Seu Discord ID *</label>
                    <input type="text" value={discordId} onChange={(e) => setDiscordId(e.target.value)} required placeholder="Ex: 123456789012345678" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-silver/40 mb-1.5">Por que quer fazer parte da equipe? *</label>
                  <textarea value={why} onChange={(e) => setWhy(e.target.value)} required placeholder="Conte um pouco sobre sua motivação..." rows={3}
                    className={inputClass + " resize-none"} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
                </div>

                <div>
                  <label className="block text-xs text-silver/40 mb-1.5">Tem experiência com vendas ou atendimento? *</label>
                  <textarea value={experience} onChange={(e) => setExperience(e.target.value)} required placeholder="Descreva sua experiência..." rows={3}
                    className={inputClass + " resize-none"} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
                </div>

                <div>
                  <label className="block text-xs text-silver/40 mb-1.5">Quantas horas por dia pode dedicar? *</label>
                  <input type="text" value={hours} onChange={(e) => setHours(e.target.value)} required placeholder="Ex: 2-4 horas" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
                </div>

                <div>
                  <label className="block text-xs text-silver/40 mb-1.5">Algo mais que queira dizer?</label>
                  <textarea value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Opcional" rows={2}
                    className={inputClass + " resize-none"} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={loading}
                    className="bg-white text-black font-medium px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? "Enviando..." : "Enviar candidatura"}
                  </button>
                  <button type="button" onClick={() => setStarted(false)} className="text-xs text-silver/40 hover:text-white transition-colors cursor-pointer">Voltar</button>
                </div>
              </form>
            </div>
          </FadeIn>
        )}

        {submitted && (
          <FadeIn className="text-center py-20 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="inline-flex p-4 rounded-2xl mb-6" style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Candidatura enviada!</h1>
            <p className="text-silver/50 max-w-md mx-auto mb-2">
              Sua candidatura foi recebida e será analisada pela nossa equipe.
            </p>
            <p className="text-silver/40 text-sm max-w-md mx-auto mb-8">
              Fique de olho no canal de anúncios do nosso Discord — os aprovados serão divulgados lá.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://discord.gg/voidsystems"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-black font-medium px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] text-sm"
              >
                Ir para o Discord <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/"
                className="text-xs text-silver/40 hover:text-white transition-colors px-4 py-3"
              >
                Voltar ao início
              </a>
            </div>
          </FadeIn>
        )}

        <footer className="text-center text-xs text-silver/20 mt-16 pt-8 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="mb-2">&copy; 2026 VØID Systems</p>
          <div className="flex items-center justify-center gap-4">
            <a href="/termos" className="text-silver/30 hover:text-white transition-colors">Termos</a>
            <a href="/privacidade" className="text-silver/30 hover:text-white transition-colors">Privacidade</a>
          </div>
        </footer>
      </main>
    </>
  );
}
