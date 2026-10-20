-- Contadores do rate limit (substitui o Upstash). Somente CRIA uma tabela nova; nada existente é alterado.
CREATE TABLE IF NOT EXISTS "RateLimit" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);
CREATE INDEX IF NOT EXISTS "RateLimit_expiresAt_idx" ON "RateLimit"("expiresAt");
