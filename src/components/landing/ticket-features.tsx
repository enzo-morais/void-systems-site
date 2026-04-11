"use client";

import { MessageSquare, Server, Clock, Users, Shield, Zap } from "lucide-react";

const features = [
  { icon: MessageSquare, title: "Sistema de Tickets", desc: "Crie tickets personalizados com tipos diferentes e controle total." },
  { icon: Server, title: "Painéis Customizáveis", desc: "Configure painéis com embeds, botões e menus de seleção." },
  { icon: Clock, title: "Transcripts HTML", desc: "Gere transcripts automáticos quando um ticket é fechado." },
  { icon: Users, title: "Gerenciamento de Equipe", desc: "Defina cargos de staff e controle de permissões." },
  { icon: Shield, title: "Logs Detalhados", desc: "Sistema completo de logs para todas as ações." },
  { icon: Zap, title: "Dashboard Web", desc: "Configure tudo através de um dashboard moderno." },
];

export function TicketFeatures() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((f) => (
        <div
          key={f.title}
          className="rounded-xl p-5 transition-all duration-200 backdrop-blur-sm"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; }}
        >
          <f.icon className="w-6 h-6 text-white/50 mb-3" />
          <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
          <p className="text-xs text-silver/40 leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
