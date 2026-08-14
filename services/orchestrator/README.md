# Orchestrator Service

Node.js + TypeScript workflow engine with BullMQ worker.

## Implemented (Phase 2)

- BullMQ worker consuming `webhook-processing` queue
- Redis idempotency keys for duplicate webhook prevention
- State machine transitions (`CREATED → PARSING`)
- Shared task processing via `@orchestrator/db`

## Run

```bash
# From repo root (requires Redis via docker compose)
docker compose up -d
npm run dev:orchestrator
```

## Architecture

```
API enqueues job → Redis/BullMQ → Orchestrator worker
  → upsert task → transition state → log event
```

## Phase 3 (next)

- Call AI Planner after PARSING
- Transition PARSING → PLANNING
- Store implementation plan in DB
