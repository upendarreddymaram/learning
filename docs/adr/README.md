# Architecture Decision Records (ADRs)

Document significant architectural decisions using the format below. Number sequentially: `0001-title.md`, `0002-title.md`, etc.

## Template

```markdown
# ADR-NNNN: Title

## Status
Proposed | Accepted | Deprecated | Superseded

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult because of this change?
```

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [001](./001-monorepo-structure.md) | Monorepo Structure with npm Workspaces | Accepted |
| [002](./002-redis-idempotency.md) | Redis Idempotency and Async Job Queue | Accepted |
