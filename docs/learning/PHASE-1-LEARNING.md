# Phase 1 Learning Guide — ClickUp → PostgreSQL → Dashboard

This document is your **learn-while-building** companion for Phase 0 and Phase 1. Read each section as you implement, use the interview definitions in conversations, and refer back when preparing for FDE interviews.

---

## What We Built (Phase 0 + Phase 1)

| Component | Path | What it does |
|-----------|------|--------------|
| Shared types | `packages/types/` | Task, TaskStatus, webhook payload types — single source of truth |
| Config | `packages/config/` | Loads `.env`, validates with Zod |
| ClickUp client | `packages/clients/` | Fetches task details; verifies webhook HMAC signatures |
| API server | `apps/api/` | Express webhook gateway + REST endpoints + Drizzle ORM |
| Dashboard | `apps/dashboard/` | Next.js task list and detail with event timeline |
| Database | PostgreSQL via Docker | `organizations`, `repositories`, `tasks`, `events` tables |
| Docs | `docs/fde/`, `docs/adr/`, `docs/interview/` | FDE definition, ADR-001, interview cards |

### End-to-end flow (Phase 1)

```
1. ClickUp fires webhook when task is created/updated
2. POST /webhooks/clickup receives payload
3. API verifies X-Signature (HMAC-SHA256)
4. API fetches full task from ClickUp REST API
5. Task upserted into PostgreSQL (status: CREATED)
6. Event row inserted into events table (audit log)
7. Dashboard fetches GET /api/tasks and displays tasks
8. Click task → GET /api/tasks/:id shows detail + event timeline
```

---

## How to Run

### Prerequisites

- Node.js 20+
- Docker Desktop

### Step 1 — Start infrastructure

```bash
docker compose up -d
```

Starts PostgreSQL (`localhost:5432`) and Redis (`localhost:6379`).

### Step 2 — Configure environment

```bash
cp .env.example .env
# Optional for real ClickUp integration:
# CLICKUP_WEBHOOK_SECRET=your_webhook_secret
# CLICKUP_API_TOKEN=your_api_token
```

### Step 3 — Install and migrate

```bash
npm install
npm run db:generate -w @orchestrator/api
npm run db:migrate -w @orchestrator/api
```

### Step 4 — Start services (two terminals)

```bash
# Terminal 1 — API on :3000
npm run dev:api

# Terminal 2 — Dashboard on :3001
npm run dev:dashboard
```

### Step 5 — Verify

```bash
# Health check
curl http://localhost:3000/health

# Seed a dev task (no ClickUp needed)
curl -X POST http://localhost:3000/api/tasks/dev/seed \
  -H "Content-Type: application/json" \
  -d '{"clickupTaskId":"dev-001","title":"Add rate limiting to API","description":"Implement per-API-key rate limiting on public REST endpoints"}'

# List tasks
curl http://localhost:3000/api/tasks
```

Open http://localhost:3001/tasks — you should see the seeded task.

### ClickUp webhook setup (optional)

1. Install [ngrok](https://ngrok.com): `ngrok http 3000`
2. In ClickUp → Settings → Integrations → Webhooks → create webhook
3. URL: `https://<ngrok-id>.ngrok.io/webhooks/clickup`
4. Events: `taskCreated`, `taskUpdated`
5. Copy webhook secret to `.env` as `CLICKUP_WEBHOOK_SECRET`
6. Add `CLICKUP_API_TOKEN` (Settings → Apps → generate token)

---

## Concepts for Interviews

### 1. Webhook

**Definition:** An HTTP callback where a server (ClickUp) sends a POST request to your URL when an event occurs, instead of you polling for changes.

**Problem it solves:** Polling wastes resources and adds latency. Webhooks push events in real time.

**How it works in this project:** ClickUp POSTs JSON to `/webhooks/clickup`. We verify the signature, extract `task_id`, enrich with ClickUp API data, and persist.

**Why we chose it:** ClickUp is the source of truth for engineering tickets. Webhooks are the standard integration pattern for SaaS work management tools.

**Trade-offs:**

| Pros | Cons |
|------|------|
| Real-time, efficient | Your endpoint must be publicly reachable (ngrok in dev) |
| Industry standard | Duplicate deliveries possible — need idempotency (Phase 2) |
| Decouples systems | Debugging is harder than synchronous API calls |

**Failure scenario:** ClickUp retries failed webhooks. Without idempotency, duplicate events create duplicate tasks. **Phase 2 fix:** Redis idempotency keys.

**Better approach later:** Phase 2 adds Redis queue so webhook handler returns 200 immediately and processing happens async. Phase 7 adds Kafka for replay and multiple consumers.

**30-second interview answer:**

> "We use webhooks to ingest ClickUp task events in real time. ClickUp POSTs to our gateway, we verify the HMAC signature, fetch full task details from their API, and persist to PostgreSQL. In Phase 2 we'll add idempotency keys in Redis because webhooks can be delivered more than once."

---

### 2. PostgreSQL

**Definition:** A relational, ACID-compliant open-source database. Data is stored in tables with typed columns, primary keys, and foreign key relationships.

**Problem it solves:** We need durable storage for tasks, organizations, and an audit event log with queryable relationships.

**How it works in this project:**

```
organizations ──< repositories
organizations ──< tasks ──< events
```

- `tasks.clickup_task_id` is UNIQUE — one row per ClickUp task
- `events` table is append-only audit log
- Drizzle ORM maps TypeScript types to SQL

**Why we chose it:**

| Alternative | Why not (Phase 1) |
|-------------|-------------------|
| MongoDB | Task relationships (org → repo → task → events) are relational; joins are natural |
| SQLite | Fine for solo dev but PostgreSQL matches production FDE stack |
| Redis only | Redis is in-memory/cache — not durable primary storage |

**Trade-offs:**

| Pros | Cons |
|------|------|
| ACID transactions | Requires schema migrations |
| Rich querying (JOIN, aggregate) | Operational overhead vs SQLite |
| Industry standard for FDE roles | Vertical scaling limits (addressed later with read replicas) |

**Failure scenario:** Database connection pool exhausted under webhook burst. Mitigation: connection pooling (postgres.js `max: 10`), async queue in Phase 2.

**Better approach later:** Read replicas for dashboard queries (Phase 10+). Event sourcing pattern with Kafka as source of truth (Phase 7).

---

### 3. Drizzle ORM

**Definition:** A TypeScript-first ORM that maps database tables to TypeScript types with SQL-like query syntax.

**Problem it solves:** Raw SQL is error-prone and untyped. Drizzle gives compile-time type safety without heavy abstraction.

**Why we chose it over Prisma:**

| Drizzle | Prisma |
|---------|--------|
| Lightweight, SQL-like | Heavier runtime, own query engine |
| Schema in TypeScript | Schema in `.prisma` DSL |
| Easy migrations with drizzle-kit | Excellent DX but more magic |

For a learning project where you want to **see the SQL**, Drizzle is better.

**Trade-off:** Less ecosystem tooling than Prisma; more manual for complex relations.

---

### 4. Monorepo (npm workspaces)

**Definition:** Multiple packages/apps in one repository, sharing dependencies and types.

**Why we use it:** `@orchestrator/types` is imported by both API and dashboard — prevents type drift where API returns `{ status: "created" }` but dashboard expects `{ status: "CREATED" }`.

**Structure:**

```
packages/types     → shared enums and interfaces
packages/config    → env validation
packages/clients   → ClickUp API client
apps/api           → Express server
apps/dashboard     → Next.js UI
```

See [ADR-001](../adr/001-monorepo-structure.md).

**Better approach later:** Add Turborepo for cached builds when we have 10+ packages (Phase 7).

---

### 5. Express.js

**Definition:** Minimal Node.js web framework for HTTP APIs.

**Why we chose it:** Fastest path to a working webhook endpoint. Familiar, huge ecosystem.

**Trade-offs:**

| Express | Fastify (alternative) |
|---------|----------------------|
| Simpler, more tutorials | 2x faster, built-in schema validation |
| Middleware ecosystem | Less familiar to beginners |

**Better approach later:** Consider Fastify in Phase 2 when we add more routes and need performance. For Phase 1, Express is the right choice.

---

### 6. Next.js (App Router)

**Definition:** React framework with server-side rendering, file-based routing, and API routes.

**Why we chose it:** Server Components fetch data on the server — dashboard reads from API without exposing internal URLs to the browser for sensitive ops.

**Phase 1 pages:**

| Route | Type | Data source |
|-------|------|-------------|
| `/tasks` | Server Component | `GET /api/tasks` |
| `/tasks/[id]` | Server Component | `GET /api/tasks/:id` |

**Better approach later:** Add client-side polling or WebSockets for live task updates (Phase 7 with Kafka consumer pushing to dashboard).

---

### 7. Zod (environment validation)

**Definition:** TypeScript schema validation library. Parses and validates data at runtime.

**Why we use it:** `DATABASE_URL` missing → app fails at startup with a clear error, not a cryptic connection failure mid-request.

```typescript
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PORT: z.coerce.number().default(3000),
});
```

**Interview tip:** "Fail fast at boot" is a production pattern — misconfiguration should never reach production silently.

---

### 8. HMAC Signature Verification

**Definition:** Hash-based Message Authentication Code — proves the webhook payload came from ClickUp and wasn't tampered with.

**How it works:**

```
expected = HMAC-SHA256(webhook_secret, raw_request_body)
compare timing-safe(expected, X-Signature header)
```

**Why timing-safe compare:** Regular string comparison can leak timing information — attackers could forge signatures byte-by-byte.

**Phase 1 behavior:** If `CLICKUP_WEBHOOK_SECRET` is empty, verification is skipped in development only.

---

## Project Architecture (Phase 1)

```
learning/
├── apps/
│   ├── api/                 ← Express + Drizzle + webhooks
│   └── dashboard/           ← Next.js task UI
├── packages/
│   ├── types/               ← Shared TypeScript types
│   ├── config/              ← Env loading + Zod
│   └── clients/             ← ClickUp API + signature verify
├── docs/
│   ├── learning/            ← This file
│   ├── fde/                 ← FDE definition
│   ├── adr/                 ← Architecture decisions
│   └── interview/           ← Interview cards
└── docker-compose.yml       ← PostgreSQL + Redis
```

---

## What's NOT Built Yet (Coming Phases)

| Feature | Phase | Why deferred |
|---------|-------|--------------|
| Idempotent webhooks | 2 | Need Redis queue first |
| State machine transitions | 2 | Orchestrator service extraction |
| AI plan generation | 3 | Need stable task ingestion first |
| Agent execution | 4–5 | EAOS-style multi-agent (reminder set for Phase 4) |
| GitHub PR automation | 5 | Needs agent layer |
| Kafka events | 7 | Overkill until multiple consumers exist |
| Auth / RBAC | 11 | Local dev first |

---

## Break-It Wednesday (Phase 1 Exercises)

Try these deliberately to learn failure modes:

1. **Stop PostgreSQL** (`docker compose stop postgres`) → hit `/health` → see degraded response
2. **Send webhook without signature** → get 401
3. **Send payload without `task_id`** → get 400
4. **Seed same `clickupTaskId` twice** → notice upsert behavior (Phase 2 will add proper idempotency)
5. **Stop API, open dashboard** → see friendly error message

Document what you observe — these become incident postmortems and interview stories.

---

## Interview Cards to Write This Phase

- [x] [FDE Definition](../interview/fde-definition.md)
- [ ] Webhooks — use section 1 above
- [ ] PostgreSQL + Drizzle — use section 2 above
- [ ] Monorepo — use section 4 above

Template: [interview-card-template.md](../interview/interview-card-template.md)

---

## Key Files to Read in Order

1. `packages/types/src/index.ts` — domain model
2. `apps/api/src/db/schema.ts` — database tables
3. `apps/api/src/routes/webhooks.ts` — webhook entry point
4. `apps/api/src/services/taskService.ts` — business logic
5. `apps/dashboard/app/tasks/page.tsx` — UI consumption

---

## Reminder: EAOS Integration (Phase 4)

When we reach Phase 4 (Agent Gateway), revisit the EAOS comparison discussion. EAOS patterns to adopt:

- Maker ≠ checker (independent verifier)
- Evidence-mandatory Definition of Done
- Playbook routing by ticket type

Do not rebuild EAOS in Phase 1 — the platform skeleton comes first.

---

## Next Steps (Phase 2 Preview)

1. Extract `services/orchestrator/` from API
2. Add BullMQ job queue on Redis
3. Idempotency keys: `SET webhook:{event_id} NX EX 86400`
4. State transitions: `CREATED → PARSING`

When you're ready, say "start Phase 2" and we'll implement it with another learning guide.
