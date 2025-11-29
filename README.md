# Minha Agenda Bio

Sistema SaaS completo de agendamento para negócios de beleza.

## Stack Tecnológica

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS, Shadcn/UI
- **Backend**: Next.js API Routes + Server Actions
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Realtime**: Supabase Realtime
- **Email**: Resend
- **WhatsApp**: Evolution API

## Funcionalidades

- Multi-tenant (cada negócio com ambiente isolado)
- White-label 100% personalizável (logo, cores, domínio)
- Link único tipo Linktree focado em agendamento
- Sistema multi-horários e multi-funcionários
- Gestão de serviços, funcionários e clientes
- Notificações automáticas (Email e WhatsApp)
- Dashboard com analytics e métricas
- Controle financeiro com relatórios exportáveis

## Primeiros Passos

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend (Email)
RESEND_API_KEY=your_resend_api_key

# Evolution API (WhatsApp)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your_evolution_api_key
EVOLUTION_INSTANCE_NAME=minha-agenda-bio

# Cron (opcional - para lembretes automáticos)
CRON_SECRET=your_cron_secret
```

### 3. Configurar o banco de dados

Execute as migrations no Supabase SQL Editor:

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Execute os arquivos em ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`

### 4. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
app/
├── (auth)/           # Páginas de autenticação
├── dashboard/        # Painel administrativo
├── b/[slug]/         # Página pública de agendamento
├── api/
│   ├── webhooks/     # Webhooks (Evolution API)
│   ├── cron/         # Tarefas agendadas
│   └── export/       # Exportação de dados
components/
├── ui/               # Componentes Shadcn
├── dashboard/        # Componentes do dashboard
lib/
├── supabase/         # Configuração Supabase
├── actions/          # Server Actions
├── services/         # Lógica de negócio
├── validations/      # Schemas Zod
├── utils/            # Utilitários
types/                # TypeScript types
supabase/
└── migrations/       # SQL migrations
```

## Configurando WhatsApp (Evolution API)

1. Instale a Evolution API: https://doc.evolution-api.com
2. Configure a instância no `.env.local`
3. Conecte seu WhatsApp escaneando o QR Code

## Configurando Lembretes Automáticos

Para habilitar lembretes automáticos (24h e 1h antes do agendamento):

### Vercel Cron

Adicione ao `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "0 * * * *"
  }]
}
```

### Alternativa: Serviço externo

Use um serviço como Upstash, Cron-job.org ou similar para chamar:
- `GET /api/cron/reminders`
- Header: `Authorization: Bearer {CRON_SECRET}`
- Frequência: A cada hora

## Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy!

### Outras plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js 14.

## Licença

Proprietary - All rights reserved.
