import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "./prisma";

// Códigos de 6 dígitos (verificação de email e redefinição de senha).
// - gerados com crypto.randomInt;
// - só o HMAC (hash com segredo do servidor) vai para o banco, nunca o código;
// - valem 15 minutos, 5 tentativas e são de uso único;
// - cada finalidade tem os seus próprios campos (verificação e reset nunca se misturam).

export const CODE_TTL_MS = 15 * 60 * 1000;
export const CODE_MAX_ATTEMPTS = 5;

export type CodePurpose = "verify" | "reset";

const FIELDS = {
  verify: { hash: "verifyCodeHash", expires: "verifyCodeExpires", attempts: "verifyAttempts" },
  reset: { hash: "resetCodeHash", expires: "resetCodeExpires", attempts: "resetAttempts" },
} as const;

function secret(): string {
  const s = process.env.CODE_HASH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("Defina CODE_HASH_SECRET (ou NEXTAUTH_SECRET) para proteger os códigos");
  return s;
}

export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** HMAC do código, preso à finalidade e ao email (um código não serve para outra conta nem outra função). */
export function hashCode(purpose: CodePurpose, email: string, code: string): string {
  return createHmac("sha256", secret()).update(`${purpose}|${email.trim().toLowerCase()}|${code}`).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const x = Buffer.from(a, "hex");
  const y = Buffer.from(b, "hex");
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Gera um código novo para o usuário (invalida o anterior) e devolve o código em texto puro para enviar por email. */
export async function issueCode(purpose: CodePurpose, email: string, now: Date = new Date()): Promise<string> {
  const f = FIELDS[purpose];
  const code = generateCode();
  await prisma.siteUser.update({
    where: { email },
    data: {
      [f.hash]: hashCode(purpose, email, code),
      [f.expires]: new Date(now.getTime() + CODE_TTL_MS),
      [f.attempts]: 0,
    },
  });
  return code;
}

/**
 * Confere o código. Cada chamada consome 1 tentativa ANTES de comparar (atômico no banco), então
 * mesmo com requisições paralelas ninguém passa de 5 palpites. Código certo = uso único.
 * Qualquer falha (usuário inexistente, expirado, esgotado, errado) devolve false, sem dizer qual.
 */
export async function checkCode(purpose: CodePurpose, email: string, code: string, now: Date = new Date()): Promise<boolean> {
  const f = FIELDS[purpose];

  const reserved = await prisma.siteUser.updateMany({
    where: { email, [f.hash]: { not: null }, [f.expires]: { gt: now }, [f.attempts]: { lt: CODE_MAX_ATTEMPTS } },
    data: { [f.attempts]: { increment: 1 } },
  });
  if (reserved.count === 0) return false;

  const user = await prisma.siteUser.findUnique({ where: { email } });
  const stored = user ? (user[f.hash] as string | null) : null;
  if (!stored || !safeEqualHex(stored, hashCode(purpose, email, code))) return false;

  // uso único: só uma requisição consegue "gastar" o código
  const spent = await prisma.siteUser.updateMany({
    where: { email, [f.hash]: stored },
    data: { [f.hash]: null, [f.expires]: null, [f.attempts]: 0 },
  });
  return spent.count === 1;
}
