# API (Webhook Gateway + Dashboard APIs)

Node.js + TypeScript + Express + Drizzle ORM + PostgreSQL + Redis queue.

## Implemented

### Phase 1
- Task REST APIs, health check, dev seed

### Phase 2
- Async webhook processing via BullMQ queue
- Redis idempotency for duplicate webhooks
- Dev webhook simulator: `POST /webhooks/clickup/dev/simulate`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Liveness + DB + Redis |
| `/webhooks/clickup` | POST | Verify, dedupe, enqueue (202) |
| `/webhooks/clickup/dev/simulate` | POST | Dev-only webhook simulator |
| `/api/tasks` | GET | List tasks |
| `/api/tasks/:id` | GET | Task detail + events |
| `/api/tasks/dev/seed` | POST | Dev-only seed |

## Run

```bash
docker compose up -d
npm run db:migrate -w @orchestrator/api
npm run dev:api
npm run dev:orchestrator   # required for webhook processing
```
