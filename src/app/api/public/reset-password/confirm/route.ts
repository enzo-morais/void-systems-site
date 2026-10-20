import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkCode } from "@/lib/codes";
import { RULES, checkIpAndEmail, getClientIp, tooManyRequests } from "@/lib/ratelimit";
import { codeSchema, emailSchema, parseBody, passwordSchema } from "@/lib/validation";

const bodySchema = z.object({ email: emailSchema, code: codeSchema, newPassword: passwordSchema }).strict();

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, bodySchema);
  if (!parsed.ok) return parsed.response;
  const { email, code, newPassword } = parsed.data;

  const limit = await checkIpAndEmail(RULES.resetConfirmIp, RULES.resetConfirmEmail, getClientIp(req.headers), email);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSec);

  if (!(await checkCode("reset", email, code))) {
    return NextResponse.json({ error: "Código incorreto ou expirado" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.siteUser.update({ where: { email }, data: { password: hashed } });

  return NextResponse.json({ success: true });
}
