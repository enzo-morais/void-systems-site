import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkCode } from "@/lib/codes";
import { RULES, checkIpAndEmail, getClientIp, tooManyRequests } from "@/lib/ratelimit";
import { codeSchema, emailSchema, parseBody } from "@/lib/validation";

const bodySchema = z.object({ email: emailSchema, code: codeSchema }).strict();

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, bodySchema);
  if (!parsed.ok) return parsed.response;
  const { email, code } = parsed.data;

  const limit = await checkIpAndEmail(RULES.verifyIp, RULES.verifyEmail, getClientIp(req.headers), email);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSec);

  // Mesma resposta para qualquer falha (email inexistente, já verificado, código errado, expirado ou esgotado):
  // ninguém descobre se uma conta existe por aqui.
  if (!(await checkCode("verify", email, code))) {
    return NextResponse.json({ error: "Código incorreto ou expirado" }, { status: 400 });
  }

  await prisma.siteUser.update({ where: { email }, data: { emailVerified: true } });
  return NextResponse.json({ success: true });
}
