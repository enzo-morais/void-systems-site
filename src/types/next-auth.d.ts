import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      discordId?: string;
      username?: string;
      isStaff?: boolean;
      provider?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId?: string;
    username?: string;
    isStaff?: boolean;
    provider?: string;
    accessToken?: string;
    image?: string;
    isClient?: boolean;
    /** Quando os cargos do Discord foram conferidos pela última vez / com sucesso (ms). */
    rolesCheckedAt?: number;
    rolesOkAt?: number;
  }
}
