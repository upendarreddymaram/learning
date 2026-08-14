# Interview Card: Forward Deployed Engineer (FDE)

Use this for a 30–60 second spoken answer.

---

## 1. Definition

A Forward Deployed Engineer embeds with customers to turn ambiguous business problems into shipped, integrated software — full stack, cloud, and operations included.

## 2. Problem it solves

Enterprise customers have unique workflows that off-the-shelf SaaS cannot fully address. FDEs bridge the gap between "what the customer needs" and "what engineering can build and deploy."

## 3. How it works

FDEs run a delivery loop: discovery → scoping → build → integrate → deploy → operate → iterate. They own the outcome, not just a feature ticket.

## 4. Where I used it

I'm building the **AI Dev Orchestrator** — a platform that automates the FDE delivery loop: ClickUp ticket in → AI plans and implements → CI validates → human approves → deploy. The project itself is my FDE learning laboratory.

## 5. Why I chose this path

I have mobile/frontend production experience but need depth in backend, distributed systems, cloud, and AI agents — all core FDE skills. Building a real platform with real integrations (ClickUp, GitHub, AWS) is more credible in interviews than tutorial projects.

## 6. Trade-offs

| Pros | Cons |
|------|------|
| Breadth makes you highly employable at B2B companies | Jack-of-all-trades risk — must demonstrate depth in at least 2–3 areas |
| Customer-facing skills differentiate from pure IC engineers | Context switching between customers/projects is demanding |
| End-to-end ownership is satisfying | Less time for deep specialization (e.g. kernel-level systems) |

## 7. Failure scenario

An FDE ships a integration that works in demo but fails under the customer's production load. Mitigation: load test early, instrument with observability, define SLOs before launch.

## 8. Production considerations

- Tenant isolation when one platform serves multiple customers
- Secrets management and least-privilege API access
- Idempotent webhook handling (duplicate events must not corrupt state)
- Audit logs for compliance

## 9. Interview Answer (30–60 seconds)

> "A Forward Deployed Engineer sits between the customer and the engineering org. They discover ambiguous requirements, translate them into technical specs, build full-stack integrations, deploy to production, and operate what they ship. I'm building an AI Dev Orchestrator to practice this end-to-end — it ingests ClickUp tickets, orchestrates AI agents to create PRs, runs CI, and waits for human QA before merge. The project covers webhooks, PostgreSQL, event-driven architecture, Kubernetes, and observability — the same stack FDE roles expect."

## 10. Example

This repository: `apps/api` receives ClickUp webhooks, persists tasks to PostgreSQL, and the Next.js dashboard lets a human inspect and approve work — the first slice of the FDE delivery loop.
