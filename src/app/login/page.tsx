"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { VoidBackground } from "@/components/landing/void-background";
import { LoginCarousel } from "@/components/login-carousel";

const inputClass = "w-full bg-white/[0.04] border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-silver/30 backdrop-blur-sm";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [mode, setMode] = useState<"login" | "register" | "verify" | "forgot" | "reset">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (session) router.push(callbackUrl);
  }, [session, router, callbackUrl]);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");

    if (mode === "register") {
      const res = await fetch("/api/public/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "Erro ao cadastrar");
        return;
      }
      if (data.needsVerification) {
        setMode("verify");
        return;
      }
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("Email ou senha incorretos");
    } else {
      router.push(callbackUrl);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");

    const res = await fetch("/api/public/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: verifyCode }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Código incorreto");
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setMode("login");
    } else {
      router.push(callbackUrl);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/public/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      setMode("reset");
      setVerifyCode("");
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao enviar email");
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/public/reset-password/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: verifyCode, newPassword }),
    });
    setLoading(false);
    if (res.ok) {
      setMode("login");
      setVerifyCode(""); setNewPassword("");
      setError("");
    } else {
      const data = await res.json();
      setError(data.error || "Código incorreto");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Starfield - covers everything */}
      <div className="fixed inset-0 z-0">
        <VoidBackground />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left - Glass login panel */}
        <div
          className="w-full lg:w-[440px] shrink-0 flex flex-col justify-center px-8 sm:px-12 py-12"
          style={{
            backgroundColor: "rgba(0,0,0,0.75)",
            borderRight: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "4px 0 30px rgba(0,0,0,0.5)",
          }}
        >
          <div className="max-w-sm mx-auto w-full">
            <h1
              className="text-4xl font-bold tracking-tighter mb-1"
              style={{
                background: "linear-gradient(to right, #ffffff, #c0c0c0, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              VØID <span className="text-2xl font-light">Systems</span>
            </h1>
            <p className="text-silver/40 text-sm mb-10">
              {mode === "login" ? "Faça login para continuar" : mode === "register" ? "Crie sua conta" : mode === "forgot" ? "Recuperar senha" : mode === "reset" ? "Nova senha" : "Verifique seu email"}
            </p>

            {mode === "forgot" ? (
              <form onSubmit={handleForgot} className="space-y-3">
                <p className="text-xs text-silver/40 mb-4">Digite seu email para receber o código de recuperação.</p>
                <div>
                  <label className="block text-xs text-silver/40 mb-1.5">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-white text-black font-medium py-2.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enviar código
                </button>
                <button type="button" onClick={() => { setMode("login"); setError(""); }} className="w-full text-xs text-silver/30 hover:text-white transition-colors cursor-pointer py-2">Voltar ao login</button>
              </form>
            ) : mode === "reset" ? (
              <form onSubmit={handleReset} className="space-y-4">
                <p className="text-xs text-silver/40 mb-4">Enviamos um código para <span className="text-white">{email}</span></p>
                <div className="flex gap-2 justify-center">
                  {[0,1,2,3,4,5].map((i) => (
                    <input key={i} id={`rst-${i}`} type="text" inputMode="numeric" maxLength={1} value={verifyCode[i] || ""}
                      onPaste={(e) => { e.preventDefault(); const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0,6); setVerifyCode(t); setTimeout(() => document.getElementById(`rst-${Math.min(t.length,5)}`)?.focus(), 0); }}
                      onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); if (v.length > 1) { setVerifyCode(v.slice(0,6)); setTimeout(() => document.getElementById(`rst-${Math.min(v.length,5)}`)?.focus(), 0); return; } const a = verifyCode.split(""); a[i] = v; setVerifyCode(a.join("").slice(0,6)); if (v && i < 5) document.getElementById(`rst-${i+1}`)?.focus(); }}
                      onKeyDown={(e) => { if (e.key === "Backspace" && !verifyCode[i] && i > 0) document.getElementById(`rst-${i-1}`)?.focus(); }}
                      className="w-12 h-14 text-center text-xl font-bold rounded-lg border text-white"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)", borderColor: verifyCode[i] ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)" }}
                    />
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-silver/40 mb-1.5">Nova senha</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••" minLength={6} className={inputClass} style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                </div>
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <button type="submit" disabled={loading || verifyCode.length < 6}
                  className="w-full bg-white text-black font-medium py-2.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Redefinir senha
                </button>
                <button type="button" onClick={() => { setMode("forgot"); setError(""); setVerifyCode(""); }} className="w-full text-xs text-silver/30 hover:text-white transition-colors cursor-pointer py-2">Reenviar código</button>
              </form>
            ) : mode === "verify" ? (
              <form onSubmit={handleVerify} className="space-y-4">
                <p className="text-xs text-silver/40 mb-4">Enviamos um código de 6 dígitos para <span className="text-white">{email}</span></p>
                <div className="flex gap-2 justify-center">
                  {[0,1,2,3,4,5].map((i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={verifyCode[i] || ""}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                        setVerifyCode(text);
                        const focusIdx = Math.min(text.length, 5);
                        setTimeout(() => document.getElementById(`otp-${focusIdx}`)?.focus(), 0);
                      }}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length > 1) {
                          setVerifyCode(val.slice(0, 6));
                          const focusIdx = Math.min(val.length, 5);
                          setTimeout(() => document.getElementById(`otp-${focusIdx}`)?.focus(), 0);
                          return;
                        }
                        const arr = verifyCode.split("");
                        arr[i] = val;
                        setVerifyCode(arr.join("").slice(0, 6));
                        if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !verifyCode[i] && i > 0) document.getElementById(`otp-${i-1}`)?.focus();
                      }}
                      className="w-12 h-14 text-center text-xl font-bold rounded-lg border text-white"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)", borderColor: verifyCode[i] ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)" }}
                    />
                  ))}
                </div>
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <button type="submit" disabled={loading || verifyCode.length < 6}
                  className="w-full bg-white text-black font-medium py-2.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verificar
                </button>
                <button type="button" onClick={() => { setMode("register"); setError(""); }} className="w-full text-xs text-silver/30 hover:text-white transition-colors cursor-pointer py-2">Reenviar código</button>
              </form>
            ) : (
            <>

            {/* Discord */}
            <button
              onClick={() => signIn("discord", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(88,101,242,0.3)] cursor-pointer mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
              </svg>
              Entrar com Discord
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
              <span className="text-[10px] text-silver/30 uppercase tracking-wider">ou</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleCredentials} className="space-y-3">
              {mode === "register" && (
                <div>
                  <label className="block text-xs text-silver/40 mb-1.5">Nome</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Seu nome" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                </div>
              )}
              <div>
                <label className="block text-xs text-silver/40 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.08)" }} />
              </div>
              <div>
                <label className="block text-xs text-silver/40 mb-1.5">Senha</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••" minLength={6} className={inputClass + " pr-10"} style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-silver/30 hover:text-white transition-colors cursor-pointer">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-white text-black font-medium py-2.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <p className="text-xs text-silver/30 mt-6 text-center">
              {mode === "login" ? (
                <>
                  Não tem conta? <button onClick={() => { setMode("register"); setError(""); }} className="text-white hover:underline cursor-pointer">Criar conta</button>
                  <br />
                  <button onClick={() => { setMode("forgot"); setError(""); }} className="text-silver/40 hover:text-white hover:underline cursor-pointer mt-2 inline-block">Esqueci minha senha</button>
                </>
              ) : (
                <>Já tem conta? <button onClick={() => { setMode("login"); setError(""); }} className="text-white hover:underline cursor-pointer">Fazer login</button></>
              )}
            </p>
            </>
            )}

            <div className="mt-10 pt-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] text-silver/20 mb-1">&copy; 2026 VØID Systems</p>
              <div className="flex items-center justify-center gap-3">
                <a href="/termos" className="text-[10px] text-silver/30 hover:text-white transition-colors">Termos</a>
                <a href="/privacidade" className="text-[10px] text-silver/30 hover:text-white transition-colors">Privacidade</a>
                <a href="https://discord.gg/voidsystems" target="_blank" rel="noopener noreferrer" className="text-[10px] text-silver/30 hover:text-white transition-colors">Discord</a>
              </div>
            </div>
          </div>
        </div>

        {/* Right - carousel */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <LoginCarousel />
        </div>
      </div>
    </div>
  );
}
