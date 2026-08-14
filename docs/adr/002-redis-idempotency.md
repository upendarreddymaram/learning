# ADR-002: Redis Idempotency and Async Job Queue

**Status:** Accepted  
**Date:** 2026-08-14  
**Phase:** 2

## Context

ClickUp (and most webhook providers) retry failed deliveries and may send duplicate events. In Phase 1, each webhook was processed synchronously in the HTTP handler — duplicates could create redundant database writes and race conditions under concurrent delivery.

## Decision

1. **Idempotency keys in Redis** — `SET webhook:{key} NX EX 86400` before enqueueing. Duplicate webhooks return `200 { duplicate: true }` without reprocessing.

2. **BullMQ job queue** — Webhook handler returns `202 Accepted` immediately after enqueueing. A separate orchestrator worker processes jobs asynchronously.

3. **State machine** — After processing, tasks transition `CREATED → PARSING` with guarded transitions logged to the `events` table.

4. **Idempotency key derivation:**
   - Primary: `webhook:{webhook_id}` from ClickUp payload
   - Fallback: `webhook:{task_id}:{hash}` from task_id + event + history_item id

## Rationale

| Alternative | Why not |
|-------------|---------|
| DB unique constraint on webhook_id | Requires schema change; doesn't prevent concurrent duplicate processing before insert |
| Process synchronously + dedupe in SQL | Blocks HTTP response; slow ClickUp API fetch delays webhook ACK |
| Kafka (Phase 7) | Overkill before multiple consumers exist; Redis + BullMQ is simpler for Phase 2 |

## Consequences

- **Positive:** Duplicate webhooks are harmless; API responds fast; worker retries on failure (3 attempts, exponential backoff)
- **Positive:** State transitions are auditable via `state.transition` events
- **Negative:** Requires Redis running; requires orchestrator worker process in addition to API
- **Negative:** At-least-once delivery — worker must be idempotent (upsert, not blind insert)

## References

- Phase 2 implementation: `services/orchestrator/`, `packages/db/src/stateMachine.ts`
- BullMQ docs: https://docs.bullmq.io/
