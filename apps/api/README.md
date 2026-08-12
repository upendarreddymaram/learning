# API (Webhook Gateway + Dashboard APIs)

Node.js + TypeScript backend.

## Phase 1

- `POST /webhooks/clickup` — authenticate, validate, idempotency, persist event
- Dashboard REST APIs for tasks, repositories, organizations
- PostgreSQL persistence layer

## Phase 2

- Redis-backed job queue
- Task state machine transitions

## Setup

```bash
# Phase 1 — initialize when ready
# npm init -y && npm install express typescript ...
```
