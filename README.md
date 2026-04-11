# VØID Systems

Site + painel staff para loja de bots Discord. Next.js, TypeScript, Tailwind CSS, Prisma + PostgreSQL, NextAuth com Discord OAuth2.

## Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente (ou remoto)

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/void_systems?schema=public"
DISCORD_CLIENT_ID="seu_client_id"
DISCORD_CLIENT_SECRET="seu_client_secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere_com_openssl_rand_base64_32"
```

### 3. Configurar Discord OAuth2

1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação
3. Vá em **OAuth2** > **General**
4. Copie o **Client ID** e **Client Secret** para o `.env`
5. Adicione a redirect URI: `http://localhost:3001/api/auth/callback/discord`

### 4. Configurar banco de dados

```bash
npx prisma migrate dev --name init
```

### 5. Configurar staff autorizado

Edite `src/lib/auth-options.ts` e adicione os IDs do Discord dos membros da equipe no array `ALLOWED_STAFF_IDS`.

> Se o array estiver vazio, todos os usuários logados terão acesso (modo dev).

### 6. Rodar o projeto

```bash
npm run dev
```

Acesse: [http://localhost:3001](http://localhost:3001)

## Estrutura

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth
│   │   └── sales/                # CRUD vendas
│   ├── dashboard/                # Painel staff (protegido)
│   ├── login/                    # Login Discord
│   └── page.tsx                  # Landing page
├── components/
│   ├── dashboard/                # Componentes do painel
│   └── providers.tsx             # SessionProvider
├── lib/
│   ├── auth-options.ts           # Config NextAuth + staff IDs
│   └── prisma.ts                 # Cliente Prisma
└── types/
    └── next-auth.d.ts            # Tipagem NextAuth
```
