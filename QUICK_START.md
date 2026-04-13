# 🚀 Quick Start - Sistema Discloud

## O que foi criado

Um sistema completo de dashboard para gerenciar bots hospedados na Discloud, com:

- ✅ Segurança máxima (API key nunca no frontend)
- ✅ Autenticação com NextAuth
- ✅ Autorização (só você acessa)
- ✅ Rate limiting
- ✅ Logs de auditoria
- ✅ UI moderna estilo Discord

## O que você precisa fazer

### 1. Adicionar sua API Key da Discloud

Edite o arquivo `.env.local` e adicione:

```bash
DISCLOUD_API_KEY=SUA_API_KEY_AQUI
```

### 2. Adicionar seu ID do Discord

No `.env.local`, adicione seu ID (para que só você acesse):

```bash
AUTHORIZED_USER_ID=SEU_ID_AQUI
```

**Como pegar o ID:**
1. Discord → Configurações → Avançado → Ativar "Modo Desenvolvedor"
2. Clique com botão direito no seu nome → Copiar ID

### 3. Criar a tabela no banco

Execute o script SQL em `prisma/seed-bots.sql` no seu banco de dados.

### 4. Acessar o dashboard

Vá para: `http://localhost:3001/discloud`

## Estrutura do sistema

```
/api/bots              - Listar e adicionar bots
/api/bots/:id          - Obter status
/api/bots/:id/start    - Iniciar bot
/api/bots/:id/stop     - Parar bot
/api/bots/:id/restart  - Reiniciar bot
```

## Arquivos criados

- `src/app/discloud/page.tsx` - Página do dashboard
- `src/components/dashboard/discloud-bots.tsx` - Componente principal
- `src/lib/discloud-api.ts` - Cliente da API da Discloud
- `src/lib/discloud-middleware.ts` - Middleware de segurança
- `src/middleware.ts` - Middleware de proteção
- `prisma/seed-bots.sql` - Script SQL para criar tabelas
- `DISCLOUD_SETUP.md` - Documentação completa
- `.env.example` - Exemplo de variáveis

---

**Pronto!** Agora você tem um sistema profissional e seguro. 🎉
