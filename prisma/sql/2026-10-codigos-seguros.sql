-- Códigos de verificação e de redefinição de senha: só o hash, com validade e contador de tentativas.
-- Somente ADICIONA colunas opcionais em "SiteUser" (nada existente é alterado ou apagado).
-- A coluna antiga "verifyCode" (texto puro) fica no banco e deixa de ser usada pelo código novo;
-- depois do deploy, limpe-a com:  UPDATE "SiteUser" SET "verifyCode" = NULL;
ALTER TABLE "SiteUser" ADD COLUMN IF NOT EXISTS "verifyCodeHash" TEXT;
ALTER TABLE "SiteUser" ADD COLUMN IF NOT EXISTS "verifyCodeExpires" TIMESTAMP(3);
ALTER TABLE "SiteUser" ADD COLUMN IF NOT EXISTS "verifyAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SiteUser" ADD COLUMN IF NOT EXISTS "resetCodeHash" TEXT;
ALTER TABLE "SiteUser" ADD COLUMN IF NOT EXISTS "resetCodeExpires" TIMESTAMP(3);
ALTER TABLE "SiteUser" ADD COLUMN IF NOT EXISTS "resetAttempts" INTEGER NOT NULL DEFAULT 0;
