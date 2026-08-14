# ADR-001: Monorepo Structure with npm Workspaces

**Status:** Accepted  
**Date:** 2026-08-14  
**Phase:** 0

## Context

The AI Dev Orchestrator spans multiple runtimes (Node.js, Python, Go) and multiple deployable units (API, dashboard, workers, AI services). We need a repository structure that supports shared types, independent service development, and a clear learning path through 16 phases.

## Decision

Use a **monorepo** with npm workspaces for TypeScript packages and apps:

```
learning/
├── apps/           # Deployable user-facing applications
│   ├── api/        # Webhook gateway + REST API
│   └── dashboard/  # Next.js frontend
├── services/       # Backend microservices (orchestrator, workers, AI)
├── packages/       # Shared libraries (types, config, clients, events)
├── agents/         # AI agent provider adapters
├── infrastructure/ # Docker, K8s, Terraform
└── docs/           # Architecture, ADRs, learning notes
```

TypeScript shared code lives in `packages/`. Python (Phase 3+) and Go (Phase 6+) services remain in `services/` with their own module systems but consume shared contracts via `proto/` and OpenAPI.

## Rationale

| Alternative | Why not |
|-------------|---------|
| Polyrepo (one repo per service) | Overkill for a learning project; shared types would need a published npm package |
| Turborepo-only without workspaces | npm workspaces is sufficient at this scale; Turborepo can be added later |
| Single flat Node app | Cannot cleanly separate API, dashboard, and future Go/Python services |

## Consequences

- **Positive:** Shared `@orchestrator/types` prevents API/dashboard drift; one `npm install` at root
- **Positive:** Clear phase mapping — each folder corresponds to a roadmap milestone
- **Negative:** Python/Go services won't participate in npm workspaces (acceptable; use proto for contracts)
- **Negative:** Build tooling complexity grows after Phase 6 (mitigate with Turborepo in Phase 7)

## References

- [README.md](../../README.md) — repository structure
- Phase 1 implementation: `packages/types`, `packages/config`, `packages/clients`
