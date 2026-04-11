const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const GUILD_ID = process.env.DISCORD_GUILD_ID!;
const STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID!;

export interface DiscordMember {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
}

export async function getStaffMembers(): Promise<DiscordMember[]> {
  const members: DiscordMember[] = [];
  let after = "";

  for (let i = 0; i < 10; i++) {
    const url = `https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=1000${after ? `&after=${after}` : ""}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Discord API error:", res.status, await res.text());
      break;
    }

    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    for (const m of batch) {
      if (m.roles?.includes(STAFF_ROLE_ID)) {
        const user = m.user;
        members.push({
          id: user.id,
          username: user.username,
          displayName: m.nick || user.global_name || user.username,
          avatar: user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
            : null,
        });
      }
    }

    after = batch[batch.length - 1].user.id;
    if (batch.length < 1000) break;
  }

  return members;
}
