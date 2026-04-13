import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const STAFF_ROLE_ID = "1462664924936274144";
const LOGIN_WEBHOOK = process.env.DISCORD_LOGIN_WEBHOOK;

async function sendLoginWebhook(username: string, id: string, provider: string, avatar?: string) {
  if (!LOGIN_WEBHOOK) return;
  const isDiscord = provider === "discord";
  try {
    await fetch(LOGIN_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify guilds guilds.members.read" } },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

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
    async jwt({ token, account, profile }) {
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
            token.isStaff = (member.roles as string[]).includes(STAFF_ROLE_ID);
          } else {
            token.isStaff = false;
          }
        } catch {
          token.isStaff = false;
        }
      }

      if (account?.provider === "credentials") {
        token.provider = "credentials";
        token.isStaff = false;
        await sendLoginWebhook(token.name || "Usuário", token.email || "email", "credentials");
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).discordId = token.discordId;
        (session.user as Record<string, unknown>).username = token.username;
        (session.user as Record<string, unknown>).isStaff = token.isStaff;
        (session.user as Record<string, unknown>).provider = token.provider;
        (session.user as Record<string, unknown>).id = token.sub ?? token.discordId;
        if (token.image) session.user.image = token.image as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
};

export function isStaffMember(session: { user?: { isStaff?: boolean } } | null): boolean {
  return session?.user?.isStaff === true;
}
