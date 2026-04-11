"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { VoidBackground } from "@/components/landing/void-background";
import { Header } from "@/components/landing/header";
import { User, Lock, Loader2, CheckCircle, Pencil, KeyRound, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" };
const inputClass = "w-full bg-black/40 border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-silver/30 backdrop-blur-sm";

export default function PerfilPage() {
  const { data: session, update } = useSession();
  const isDiscord = (session?.user as Record<string, unknown>)?.provider === "discord";

  // Edit profile
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState("");
  const [editError, setEditError] = useState("");

  // Change password
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  // Forgot password
  const [showForgot, setShowForgot] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetNewPw, setResetNewPw] = useState("");
  const [resetConfirmPw, setResetConfirmPw] = useState("");
  const [showResetPw, setShowResetPw] = useState(false);
  const [resetStep, setResetStep] = useState<"email" | "code">("email");

  function startEdit() {
    setEditName(session?.user?.name || "");
    setEditEmail(session?.user?.email || "");
    setEditing(true);
    setEditMsg(""); setEditError("");
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setEditLoading(true); setEditError(""); setEditMsg("");
    const res = await fetch("/api/profile/update", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, email: editEmail }),
    });
    setEditLoading(false);
    if (res.ok) {
      setEditMsg("Perfil atualizado");
      setEditing(false);
      update();
      setTimeout(() => setEditMsg(""), 3000);
    } else {
      setEditError((await res.json()).error || "Erro ao salvar");
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPwError("As senhas não coincidem"); return; }
    setPwLoading(true); setPwError(""); setPwMsg("");
    const res = await fetch("/api/profile/password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setPwLoading(false);
    if (res.ok) {
      setPwMsg("Senha alterada");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setShowPassword(false);
      setTimeout(() => setPwMsg(""), 3000);
    } else {
      setPwError((await res.json()).error || "Erro");
    }
  }

  async function handleForgotSend() {
    setForgotLoading(true); setForgotError(""); setForgotMsg("");
    const res = await fetch("/api/public/reset-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session?.user?.email }),
    });
    setForgotLoading(false);
    if (res.ok) {
      setResetStep("code");
      setForgotMsg("Código enviado pro seu email");
    } else {
      setForgotError("Erro ao enviar");
    }
  }

  async function handleForgotConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (resetNewPw !== resetConfirmPw) { setForgotError("As senhas não coincidem"); return; }
    setForgotLoading(true); setForgotError("");
    const res = await fetch("/api/public/reset-password/confirm", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session?.user?.email, code: resetCode, newPassword: resetNewPw }),
    });
    setForgotLoading(false);
    if (res.ok) {
      setForgotMsg("Senha redefinida com sucesso");
      setShowForgot(false); setResetStep("email"); setResetCode(""); setResetNewPw(""); setResetConfirmPw("");
      setTimeout(() => setForgotMsg(""), 3000);
    } else {
      setForgotError((await res.json()).error || "Código incorreto");
    }
  }

  return (
    <>
      <VoidBackground />
      <Header />
      <main className="relative z-10 pt-8 pb-20 px-6 max-w-2xl mx-auto min-h-screen">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2"><User className="w-6 h-6" /> Meu Perfil</h1>

        {/* Profile info */}
        <div className="rounded-xl p-6 mb-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {session?.user?.image ? (
                <Image src={session.user.image} alt="" width={56} height={56} className="rounded-full" />
              ) : (
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                  {(session?.user?.name || "?")[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-lg font-semibold">{session?.user?.name}</p>
                <p className="text-xs text-silver/40">{session?.user?.email}</p>
                <p className="text-[10px] text-silver/30 mt-1">{isDiscord ? "Conectado via Discord" : "Conta por email"}</p>
              </div>
            </div>
            {!isDiscord && !editing && (
              <button onClick={startEdit} className="flex items-center gap-1.5 text-xs text-silver/40 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                <Pencil className="w-3 h-3" /> Editar
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs text-silver/40 mb-1.5">Nome</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className={inputClass} style={{ borderColor: "rgba(255,255,255,0.08)" }} />
              </div>
              <div>
                <label className="block text-xs text-silver/40 mb-1.5">Email</label>
                <input type="email" value={session?.user?.email || ""} disabled className={inputClass + " opacity-40 cursor-not-allowed"} style={{ borderColor: "rgba(255,255,255,0.05)" }} />
              </div>
              {editError && <p className="text-red-400 text-xs">{editError}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={editLoading} className="bg-white text-black font-medium px-5 py-2 rounded-lg text-xs transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                  {editLoading && <Loader2 className="w-3 h-3 animate-spin" />} Salvar
                </button>
                <button type="button" onClick={() => setEditing(false)} className="text-xs text-silver/40 hover:text-white cursor-pointer px-4 py-2">Cancelar</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-[10px] text-silver/30 uppercase mb-1">Nome</p><p className="text-sm">{session?.user?.name || "—"}</p></div>
              <div><p className="text-[10px] text-silver/30 uppercase mb-1">Email</p><p className="text-sm">{session?.user?.email || "—"}</p></div>
              {isDiscord && (
                <>
                  <div><p className="text-[10px] text-silver/30 uppercase mb-1">Username</p><p className="text-sm">@{(session?.user as Record<string, unknown>)?.username as string || "—"}</p></div>
                  <div><p className="text-[10px] text-silver/30 uppercase mb-1">Discord ID</p><p className="text-sm font-mono">{(session?.user as Record<string, unknown>)?.discordId as string || "—"}</p></div>
                </>
              )}
            </div>
          )}
          {editMsg && <p className="text-green-400 text-xs mt-3 flex items-center gap-1"><CheckCircle className="w-3 h-3" />{editMsg}</p>}
        </div>

        {/* Password section - only for email accounts */}
        {!isDiscord && (
          <div className="rounded-xl p-6 mb-6" style={cardStyle}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-silver/60 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4" /> Senha
              </h2>
              <div className="flex gap-2">
                <button onClick={() => { setShowPassword(!showPassword); setShowForgot(false); }}
                  className="flex items-center gap-1.5 text-xs text-silver/40 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <Lock className="w-3 h-3" /> {showPassword ? "Fechar" : "Alterar senha"}
                </button>
                <button onClick={() => { setShowForgot(!showForgot); setShowPassword(false); setResetStep("email"); }}
                  className="flex items-center gap-1.5 text-xs text-silver/40 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <KeyRound className="w-3 h-3" /> Esqueci senha
                </button>
              </div>
            </div>

            {/* Change password */}
            {showPassword && (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs text-silver/40 mb-1.5">Senha atual</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="••••••" className={inputClass + " pr-10"} style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-silver/30 hover:text-white transition-colors cursor-pointer">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-silver/40 mb-1.5">Nova senha</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••" minLength={6} className={inputClass + " pr-10"} style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-silver/40 mb-1.5">Confirmar nova senha</label>
                  <input type={showPw ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••" minLength={6} className={inputClass} style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                </div>
                {pwError && <p className="text-red-400 text-xs">{pwError}</p>}
                {pwMsg && <p className="text-green-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" />{pwMsg}</p>}
                <button type="submit" disabled={pwLoading} className="bg-white text-black font-medium px-5 py-2 rounded-lg text-xs transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                  {pwLoading && <Loader2 className="w-3 h-3 animate-spin" />} Alterar
                </button>
              </form>
            )}

            {/* Forgot password */}
            {showForgot && (
              <div className="mt-4 space-y-3">
                {resetStep === "email" ? (
                  <>
                    <p className="text-xs text-silver/40">Vamos enviar um código de recuperação para <span className="text-white">{session?.user?.email}</span></p>
                    {forgotError && <p className="text-red-400 text-xs">{forgotError}</p>}
                    <button onClick={handleForgotSend} disabled={forgotLoading}
                      className="bg-white text-black font-medium px-5 py-2 rounded-lg text-xs transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                      {forgotLoading && <Loader2 className="w-3 h-3 animate-spin" />} Enviar código
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleForgotConfirm} className="space-y-3">
                    <p className="text-xs text-silver/40">Código enviado para <span className="text-white">{session?.user?.email}</span></p>
                    <div>
                      <label className="block text-xs text-silver/40 mb-1.5">Código</label>
                      <div className="flex gap-2 justify-center">
                        {[0,1,2,3,4,5].map((i) => (
                          <input key={i} id={`prf-${i}`} type="text" inputMode="numeric" maxLength={1} value={resetCode[i] || ""}
                            onPaste={(e) => { e.preventDefault(); const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0,6); setResetCode(t); setTimeout(() => document.getElementById(`prf-${Math.min(t.length,5)}`)?.focus(), 0); }}
                            onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); if (v.length > 1) { setResetCode(v.slice(0,6)); setTimeout(() => document.getElementById(`prf-${Math.min(v.length,5)}`)?.focus(), 0); return; } const a = resetCode.split(""); a[i] = v; setResetCode(a.join("").slice(0,6)); if (v && i < 5) document.getElementById(`prf-${i+1}`)?.focus(); }}
                            onKeyDown={(e) => { if (e.key === "Backspace" && !resetCode[i] && i > 0) document.getElementById(`prf-${i-1}`)?.focus(); }}
                            className="w-12 h-14 text-center text-xl font-bold rounded-lg border text-white"
                            style={{ backgroundColor: "rgba(255,255,255,0.1)", borderColor: resetCode[i] ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)" }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-silver/40 mb-1.5">Nova senha</label>
                      <div className="relative">
                        <input type={showResetPw ? "text" : "password"} value={resetNewPw} onChange={(e) => setResetNewPw(e.target.value)} required placeholder="••••••" minLength={6} className={inputClass + " pr-10"} style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                        <button type="button" onClick={() => setShowResetPw(!showResetPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-silver/30 hover:text-white transition-colors cursor-pointer">
                          {showResetPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-silver/40 mb-1.5">Confirmar nova senha</label>
                      <input type={showResetPw ? "text" : "password"} value={resetConfirmPw} onChange={(e) => setResetConfirmPw(e.target.value)} required placeholder="••••••" minLength={6} className={inputClass} style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                    </div>
                    {forgotError && <p className="text-red-400 text-xs">{forgotError}</p>}
                    <button type="submit" disabled={forgotLoading || resetCode.length < 6}
                      className="bg-white text-black font-medium px-5 py-2 rounded-lg text-xs transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                      {forgotLoading && <Loader2 className="w-3 h-3 animate-spin" />} Redefinir senha
                    </button>
                    <button type="button" onClick={() => { setResetStep("email"); setForgotError(""); }} className="text-xs text-silver/30 hover:text-white cursor-pointer">Reenviar código</button>
                  </form>
                )}
                {forgotMsg && <p className="text-green-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" />{forgotMsg}</p>}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
