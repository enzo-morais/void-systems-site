import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { resetPasswordEmail } from "@/lib/email-templates";
import { rateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip, 3, 60000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde 1 minuto." }, { status: 429 });
  }
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email obrigatório" }, { status: 400 });

  const user = await prisma.siteUser.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ success: true }); // Don't reveal if email exists

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await prisma.siteUser.update({ where: { email }, data: { verifyCode: code } });

  try {
    await resend.emails.send({
      from: "VOID Systems <noreply@voidsystems.store>",
      to: email,
      subject: "Recuperacao de senha - VOID Systems",
      html: resetPasswordEmail(code),
    });
  } catch {
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
