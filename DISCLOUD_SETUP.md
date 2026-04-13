# 🚀 Setup do Sistema Discloud

## ⚠️ IMPORTANTE - LEIA PRIMEIRO

Este sistema é **seguro e projetado para múltiplos clientes**, mas foi configurado para **apenas você acessar** (proteção por ID de usuário).

## 🔐 Segurança Implementada

- ✅ API Key da Discloud **NUNCA** aparece no frontend
- ✅ Autenticação com NextAuth
- ✅ Autorização: cada usuário só acessa seus próprios bots
- ✅ Rate limiting (5 ações por minuto por bot)
- ✅ Sanitização de entradas
- ✅ Logs de auditoria
- ✅ Middleware de proteção

## 📋 Passo a Passo

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e preencha:

```bash
# Discloud API (NUNCA compartilhe!)
DISCLOUD_API_KEY=SUA_API_KEY_DA_DISCLOUD
DISCLOUD_API_URL=https://api.discloud.app

# ID do usuário autorizado (apenas você pode acessar)
# Pega o ID do Discord: Clique com botão direito no seu nome → Copiar ID (ativar modo desenvolvedor)
AUTHORIZED_USER_ID=SEU_DISCORD_USER_ID_AQUI

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=5
```

### 2. Criar Tabela no Banco de Dados

Execute o script SQL em `prisma/seed-bots.sql` no seu banco de dados PostgreSQL.

**Ou use o Prisma:**
```bash
npx prisma migrate dev --name add_discloud_bots
```

### 3. Acessar o Dashboard

Vá para: `http://localhost:3001/discloud`

## 🛠️ Endpoints da API

### Listar Bots
```
GET /api/bots
```

### Adicionar Bot
```
POST /api/bots
Body: { "discloudAppId": "...", "name": "..." }
```

### Obter Status
```
GET /api/bots/:id
```

### Iniciar Bot
```
POST /api/bots/:id/start
```

### Parar Bot
```
POST /api/bots/:id/stop
```

### Reiniciar Bot
```
POST /api/bots/:id/restart
```

## 📁 Estrutura de Arquivos

```
void-systems/
├── src/
│   ├── app/
│   │   └── discloud/
│   │       └── page.tsx          # Página do dashboard
│   ├── components/
│   │   └── dashboard/
│   │       └── discloud-bots.tsx # Componente principal
│   ├── lib/
│   │   ├── discloud-api.ts       # Cliente da API da Discloud
│   │   └── discloud-middleware.ts # Middleware de segurança
│   └── middleware.ts             # Middleware de proteção
├── prisma/
│   ├── schema.prisma             # Schema atualizado
│   ├── seed-bots.sql             # Script SQL para criar tabelas
│   └── .env.example              # Exemplo de variáveis
```

## 🔧 Como obter o ID do Discord

1. Abra o Discord
2. Vá em Configurações → Avançado → Ativar "Modo Desenvolvedor"
3. Clique com botão direito no seu nome → Copiar ID

## ⚠️ Avisos de Segurança

- **NUNCA** compartilhe sua `DISCLOUD_API_KEY`
- **NUNCA** commit o arquivo `.env.local`
- O arquivo `.gitignore` já deve estar configurado para ignorar `.env.local`
- Apenas o usuário com o `AUTHORIZED_USER_ID` pode acessar o dashboard

## 🐛 Troubleshooting

### Erro: "DISCLOUD_API_KEY não configurada"
- Verifique se o arquivo `.env.local` existe e está preenchido
- Reinicie o servidor Next.js

### Erro: "Acesso negado"
- Verifique se o `AUTHORIZED_USER_ID` está correto no `.env.local`
- Verifique se está autenticado

### Erro: "Bot não encontrado"
- Verifique se o bot existe no banco de dados
- Verifique se o bot pertence ao usuário autenticado

---

**Pronto!** Agora você tem um sistema seguro e profissional para gerenciar seus bots na Discloud. 🎉
