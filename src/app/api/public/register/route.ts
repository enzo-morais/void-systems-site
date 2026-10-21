import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { verificationCodeEmail } from "@/lib/email-templates";
import { issueCode } from "@/lib/codes";
import { RULES, checkIpAndEmail, getClientIp, tooManyRequests } from "@/lib/ratelimit";
import { emailSchema, nameSchema, parseBody, passwordSchema } from "@/lib/validation";

const resend = new Resend(process.env.RESEND_API_KEY);

const bodySchema = z.object({ name: nameSchema, email: emailSchema, password: passwordSchema }).strict();

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, bodySchema);
  if (!parsed.ok) return parsed.response;
  const { name, email, password } = parsed.data;

  const limit = await checkIpAndEmail(RULES.registerIp, RULES.registerEmail, getClientIp(req.headers), email);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSec);

  const existing = await prisma.siteUser.findUnique({ where: { email } });
  // o hash roda nos dois caminhos para a resposta demorar o mesmo tempo
  const hashedPassword = await bcrypt.hash(password, 12);

  if (existing && existing.emailVerified) {
    // Não revela que o email já tem conta: mesma resposta de um cadastro novo. A conta existente não é alterada;
    // o dono recebe um aviso por email com o caminho para entrar ou recuperar a senha.
    try {
      await resend.emails.send({
        from: "VOID Systems <noreply@voidsystems.store>",
        to: email,
        subject: "Tentativa de cadastro - VOID Systems",
        html: "<p>Alguém tentou criar uma conta na VØID Systems com este email, mas ele já está cadastrado.</p><p>Se foi você, é só entrar normalmente ou usar \"Esqueci minha senha\". Se não foi, ignore esta mensagem.</p>",
      });
    } catch (err) {
      console.error("[EMAIL] Erro ao enviar aviso:", err instanceof Error ? err.message : "desconhecido");
    }
    return NextResponse.json({ needsVerification: true }, { status: 201 });
  }

  if (existing) {
    await prisma.siteUser.update({ where: { email }, data: { name, password: hashedPassword } });
  } else {
    await prisma.siteUser.create({ data: { name, email, password: hashedPassword } });
  }

  const code = await issueCode("verify", email);

  try {
    await resend.emails.send({
      from: "VOID Systems <noreply@voidsystems.store>",
      to: email,
      subject: "Codigo de verificacao - VOID Systems",
      html: verificationCodeEmail(code),
    });
  } catch (err) {
    console.error("[EMAIL] Erro ao enviar:", err instanceof Error ? err.message : "desconhecido");
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 });
  }

  return NextResponse.json({ needsVerification: true }, { status: 201 });
}
