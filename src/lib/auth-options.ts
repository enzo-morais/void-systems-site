import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { RULES, checkRate, emailKey, getClientIp } from "./ratelimit";
import { CLIENT_ROLE_ID, SESSION_MAX_AGE_S, STAFF_ROLE_ID, revalidateRoles } from "./staff-check";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const LOGIN_WEBHOOK = process.env.DISCORD_LOGIN_WEBHOOK;

async function sendLoginWebhook(username: string, id: string, provider: string, avatar?: string) {
  if (!LOGIN_WEBHOOK) return;
  const isDiscord = provider === "discord";
  try {
    await fetch(LOGIN_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        allowed_mentions: { parse: [] },
        embeds: [{
          title: isDiscord ? "Login via Discord" : "Login via Email",
          color: isDiscord ? 0x5865F2 : 0xffffff,
          fields: [
            { name: "Usuário", value: username, inline: true },
            { name: isDiscord ? "Discord ID" : "Email", value: id, inline: true },
            { name: "Método", value: isDiscord ? "Discord OAuth2" : "Email/Senha", inline: true },
          ],
          thumbnail: avatar ? { url: avatar } : undefined,
          timestamp: new Date().toISOString(),
          footer: { text: "VOID Systems" },
        }],
      }),
    });
  } catch { /* silent */ }
}

/**
 * Usuário staff de TESTE: só existe em desenvolvimento (NODE_ENV !== "production") e só se
 * DEV_STAFF_EMAIL e DEV_STAFF_PASSWORD estiverem no .env.local. Em produção nunca é aceito.
 */
const DEV_STAFF_ID = "dev-staff";
function matchesDevStaff(email: string, password: string): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const devEmail = process.env.DEV_STAFF_EMAIL;
  const devPassword = process.env.DEV_STAFF_PASSWORD;
  return Boolean(devEmail && devPassword && email === devEmail && password === devPassword);
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      // o Discord devolve `iss` na volta do OAuth (RFC 9207); sem declarar o issuer o NextAuth falha com OAuthCallback
      issuer: "https://discord.com",
      authorization: { params: { scope: "identify guilds guilds.members.read" } },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        if (typeof credentials?.email !== "string" || typeof credentials?.password !== "string") return null;
        if (!credentials.email || !credentials.password) return null;

        // limite de tentativas por IP e por email: barra força bruta no login
        const byIp = await checkRate(RULES.loginIp, getClientIp((req?.headers ?? {}) as Record<string, string | string[] | undefined>));
        const byEmail = byIp.ok ? await checkRate(RULES.loginEmail, emailKey(credentials.email)) : byIp;
        if (!byEmail.ok) throw new Error("RATE_LIMITED");

        if (matchesDevStaff(credentials.email, credentials.password)) {
          return { id: DEV_STAFF_ID, name: "Staff de Teste", email: credentials.email, image: null };
        }

        const user = await prisma.siteUser.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        if (!user.emailVerified) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "discord" && profile) {
        const discordId = (profile as { id: string }).id;
        const username = (profile as { username: string }).username;
        const avatarHash = (profile as { avatar: string }).avatar;
        const avatarUrl = avatarHash ? `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png` : undefined;

        token.discordId = discordId;
        token.username = username;
        token.image = avatarUrl;
        token.provider = "discord";

        await sendLoginWebhook(username, discordId, "discord", avatarUrl);

        // Sincronizar bots: se existir bot com o Discord ID como userId, atualizar para o userId real do banco
        try {
          if (token.sub) {
            await prisma.discloudBot.updateMany({
              where: { userId: discordId },
              data: { userId: token.sub }
            });
          }
        } catch { /* silent */ }

        try {
          const res = await fetch(
            `https://discord.com/api/v10/users/@me/guilds/${DISCORD_GUILD_ID}/member`,
            { headers: { Authorization: `Bearer ${account.access_token}` } }
          );
          if (res.ok) {
            const member = await res.json();
            const roles = member.roles as string[];
            token.isStaff = roles.includes(STAFF_ROLE_ID);
            token.isClient = roles.includes(CLIENT_ROLE_ID);
            token.rolesCheckedAt = token.rolesOkAt = Date.now();
          } else {
            token.isStaff = false;
            token.isClient = false;
          }
        } catch {
          token.isStaff = false;
        }
      }

      if (account?.provider === "credentials") {
        token.provider = "credentials";
        // staff de teste (só em desenvolvimento, ver matchesDevStaff)
        token.isStaff = process.env.NODE_ENV !== "production" && user?.id === DEV_STAFF_ID;
        token.isClient = false;
        if (user?.id !== DEV_STAFF_ID) await sendLoginWebhook(token.name || "Usuário", token.email || "email", "credentials"); // o staff de teste não avisa o Discord
      }

      // nas requisições seguintes, confere de novo se a pessoa ainda tem o cargo (a cada ~10 min)
      if (!account) await revalidateRoles(token);

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).discordId = token.discordId;
        (session.user as Record<string, unknown>).username = token.username;
        (session.user as Record<string, unknown>).isStaff = token.isStaff;
        (session.user as Record<string, unknown>).isClient = token.isClient;
        (session.user as Record<string, unknown>).provider = token.provider;
        (session.user as Record<string, unknown>).id = token.sub ?? token.discordId;
        if (token.image) session.user.image = token.image as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  // sessão curta: depois de 24h é preciso entrar de novo (e o cargo de staff é revalidado no meio do caminho)
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_S },
  jwt: { maxAge: SESSION_MAX_AGE_S },
};

export function isStaffMember(session: { user?: { isStaff?: boolean } } | null): boolean {
  return session?.user?.isStaff === true;
}
