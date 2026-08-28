# BarberPro — Plataforma SaaS para Barbearias

Plataforma completa para gestão de barbearias com três painéis de acesso (Administrador, Barbeiro e Cliente), agendamento online e pagamentos integrados via **Mercado Pago** (Pix, cartão de crédito e boleto).

## ✨ Funcionalidades

- **Painel do Administrador**: gerencia barbearias cadastradas (ativar/suspender), planos de assinatura vendidos às barbearias e histórico de pagamentos/receita da plataforma.
- **Painel do Barbeiro**: perfil público da barbearia, cadastro de serviços e preços, horários de funcionamento, agenda de atendimentos e assinatura de plano (pagamento de acesso à plataforma).
- **Painel do Cliente**: busca de barbearias, agendamento online de horários disponíveis, pagamento do serviço e histórico de agendamentos.
- **Pagamentos com Mercado Pago**: cobrança da assinatura das barbearias e cobrança dos agendamentos dos clientes, com suporte a Pix, cartão de crédito e boleto via Checkout Pro, incluindo webhook para atualização automática de status.
- **Autenticação baseada em papéis** (NextAuth + JWT) com proteção de rotas por middleware.
- Design moderno, responsivo, com tema escuro.

## 🧱 Stack técnica

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma ORM 7](https://www.prisma.io/) + PostgreSQL (driver adapter `@prisma/adapter-pg`)
- [NextAuth.js](https://next-auth.js.org/) (Credentials Provider)
- [Mercado Pago SDK](https://github.com/mercadopago/sdk-nodejs) (Checkout Pro)
- [Zod](https://zod.dev/) para validação
- [Lucide Icons](https://lucide.dev/)
- Fontes auto-hospedadas via `@fontsource` (sem dependência do CDN do Google)

## 🚀 Como rodar localmente

### 1. Pré-requisitos

- Node.js 18+
- Um banco de dados PostgreSQL (local, [Neon](https://neon.tech), [Supabase](https://supabase.com) ou [Railway](https://railway.app) funcionam bem de graça)
- Uma conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel) para obter as chaves de teste (sandbox)

### 2. Instalação

```bash
npm install
cp .env.example .env
```

Edite o arquivo `.env` e preencha:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/barbershop?schema=public"
NEXTAUTH_SECRET="rode: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
MERCADOPAGO_ACCESS_TOKEN="TEST-xxxxxxxx"
MERCADOPAGO_PUBLIC_KEY="TEST-xxxxxxxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@barberpro.com.br"
ADMIN_PASSWORD="Admin@123"
```

> Sem as chaves do Mercado Pago configuradas, a plataforma funciona normalmente, porém os botões de pagamento mostram um aviso de "modo demonstração" em vez de redirecionar para o checkout real.

> A URL do banco fica no `.env` e é lida pelo `prisma.config.ts` (padrão do Prisma 7 — a URL não fica mais dentro do `schema.prisma`).

### 3. Banco de dados

```bash
npm run db:push   # cria as tabelas no banco a partir do schema.prisma
npm run db:seed   # cria o admin, planos padrão e uma barbearia + cliente de demonstração
```

Se por algum motivo você não conseguir rodar o `db:push` (rede bloqueada, por exemplo), dá para criar as tabelas direto pelo SQL equivalente que já vem no projeto:

```bash
psql "$DATABASE_URL" -f prisma/init.sql
npm run db:seed
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Contas de demonstração criadas pelo seed

| Papel     | Email                     | Senha       |
|-----------|----------------------------|-------------|
| Admin     | admin@barberpro.com.br     | Admin@123   |
| Barbeiro  | barbeiro@demo.com          | Demo@123    |
| Cliente   | cliente@demo.com           | Demo@123    |

## 💳 Configurando o Mercado Pago

1. Crie uma conta em [mercadopago.com.br](https://www.mercadopago.com.br) e acesse o [painel de desenvolvedores](https://www.mercadopago.com.br/developers/panel/app).
2. Copie o **Access Token** e a **Public Key** de teste (ou produção, quando estiver pronto para cobrar de verdade).
3. Configure a URL de notificação (webhook) apontando para `https://SEU_DOMINIO/api/payments/webhook` no painel do Mercado Pago, ou deixe que o próprio checkout envie automaticamente (já configurado via `notification_url` na criação da preferência).
4. Métodos de pagamento habilitados por padrão pelo Checkout Pro: **Pix, cartão de crédito, cartão de débito e boleto**.

## 🌐 Deploy

O projeto está pronto para deploy na [Vercel](https://vercel.com/):

1. Suba o repositório para o GitHub (já feito ✅).
2. Importe o projeto na Vercel.
3. Configure as mesmas variáveis de ambiente do `.env` no painel da Vercel.
4. Use um banco PostgreSQL gerenciado (Neon, Supabase, Railway, RDS etc.) — bancos SQLite locais não funcionam em ambiente serverless.
5. Após o primeiro deploy, rode `npx prisma db push` e `npm run db:seed` apontando para o banco de produção (ou configure um passo de build/CI para isso).

## 📁 Estrutura do projeto

```
src/
  app/
    (site público)         → landing page, /barbearias, /login, /registro
    admin/                 → painel do administrador
    barbeiro/               → painel do barbeiro (perfil, serviços, horários, agenda, assinatura)
    cliente/                → painel do cliente (buscar barbearia, agendamentos, perfil)
    api/                    → rotas de API (auth, agendamentos, pagamentos, webhook, admin)
  components/                → componentes de UI reutilizáveis
  lib/                       → prisma client, auth (NextAuth), mercado pago, utils
  generated/prisma           → Prisma Client gerado (criado por `prisma generate`)
prisma/
  schema.prisma              → modelo de dados
  seed.ts                    → dados de demonstração
  init.sql                   → schema em SQL puro (alternativa ao `db:push`)
prisma.config.ts             → configuração da CLI do Prisma (URL do banco)
```

## ✅ Testes end-to-end

O projeto foi validado com um roteiro automatizado no navegador (Playwright) cobrindo: landing page e planos vindos do banco, página pública da barbearia, login e navegação dos três painéis, cálculo de horários disponíveis, agendamento completo do cliente, aparição do agendamento na agenda do barbeiro, cadastro de nova barbearia e bloqueio de rotas por papel.

## 🔒 Segurança

- Senhas armazenadas com hash `bcrypt`.
- Sessões JWT via NextAuth, com o papel (`role`) do usuário embutido no token.
- Middleware (`src/middleware.ts`) protege as rotas `/admin`, `/barbeiro` e `/cliente` por papel.
- Toda comunicação de pagamento acontece no lado do servidor — as chaves do Mercado Pago nunca são expostas ao navegador.

---

Feito com Next.js, Tailwind CSS e Mercado Pago. 💈
