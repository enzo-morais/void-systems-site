import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

// Em produção (Vercel serverless), cada invocação pode ser um processo novo
// Usamos o global para reutilizar quando possível
export const prisma = global.prisma ?? createPrismaClient();

global.prisma = prisma;
