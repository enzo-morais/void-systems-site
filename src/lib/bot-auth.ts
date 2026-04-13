/**
 * Verifica se o usuário tem acesso ao bot
 * O bot pode estar salvo com o userId do banco OU com o Discord ID
 */
export function userOwnsBot(bot: { userId: string }, session: any): boolean {
  const userId = session?.user?.id ?? session?.user?.discordId;
  const discordId = session?.user?.discordId;
  return bot.userId === userId || (discordId && bot.userId === discordId);
}
