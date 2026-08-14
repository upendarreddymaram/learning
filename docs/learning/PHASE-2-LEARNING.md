# Phase 2 Learning Guide — Redis Queue + Idempotency + State Machine

**Milestone:** Duplicate webhooks don't corrupt state. Tasks transition `CREATED → PARSING` asynchronously.

---

## What We Built

| Component | Path | What it does |
|-----------|------|--------------|
| Shared DB package | `packages/db/` | Schema, task repository, state machine |
| Orchestrator worker | `services/orchestrator/` | BullMQ worker processes webhook jobs |
| Idempotency | `services/orchestrator/src/idempotency.ts` | Redis `SET NX` deduplication |
| Job queue | `services/orchestrator/src/queue.ts` | BullMQ enqueue/dequeue |
| State machine | `packages/db/src/stateMachine.ts` | Guarded status transitions |
| Webhook (async) | `apps/api/src/routes/webhooks.ts` | Verify → dedupe → enqueue → 202 |

### New flow

```
ClickUp webhook → POST /webhooks/clickup
  → verify signature
  → Redis SET idempotency key NX (skip if duplicate → 200)
  → BullMQ enqueue job → 202 Accepted
  → Orchestrator worker picks up job
  → upsert task in PostgreSQL
  → transition CREATED → PARSING
  → insert state.transition event
  → Dashboard shows PARSING status
```

---

## How to Run (Phase 2)

```bash
# Terminal 0 — Infrastructure
docker compose up -d

# Terminal 1 — API
npm run dev:api

# Terminal 2 — Orchestrator worker (REQUIRED for webhooks)
npm run dev:orchestrator

# Terminal 3 — Dashboard
npm run dev:dashboard
```

Health check now includes Redis:
```bash
curl http://localhost:3002/health
# {"status":"ok","database":"connected","redis":"connected",...}
```

---

## Test Without ClickUp

### Simulate webhook (async — needs worker running)

```bash
# First delivery — queued
curl -X POST http://localhost:3002/webhooks/clickup/dev/simulate \
  -H "Content-Type: application/json" \
  -d '{"task_id":"sim-001","webhook_id":"wh-001","event":"taskCreated","title":"Implement auth middleware"}'

# Duplicate — rejected by idempotency
curl -X POST http://localhost:3002/webhooks/clickup/dev/simulate \
  -H "Content-Type: application/json" \
  -d '{"task_id":"sim-001","webhook_id":"wh-001","event":"taskCreated","title":"Implement auth middleware"}'
# → {"ok":true,"duplicate":true,"idempotencyKey":"webhook:wh-001"}
```

Wait 1–2 seconds, then check task status:
```bash
curl http://localhost:3002/api/tasks | python3 -m json.tool
# status should be "PARSING"
```

### Dev seed (sync — no worker needed)

```bash
curl -X POST http://localhost:3002/api/tasks/dev/seed \
  -H "Content-Type: application/json" \
  -d '{"clickupTaskId":"dev-003","title":"Add logging","description":"Structured JSON logs for all API routes"}'
# → status PARSING immediately
```

---

## Concepts for Interviews

### 1. Idempotency

**Definition:** An operation that produces the same result whether executed once or multiple times.

**Problem:** Webhook providers retry on timeout/5xx. Without idempotency, duplicate events corrupt state.

**Our solution:**
```redis
SET webhook:wh-001 1 NX EX 86400
→ OK     = first time, process it
→ null   = duplicate, return 200 and skip
```

**Why Redis not PostgreSQL:** `SET NX` is atomic and fast (~1ms). DB unique constraints alone don't prevent concurrent duplicate processing before either insert completes.

**30-second answer:** "We use Redis SET NX as an idempotency gate before enqueueing webhook jobs. Duplicate ClickUp deliveries get an immediate 200 without reprocessing. The key expires after 24 hours."

---

### 2. Message Queue (BullMQ + Redis)

**Definition:** A buffer between producers (webhook handler) and consumers (orchestrator worker) that decouples request acceptance from processing.

**Why we chose BullMQ:**
| BullMQ | Alternatives |
|--------|--------------|
| Redis-backed (already in stack) | SQS — requires AWS |
| Retries + backoff built-in | Raw Redis lists — no retry logic |
| Job deduplication via jobId | Kafka — overkill for Phase 2 |

**Trade-offs:**
- **Pros:** Fast webhook ACK; worker retries on failure; scales by adding workers
- **Cons:** Another process to run; at-least-once delivery (worker must be idempotent)

**Better approach later:** Phase 7 migrates to Kafka for replay and multiple consumers.

---

### 3. State Machine

**Definition:** A model where an entity exists in one of a finite set of states, with defined transitions between them.

**Our states (Phase 2 active):**
```
CREATED → PARSING → PLANNING → ... → DEPLOYED
          ↓
        FAILED / CANCELLED
```

**Implementation:** `canTransition(from, to)` guards every status change. Invalid transitions throw errors.

**Why:** Prevents bugs like jumping from CREATED directly to DEPLOYED. Every transition logged to `events` table for audit.

**Interview tip:** "State machines make invalid workflow states unrepresentable. We enforce transitions in code, not just in documentation."

---

### 4. At-Least-Once Delivery

**Definition:** A message queue guarantees a message is delivered one or more times, never zero times (unless TTL expires).

**Implication:** Workers must be **idempotent** — our `upsertTaskFromWebhook` uses `clickup_task_id` UNIQUE constraint + upsert logic.

**Failure scenario:** Worker crashes after DB write but before ACK. Job retries → upsert is safe, but state transition from PARSING→PARSING must be guarded (we check current status before transitioning).

---

## Break-It Wednesday (Phase 2)

1. **Fire 10 duplicate webhooks** — only 1 job processed, rest return `duplicate: true`
2. **Stop orchestrator worker** — webhooks queue but tasks stay absent until worker restarts
3. **Stop Redis** — health check shows `redis: disconnected`, webhooks return 500
4. **Invalid transition** — try to manually set task to DEPLOYED from CREATED in DB → next worker run should not corrupt (transitions are guarded)

---

## Architecture (Phase 2)

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│  ClickUp    │────▶│  API        │────▶│  Redis           │
│  webhook    │     │  (enqueue)  │     │  idempotency +   │
└─────────────┘     └─────────────┘     │  BullMQ queue    │
                           │            └────────┬─────────┘
                           │ 202 Accepted        │
                           ▼                     ▼
                    ┌─────────────┐     ┌──────────────────┐
                    │  Dashboard  │     │  Orchestrator    │
                    │  (read)     │     │  worker          │
                    └──────┬──────┘     └────────┬─────────┘
                           │                     │
                           └──────────┬──────────┘
                                      ▼
                              ┌──────────────┐
                              │  PostgreSQL  │
                              │  tasks+events│
                              └──────────────┘
```

---

## Key Files

1. `packages/db/src/stateMachine.ts` — transition rules
2. `services/orchestrator/src/idempotency.ts` — Redis dedup
3. `services/orchestrator/src/worker.ts` — job processor
4. `apps/api/src/routes/webhooks.ts` — async enqueue

---

## Reminder: EAOS Integration (Phase 4)

When we reach Phase 4, we'll revisit EAOS patterns for agent execution quality.

---

## Next: Phase 3

AI Planner service — `PARSING → PLANNING` with structured implementation plans from LLM.

Say **"start Phase 3"** when ready.
