import { Reveal } from "@/components/home/Reveal";
import { pageMetadata } from "@/config/seo";
import Link from "next/link";

export const metadata = pageMetadata("sobre");

export default function SobrePage() {
  return (
    <>
      <main className="pt-36 pb-24 wrap min-h-screen">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-20">
        <Reveal className="lg:sticky lg:top-32 self-start">
          <p className="eyebrow-l">Sobre nós</p>
          <h1 className="sec-title mt-3">Quem é a VØID?</h1>
        </Reveal>

        <Reveal>
          <div className="panel p-8 sm:p-12 max-w-4xl">
            <p className="text-xs text-silver mb-6">Atualizado em 01/04/2026</p>
            <div className="space-y-5 text-sm text-silver leading-relaxed">
              <p>A <span className="text-white font-medium">VØID Systems</span> é um estúdio de tecnologia especializado na criação de sistemas digitais personalizados e soluções prontas, com foco em automação, organização e controle de comunidades online.</p>
              <p>Nossa atuação vai além do desenvolvimento de bots ou ferramentas isoladas. Projetamos estruturas completas, pensadas para operar de forma clara, estável e escalável. Cada sistema é desenvolvido com o objetivo de resolver problemas reais, otimizar processos e eliminar a desorganização comum em servidores e plataformas digitais.</p>
              <p>O conceito <span className="text-white font-medium">VØID</span> representa a eliminação do excesso. Trabalhamos com a proposta de remover tudo o que é desnecessário, mantendo apenas o essencial: funcionalidade, eficiência e confiabilidade. Por isso, nossas soluções são diretas, bem estruturadas e fáceis de administrar.</p>
              <p>Desenvolvemos bots e sistemas sob medida para Discord, adaptados às necessidades específicas de cada cliente ou comunidade. Isso inclui sistemas de atendimento, registros, hierarquias, anúncios, automações internas, painéis interativos e muito mais — sempre com configuração prática e controle total por parte da equipe responsável.</p>
              <p>Além disso, atuamos na organização técnica e estrutural de servidores, auxiliando na definição de cargos, permissões, fluxos de atendimento e padrões visuais. Nosso objetivo é garantir que tudo funcione de forma integrada, reduzindo erros, retrabalho e a dependência de soluções improvisadas.</p>
              <p>Cada projeto é tratado como único. Não utilizamos modelos genéricos nem soluções prontas sem adaptação. Analisamos o cenário, entendemos a necessidade e entregamos um sistema que realmente se encaixa no funcionamento do cliente.</p>
              <p>A <span className="text-white font-medium">VØID Systems</span> existe para quem busca controle, clareza e profissionalismo — sem complicações desnecessárias — oferecendo soluções técnicas que acompanham o crescimento da comunidade ao longo do tempo.</p>
            </div>
          </div>
        </Reveal>
        </div>
      </main>
    </>
  );
}
