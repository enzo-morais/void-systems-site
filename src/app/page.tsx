import { ArrowRight, Bot, Zap, Shield, Clock, Users, Server, MessageSquare } from "lucide-react";
import { VoidBackground } from "@/components/landing/void-background";
import { Header } from "@/components/landing/header";
import { FadeIn } from "@/components/landing/fade-in";
import { VoidButton } from "@/components/landing/void-button";
import { VoidCard } from "@/components/landing/void-card";
import { TicketFeatures } from "@/components/landing/ticket-features";
import { FAQ } from "@/components/landing/faq";
import { AnimatedCounter } from "@/components/landing/animated-counter";
import { ScrollToTop } from "@/components/landing/scroll-to-top";

const DISCORD_LINK = "https://discord.gg/voidsystems";

const stats = [
  { value: "50+", label: "Servidores atendidos" },
  { value: "99.9%", label: "Uptime garantido" },
  { value: "24/7", label: "Suporte ativo" },
];

const features = [
  {
    icon: Zap,
    title: "Automação total",
    desc: "Tickets, anúncios, verificação, sorteios e muito mais. Tudo rodando sozinho no seu servidor.",
  },
  {
    icon: Shield,
    title: "Segurança avançada",
    desc: "Anti-raid, verificação de membros e logs completos. Seu servidor protegido 24 horas.",
  },
  {
    icon: Clock,
    title: "Setup em minutos",
    desc: "Configuração rápida e personalizada. Seu bot funcionando no mesmo dia da compra.",
  },
];

const steps = [
  { num: "01", title: "Entre no Discord", desc: "Acesse nosso servidor e abra um ticket." },
  { num: "02", title: "Escolha seu bot", desc: "Veja nossos produtos e escolha o ideal." },
  { num: "03", title: "Receba e use", desc: "Bot configurado e rodando no seu servidor." },
];

export default function Home() {
  return (
    <>
      <VoidBackground />
      <Header />

      <main className="relative z-10">
        {/* Hero */}
        <section className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-4xl mx-auto" style={{ animation: "fadeIn 0.8s ease-out" }}>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-silver/70 mb-10 backdrop-blur-md"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Bot className="w-4 h-4" />
              Automação para Discord
            </div>

            <h1
              className="text-7xl sm:text-8xl md:text-[10rem] font-bold tracking-tighter leading-none mb-6"
              style={{
                background: "linear-gradient(to right, #ffffff, #c0c0c0, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "float 6s ease-in-out infinite",
              }}
            >
              VØID
            </h1>

            <p className="text-2xl sm:text-3xl text-silver font-light tracking-wide mb-4">Systems</p>

            <p className="text-silver/60 text-lg max-w-xl mx-auto mb-12">
              Bots para Discord que transformam seu servidor em uma máquina de organização e automação.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <VoidButton href={DISCORD_LINK}>
                Falar no Discord <ArrowRight className="w-5 h-5" />
              </VoidButton>
              <VoidButton href="/produtos" variant="secondary">
                Ver produtos
              </VoidButton>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {stats.map((s, i) => (
                <FadeIn key={s.label} delay={i * 100}>
                  <AnimatedCounter value={s.value} label={s.label} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-xs mx-auto h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />

        {/* VØID Ticket - Free Bot Showcase */}
        <section className="px-6 py-32">
          <FadeIn>
            <div
              className="max-w-5xl mx-auto rounded-2xl overflow-hidden backdrop-blur-md relative"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)" }} />

              <div className="relative p-10 sm:p-16">
                <div className="text-center mb-12">
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-green-400 mb-6"
                    style={{ backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.15)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Gratuito e vitalício
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                    VØID <span className="text-silver/60">Ticket</span>
                  </h2>

                  <p className="text-silver/50 max-w-lg mx-auto leading-relaxed">
                    Bot de ticket gratuito e vitalício para seu servidor Discord. Já hospedado, sem complicação. Adicione e use — pra sempre.
                  </p>
                </div>

                {/* Feature cards */}
                <div className="mb-10">
                  <TicketFeatures />
                </div>

                <div className="text-center">
                  <a
                    href="https://voidticket.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-black font-medium px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] text-sm"
                  >
                    <Bot className="w-4 h-4" />
                    Saiba mais sobre o VØID Ticket
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Features */}
        <section className="px-6 py-32 max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-sm text-silver/50 uppercase tracking-widest mb-3">Por que nos escolher</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Feito pra quem leva<br />servidor a sério
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 120}>
                <VoidCard className="h-full">
                  <div
                    className="p-3 rounded-xl mb-5 inline-flex backdrop-blur-sm"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <f.icon className="w-6 h-6 text-white/80" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-silver/50 leading-relaxed">{f.desc}</p>
                </VoidCard>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-32">
          <div className="max-w-4xl mx-auto">
            <FadeIn className="text-center mb-16">
              <p className="text-sm text-silver/50 uppercase tracking-widest mb-3">Como funciona</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                3 passos simples
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <FadeIn key={step.num} delay={i * 150}>
                  <div className="text-center sm:text-left">
                    <p className="text-5xl font-bold text-white/[0.06] mb-4">{step.num}</p>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-silver/50">{step.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-xs mx-auto h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />

        {/* FAQ */}
        <FAQ />

        {/* Final CTA */}
        <section className="px-6 py-32">
          <FadeIn>
            <div
              className="max-w-3xl mx-auto text-center rounded-2xl py-16 px-8 backdrop-blur-md"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <MessageSquare className="w-10 h-10 mx-auto mb-6 text-white/30" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Pronto pra automatizar?
              </h2>
              <p className="text-silver/50 max-w-md mx-auto mb-10">
                Entre no nosso Discord, abra um ticket e tenha seu bot rodando hoje mesmo. Planos a partir de R$10/mês.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <VoidButton href={DISCORD_LINK}>
                  Entrar no Discord <ArrowRight className="w-5 h-5" />
                </VoidButton>
                <VoidButton href="/produtos" variant="secondary">
                  Ver produtos
                </VoidButton>
              </div>
            </div>
          </FadeIn>
        </section>

        <ScrollToTop />

        {/* Footer */}
        <footer className="px-6 py-10 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-silver/30">&copy; 2026 VØID Systems</p>
            <div className="flex items-center gap-6">
              <a href="/produtos" className="text-xs text-silver/30 hover:text-white transition-colors">Produtos</a>
              <a href="/termos" className="text-xs text-silver/30 hover:text-white transition-colors">Termos de Uso</a>
              <a href="/privacidade" className="text-xs text-silver/30 hover:text-white transition-colors">Privacidade</a>
              <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer" className="text-xs text-silver/30 hover:text-white transition-colors">Discord</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
