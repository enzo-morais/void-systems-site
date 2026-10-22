"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { AlertCircle, ChevronDown, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { clients } from "@/config/home";
import { DISCORD_INVITE_URL } from "@/config/store";
import "@/components/home/home.css";
import { safeCallbackPath } from "@/lib/safe-redirect";
import "./login.css";

type Mode = "login" | "register" | "verify" | "forgot" | "reset";
type Field = "name" | "email" | "password" | "code" | "form";

/** Avisa o fundo animado (VoidBackground) sobre o estado do login. */
function bg(detail: { state: "hover" | "hover-end" | "loading" | "idle" | "error" | "success"; x?: number; y?: number }) {
  window.dispatchEvent(new CustomEvent("void-bg", { detail }));
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

const DISCORD_ICON =
  "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z";

/** Campo de código de 6 dígitos (verificação e redefinição de senha). */
function Otp({ idPrefix, value, onChange }: { idPrefix: string; value: string; onChange: (v: string) => void }) {
  const focus = (i: number) => setTimeout(() => document.getElementById(`${idPrefix}-${i}`)?.focus(), 0);
  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          id={`${idPrefix}-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoComplete="one-time-code"
          aria-label={`Dígito ${i + 1}`}
          value={value[i] || ""}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            onChange(text);
            focus(Math.min(text.length, 5));
          }}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            if (val.length > 1) {
              onChange(val.slice(0, 6));
              focus(Math.min(val.length, 5));
              return;
            }
            const arr = value.split("");
            arr[i] = val;
            onChange(arr.join("").slice(0, 6));
            if (val && i < 5) focus(i + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i] && i > 0) focus(i - 1);
          }}
          className="lg-otp"
        />
      ))}
    </div>
  );
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} role="alert" className="lg-error">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {msg}
    </p>
  );
}

function LoginContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackPath(searchParams.get("callbackUrl"));

  const [mode, setMode] = useState<Mode>("login");
  const [emailOpen, setEmailOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [err, setErr] = useState<{ field: Field; msg: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [clientIdx, setClientIdx] = useState(0);
  const succeeded = useRef(false);

  // erro devolvido pelo NextAuth na URL (?error=...), ex.: falha ao voltar do Discord
  const urlError = searchParams.get("error");
  const authError = urlError && urlError !== "CredentialsSignin" ? urlError : null;

  const busy = loading || discordLoading;
  const errFor = (f: Field) => (err?.field === f ? err.msg : undefined);

  // o fundo pulsa devagar enquanto o login carrega
  useEffect(() => {
    bg({ state: busy ? "loading" : "idle" });
  }, [busy]);

  // nomes dos clientes alternando em fade
  useEffect(() => {
    const id = window.setInterval(() => setClientIdx((i) => (i + 1) % clients.length), 2600);
    return () => window.clearInterval(id);
  }, []);

  // sucesso: partículas sugadas, flash, e só então redireciona (com a transição de página)
  const success = useCallback(() => {
    if (succeeded.current) return;
    succeeded.current = true;
    bg({ state: "success" });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => router.push(callbackUrl), reduce ? 0 : 950);
  }, [router, callbackUrl]);

  useEffect(() => {
    if (session) success();
  }, [session, success]);

  function fail(field: Field, msg: string) {
    setErr({ field, msg });
    setShaking(true);
    window.setTimeout(() => setShaking(false), 520);
    bg({ state: "error" });
  }

  function fieldOf(message: string): Field {
    const m = message.toLowerCase();
    if (m.includes("email") && !m.includes("senha")) return "email";
    if (m.includes("senha")) return "password";
    if (m.includes("nome")) return "name";
    return "form";
  }

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    if (mode === "register") {
      const res = await fetch("/api/public/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoading(false);
        const msg = data.error || "Não foi possível criar a conta. Tente de novo.";
        fail(fieldOf(msg), msg);
        return;
      }
      if (data.needsVerification) {
        setLoading(false);
        setMode("verify");
        return;
      }
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error === "RATE_LIMITED") {
      fail("password", "Muitas tentativas. Aguarde alguns minutos e tente de novo.");
    } else if (result?.error) {
      fail("password", "Email ou senha incorretos. Confira os dados e tente de novo.");
    }
    // sucesso: o efeito da sessão dispara a animação e o redirecionamento
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const res = await fetch("/api/public/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: verifyCode }),
    });

    if (!res.ok) {
      setLoading(false);
      const data = await res.json().catch(() => ({}));
      fail("code", data.error || "Código incorreto. Confira o email e tente de novo.");
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setMode("login");
      setEmailOpen(true);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
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
      const data = await res.json().catch(() => ({}));
      fail("email", data.error || "Não foi possível enviar o email. Tente de novo.");
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/public/reset-password/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: verifyCode, newPassword }),
    });
    setLoading(false);
    if (res.ok) {
      setMode("login");
      setEmailOpen(true);
      setVerifyCode("");
      setNewPassword("");
      setErr(null);
    } else {
      const data = await res.json().catch(() => ({}));
      fail("code", data.error || "Código incorreto. Confira o email e tente de novo.");
    }
  }

  function go(next: Mode) {
    setMode(next);
    setErr(null);
    if (next === "register") setEmailOpen(true);
  }

  function onDiscordEnter(e: React.MouseEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    bg({ state: "hover", x: r.left + r.width / 2, y: r.top + r.height / 2 });
  }

  function discordLogin() {
    setDiscordLoading(true);
    signIn("discord", { callbackUrl });
  }

  const subtitle =
    mode === "login" ? "Entre para continuar" : mode === "register" ? "Crie a sua conta" : mode === "forgot" ? "Recuperar senha" : mode === "reset" ? "Defina uma nova senha" : "Verifique o seu email";

  const registering = mode === "register";
  const showMain = mode === "login" || mode === "register";

  return (
    <div className="site-root lg-page">
      <div className="lg-panel">
        <div className={`lg-inner ${shaking ? "lg-shake" : ""}`}>
          <h1 className="lg-brand font-display">
            VØID <span>Systems</span>
          </h1>
          <p className="lg-sub">{subtitle}</p>

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4" noValidate={false}>
              <p className="lg-note">Digite o seu email para receber o código de recuperação.</p>
              <div>
                <label htmlFor="lg-email" className="lg-label">Email</label>
                <input id="lg-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" className="lg-input" aria-invalid={!!errFor("email")} aria-describedby={errFor("email") ? "lg-email-err" : undefined} />
                <FieldError id="lg-email-err" msg={errFor("email")} />
              </div>
              <button type="submit" disabled={loading} className="lg-btn lg-btn--light">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar código
              </button>
              <button type="button" onClick={() => go("login")} className="lg-link">Voltar ao login</button>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="lg-note">
                Enviamos um código para <b className="text-white">{email}</b>
              </p>
              <Otp idPrefix="rst" value={verifyCode} onChange={setVerifyCode} />
              <FieldError id="lg-code-err" msg={errFor("code")} />
              <div>
                <label htmlFor="lg-newpw" className="lg-label">Nova senha</label>
                <input id="lg-newpw" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••" minLength={8} className="lg-input" />
              </div>
              <button type="submit" disabled={loading || verifyCode.length < 6} className="lg-btn lg-btn--light">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Redefinir senha
              </button>
              <button type="button" onClick={() => { go("forgot"); setVerifyCode(""); }} className="lg-link">Reenviar código</button>
            </form>
          )}

          {mode === "verify" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="lg-note">
                Enviamos um código de 6 dígitos para <b className="text-white">{email}</b>
              </p>
              <Otp idPrefix="otp" value={verifyCode} onChange={setVerifyCode} />
              <FieldError id="lg-code-err" msg={errFor("code")} />
              <button type="submit" disabled={loading || verifyCode.length < 6} className="lg-btn lg-btn--light">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Verificar
              </button>
              <button type="button" onClick={() => go("register")} className="lg-link">Reenviar código</button>
            </form>
          )}

          {showMain && (
            <>
              <button
                type="button"
                onClick={discordLogin}
                onMouseEnter={onDiscordEnter}
                onMouseLeave={() => bg({ state: "hover-end" })}
                onFocus={(e) => onDiscordEnter(e as unknown as React.MouseEvent<HTMLButtonElement>)}
                onBlur={() => bg({ state: "hover-end" })}
                disabled={busy}
                className="lg-btn lg-btn--discord"
              >
                {discordLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={DISCORD_ICON} />
                  </svg>
                )}
                {discordLoading ? "Conectando ao Discord..." : "Entrar com Discord"}
              </button>
              <FieldError id="lg-auth-err" msg={authError ? `Não foi possível entrar com o Discord. Tente de novo. (código: ${authError})` : undefined} />

              <div className="lg-or">
                <span />
                ou
                <span />
              </div>

              <button
                type="button"
                onClick={() => setEmailOpen((o) => !o)}
                aria-expanded={emailOpen || registering}
                aria-controls="lg-email-area"
                className="lg-btn lg-btn--ghost"
              >
                <Mail className="w-4 h-4" />
                {registering ? "Criar conta com email" : "Entrar com email"}
                <ChevronDown className={`lg-chev ${emailOpen || registering ? "lg-chev--open" : ""}`} />
              </button>

              <div id="lg-email-area" className={`lg-collapse ${emailOpen || registering ? "lg-collapse--open" : ""}`} inert={!(emailOpen || registering)}>
                <div className="lg-collapse-inner">
                  <form onSubmit={handleCredentials} className="lg-form">
                    {registering && (
                      <div>
                        <label htmlFor="lg-name" className="lg-label">Nome</label>
                        <input id="lg-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Seu nome" className="lg-input" aria-invalid={!!errFor("name")} />
                        <FieldError id="lg-name-err" msg={errFor("name")} />
                      </div>
                    )}
                    <div>
                      <label htmlFor="lg-email" className="lg-label">Email</label>
                      <input id="lg-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" className="lg-input" aria-invalid={!!errFor("email")} aria-describedby={errFor("email") ? "lg-email-err" : undefined} />
                      <FieldError id="lg-email-err" msg={errFor("email")} />
                    </div>
                    <div>
                      <label htmlFor="lg-password" className="lg-label">Senha</label>
                      <div className="relative">
                        <input
                          id="lg-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete={registering ? "new-password" : "current-password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="••••••"
                          minLength={registering ? 8 : undefined}
                          className="lg-input pr-11"
                          aria-invalid={!!errFor("password")}
                          aria-describedby={errFor("password") ? "lg-password-err" : undefined}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="lg-eye">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <FieldError id="lg-password-err" msg={errFor("password")} />
                    </div>
                    <FieldError id="lg-form-err" msg={errFor("form")} />

                    <button type="submit" disabled={busy} className="lg-btn lg-btn--light">
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {registering ? "Criar conta" : "Entrar"}
                    </button>
                    {registering && (
                      <p className="text-[11px] leading-relaxed text-zinc-500">
                        Ao criar a conta, você concorda com os <Link href="/termos" className="underline underline-offset-2 hover:text-white">Termos de Uso</Link> e
                        a <Link href="/privacidade" className="underline underline-offset-2 hover:text-white">Política de Privacidade</Link>.
                      </p>
                    )}
                  </form>

                  <p className="lg-switch">
                    {registering ? (
                      <>
                        Já tem conta? <button type="button" onClick={() => go("login")}>Fazer login</button>
                      </>
                    ) : (
                      <>
                        Não tem conta? <button type="button" onClick={() => go("register")}>Criar conta</button>
                        <br />
                        <button type="button" className="lg-muted" onClick={() => go("forgot")}>Esqueci minha senha</button>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="lg-foot">
            <p>&copy; 2026 VØID Systems</p>
            <div>
              <Link href="/termos">Termos</Link>
              <Link href="/privacidade">Privacidade</Link>
              <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">Discord</a>
            </div>
          </div>
        </div>
      </div>

      {/* lado direito: o logo de partículas é desenhado pelo fundo; aqui ficam só a frase e os clientes */}
      <div className="lg-side" aria-hidden="false">
        <p className="lg-phrase font-display">Seu servidor rodando sozinho, 24 horas.</p>
        <p className="lg-used">
          <span className="lg-used-static">Usado por {clients.join(", ")}</span>
          <span className="lg-used-rot">
            Usado por <b key={clientIdx}>{clients[clientIdx]}</b>
          </span>
        </p>
      </div>
    </div>
  );
}
