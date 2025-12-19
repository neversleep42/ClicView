# SupportAI (ClicView)

SupportAI is an AI-assisted customer support workspace built with Next.js and Supabase. It manages tickets, customers, AI drafts, templates, notifications, and analytics with realtime updates.

## Docs

- Product overview (features + AI behavior): `docs/product_overview.md`

## Tech stack

- Next.js (App Router)
- Supabase (Postgres, Auth, Realtime, Edge Functions)
- React Query for data fetching
- Tailwind CSS

## Key features

- Ticket inbox with filters, search, cursor pagination, and soft-archive
- Message thread per ticket (customer + agent) and reply workflow
- AI draft pipeline with safety rules and optional auto-reply
- Customers CRUD and templates management
- Notifications and analytics dashboards
- Auth gating via Supabase

## Local setup

1) Install dependencies:

```bash
npm install
```

2) Create `.env.local` with the following keys:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only (required for Edge Function / admin tasks)
SUPABASE_SERVICE_ROLE_KEY=

# Gemini (optional, enables real AI output)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

3) Run Supabase (local) or connect to a hosted project.

### Local Supabase

```bash
supabase start
supabase db reset
```

This applies migrations under `supabase/migrations` and seeds demo data.

### Hosted Supabase

```bash
supabase db push
supabase functions deploy ai-worker
supabase secrets set \
  SUPABASE_URL=... \
  SUPABASE_ANON_KEY=... \
  SUPABASE_SERVICE_ROLE_KEY=... \
  GEMINI_API_KEY=... \
  GEMINI_MODEL=gemini-2.5-flash
```

## Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## Notes

- The UI is protected by Supabase auth and will redirect to `/login` if unauthenticated.
- Realtime subscriptions are enabled for tickets, ai_runs, ticket_messages, and notifications.
- If AI is disabled in settings, runs are not enqueued and aiStatus stays null.

## Repo structure

- `src/app` - Next.js pages and API routes
- `src/components` - UI components
- `src/hooks` - React Query hooks
- `src/lib` - API client, contracts, Supabase helpers
- `supabase/migrations` - DB schema + RLS + seed logic
- `supabase/functions/ai-worker` - AI worker (Gemini + fallback)
