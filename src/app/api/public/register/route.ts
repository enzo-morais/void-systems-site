import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { verificationCodeEmail } from "@/lib/email-templates";
import { rateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip, 3, 60000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde 1 minuto." }, { status: 429 });
  }
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Senha deve ter no mínimo 6 caracteres" }, { status: 400 });
  }

  const existing = await prisma.siteUser.findUnique({ where: { email } });
  if (existing && existing.emailVerified) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const code = String(Math.floor(100000 + Math.random() * 900000));

  if (existing && !existing.emailVerified) {
    await prisma.siteUser.update({
      where: { email },
      data: { name, password: hashedPassword, verifyCode: code },
    });
  } else {
    await prisma.siteUser.create({
      data: { name, email, password: hashedPassword, verifyCode: code },
    });
  }

  try {
    const result = await resend.emails.send({
      from: "VOID Systems <noreply@voidsystems.store>",
      to: email,
      subject: "Codigo de verificacao - VOID Systems",
      html: verificationCodeEmail(code),
    });
    console.log("[EMAIL] Sent:", JSON.stringify(result));
  } catch (err) {
    console.error("[EMAIL] Error:", err);
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 });
  }

  return NextResponse.json({ needsVerification: true }, { status: 201 });
}
