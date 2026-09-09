# Personalized AI Manager

Real Next.js / TypeScript / Postgres implementation, replacing the single-file
React prototype. Architecture matches `docs/architecture.md`-style layering:

```
UI (app/) -> API routes (app/api/) -> services (lib/services/) ->
repositories (lib/repositories/) -> Prisma -> Postgres
```

The AI layer is isolated the same way:

```
AI Manager UI -> /api/ai/chat -> ai-manager-service -> context-builder
                                                     -> ClaudeProvider (implements LLMProvider)
```

## This was built without a live dev environment

This codebase was generated in a sandboxed session with no network access,
so `npm install` was never run here and the dev server has never actually
booted. Everything has been checked as carefully as static analysis allows
(TypeScript syntax, consistent imports, schema/service/route alignment), but
**you are the first one to actually run it.** Expect to fix a handful of
small issues on first boot — that's normal for a from-scratch scaffold, not
a sign something is fundamentally wrong.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start Postgres** (Docker is the fastest path if you don't have one):
   ```bash
   docker run --name ai-manager-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ai_manager -p 5432:5432 -d postgres:16
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env: set DATABASE_URL, NEXTAUTH_SECRET (openssl rand -base64 32),
   # and ANTHROPIC_API_KEY (get one at console.anthropic.com)
   ```

4. **Run migrations and seed demo data**
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

5. **Start the dev server**
   ```bash
   npm run dev
   ```
   Then sign in with the seeded account: `amara@example.com` / `password123`
   (there's no sign-in UI yet — see "What's stubbed" below).

## What's fully real in this scaffold

- **Goals**: schema → repository → service → API routes (`GET /api/goals`,
  `GET /api/goals/[goalId]`, `PATCH /api/goals/[goalId]/tasks/[taskId]`) →
  a real client page with optimistic updates and rollback on failure.
- **Home**: a real Server Component querying Postgres directly (career,
  latest learning progress, active goal) — no mock data.
- **AI Manager**: a real call to the Claude API server-side
  (`lib/ai/claude-provider.ts`), with:
  - A context builder that respects the AI memory permissions in
    `UserPreference` — turning off "let AI use my goals" server-side
    actually removes that data from the prompt, not just the UI.
  - Conversation and message persistence (`AIConversation`/`AIMessage`),
    so chat history survives a refresh instead of living only in React state.
  - A real Recommendation → Confirmation → Execution flow: `/api/ai/chat`
    only ever proposes an action; `/api/ai/actions` is a *separate* endpoint
    that only runs when the user taps the button, and it's idempotent
    (checks `actionExecutedAt` before running).
- **Auth**: NextAuth with a credentials provider and bcrypt password
  hashing, wired to the same Prisma models.

## What's intentionally stubbed or missing

- **No sign-up/sign-in UI** — `/onboarding` is an empty route folder.
  Wire a form to NextAuth's `signIn("credentials", ...)`.
- **Learn, Career, Opportunities, Profile, Community, Discover, News**
  pages don't exist yet as UI, though several (Career, Opportunities) have
  a matching Prisma model already. Follow the Goals vertical as the
  pattern: repository → service → route → page.
- **No real opportunity/news integrations** — the `sourceLabel` field on
  `Opportunity` exists specifically so the UI can keep showing
  "Demo data — no live source connected" until a real one is wired in.
- **Notification preferences are stored but nothing sends notifications** —
  there's no cron/queue/push setup yet.

## A note on where to actually run this

This environment can write files but can't install npm packages or run a
dev server (no network access). To actually get this running, use:
- **Claude Code**, which has a real terminal with network access, or
- Your own machine with Node 18+ and Docker (or a hosted Postgres like
  Neon/Supabase) installed.
