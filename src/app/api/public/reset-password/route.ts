import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { resetPasswordEmail } from "@/lib/email-templates";
import { issueCode } from "@/lib/codes";
import { RULES, checkIpAndEmail, getClientIp, tooManyRequests } from "@/lib/ratelimit";
import { emailSchema, parseBody } from "@/lib/validation";

const resend = new Resend(process.env.RESEND_API_KEY);

const bodySchema = z.object({ email: emailSchema }).strict();

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, bodySchema);
  if (!parsed.ok) return parsed.response;
  const { email } = parsed.data;

  const limit = await checkIpAndEmail(RULES.resetRequestIp, RULES.resetRequestEmail, getClientIp(req.headers), email);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSec);

  const user = await prisma.siteUser.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ success: true }); // não revela se o email existe

  const code = await issueCode("reset", email);

  try {
    await resend.emails.send({
      from: "VOID Systems <noreply@voidsystems.store>",
      to: email,
      subject: "Recuperacao de senha - VOID Systems",
      html: resetPasswordEmail(code),
    });
  } catch (err) {
    console.error("[EMAIL] Erro ao enviar:", err instanceof Error ? err.message : "desconhecido");
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
