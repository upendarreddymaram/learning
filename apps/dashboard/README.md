# Dashboard

Next.js 15 + React + TypeScript + Tailwind CSS.

## Implemented (Phase 1)

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/tasks` |
| `/tasks` | Task list table |
| `/tasks/[id]` | Task detail + event timeline |

## Run

```bash
# From repo root (API must be running on :3000)
npm run dev:dashboard
```

Open http://localhost:3001/tasks

## Phase 2+

- Live task status updates
- QA approval workflow (Phase 5)
- Observability views (Phase 10)
