-- Criar tabela de bots Discloud
CREATE TABLE IF NOT EXISTS "DiscloudBot" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "discloudAppId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'offline',
  "lastAction" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_discloudbot_userid ON "DiscloudBot"("userId");
CREATE INDEX IF NOT EXISTS idx_discloudbot_appid ON "DiscloudBot"("discloudAppId");

-- Atualizar tabela de Logs para incluir userId
ALTER TABLE "Log" ADD COLUMN IF NOT EXISTS "userId" TEXT;
CREATE INDEX IF NOT EXISTS idx_log_userid ON "Log"("userId");
