# AI Dev Orchestrator

An AI-powered engineering delivery platform that converts a ClickUp engineering/business ticket into a validated software change across one or more repositories.

**Learn → Build → Break → Debug → Deploy → Document → Explain**

## Purpose

The platform ingests a ticket, resolves the repository, creates an implementation plan, invokes an AI coding-agent adapter, creates a branch and pull request, runs CI/CD, analyzes failures, validates acceptance criteria, waits for human approval, merges, deploys, and exposes logs, metrics, traces, reliability and AI-cost telemetry.

This project is a learning laboratory for Forward Deployed Engineering: full-stack development, enterprise integrations, distributed systems, cloud, DevOps/SRE, data engineering, AI agents, security, observability, customer discovery, and technical communication.

## Core Workflow

```
ClickUp → Webhook Gateway → Kafka → FDE Orchestrator → Agent Gateway → Repository Worker
  → GitHub PR → GitHub Actions → AI RCA/Validator → Acceptance Engine → Human QA
  → Merge → Deploy → Observability (Logs / Metrics / Traces → Grafana)
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Main backend | Node.js, TypeScript |
| AI services | Python, FastAPI, LLM APIs, structured outputs, RAG, agent tooling |
| Distributed services | Go, gRPC, Protocol Buffers |
| Database | PostgreSQL |
| Cache / jobs | Redis |
| Event streaming | Kafka |
| Stream processing | Apache Flink |
| Containers | Docker |
| Local orchestration | kind / Kubernetes |
| Cloud | AWS |
| Infrastructure as Code | Terraform |
| CI/CD | GitHub Actions |
| Observability | OpenTelemetry, Prometheus, Grafana |
| Source control | Git, GitHub |
| Work management | ClickUp |
| Security | OAuth/OIDC, RBAC, IAM, TLS, secrets, audit logs |

## Repository Structure

```
learning/
├── apps/
│   ├── dashboard/          # Next.js + React + TypeScript
│   └── api/                # Node.js API (webhook gateway + dashboard APIs)
├── services/
│   ├── orchestrator/       # workflow / state machine
│   ├── ai-planner/         # Python / FastAPI
│   ├── repo-worker/        # Go
│   ├── ci-worker/          # Go
│   ├── validation-worker/  # Python / Node
│   └── analytics-worker/   # Flink / Kafka consumers
├── packages/
│   ├── types/              # shared TypeScript types
│   ├── events/             # event schemas and publishers
│   ├── clients/            # third-party API clients
│   └── config/             # shared configuration
├── agents/
│   ├── cursor/             # Cursor-compatible adapter
│   ├── openai/             # API agent adapter
│   └── local/              # local agent adapter
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
├── observability/
│   ├── prometheus/
│   ├── grafana/
│   └── otel/
├── proto/                  # protobuf / gRPC contracts
├── tests/
├── docs/
│   ├── architecture/
│   ├── adr/
│   ├── incidents/
│   ├── fde/
│   ├── interview/
│   └── case-studies/
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Go 1.22+
- Docker & Docker Compose
- PostgreSQL, Redis, Kafka (via docker-compose)

### Local Development

```bash
# Start infrastructure services
docker compose up -d

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run database migrations
npm run db:generate -w @orchestrator/api
npm run db:migrate -w @orchestrator/api

# Start API (terminal 1), Orchestrator (terminal 2), Dashboard (terminal 3)
npm run dev:api
npm run dev:orchestrator
npm run dev:dashboard
```

Open http://localhost:3001/tasks. See [Phase 1 Learning Guide](docs/learning/PHASE-1-LEARNING.md) for full setup, interview prep, and dev seed commands.

## Build Roadmap (30 Weeks)

| Phase | Focus | Milestone |
|-------|-------|-----------|
| 0 | FDE orientation & baseline | Explain FDE and project success criteria |
| 1 | Node.js + PostgreSQL | ClickUp task appears in platform |
| 2 | Redis + state machines | Duplicate webhooks don't corrupt state |
| 3 | Python + AI planner | Raw ticket → structured implementation plan |
| 4 | Agent Gateway + cost governance | Switch agent providers without workflow changes |
| 5 | GitHub automation + CI/CD | ClickUp task produces a real PR |
| 6 | Go + gRPC workers | Two services communicate via gRPC |
| 7 | Kafka event-driven architecture | Workflow decoupled through Kafka with replay |
| 8 | AWS + Terraform | Infrastructure recreated from Terraform |
| 9 | Kubernetes | Services deploy and recover via K8s |
| 10 | Observability + SRE | Diagnose failures from telemetry |
| 11 | Security + multi-tenancy | Tenant isolation enforced |
| 12 | Advanced distributed systems | Five failure modes documented |
| 13 | Data engineering + analytics | Real-time engineering analytics dashboard |
| 14 | Legacy modernization | Messy repo → prioritized modernization plan |
| 15 | Chaos engineering | Resilience report with measurements |
| 16 | FDE customer workflow + portfolio | 2–3 public case studies |

## Weekly Operating System

| Day | Activity |
|-----|----------|
| Monday | Learn the concept from selected resources |
| Tuesday | Implement the smallest useful version |
| Wednesday | Break it deliberately (crashes, latency, bad input) |
| Thursday | Improve reliability, architecture, testing, docs |
| Friday | Write interview card; explain aloud in 30–60 seconds |
| Weekend | Ship feature, update README/ADR, record demo |

## Documentation

- [Architecture](docs/architecture/README.md)
- [Phase 1 Learning Guide](docs/learning/PHASE-1-LEARNING.md)
- [Phase 2 Learning Guide](docs/learning/PHASE-2-LEARNING.md) — **Redis, idempotency, state machine**
- [Interview Card Template](docs/interview/interview-card-template.md)
- [ADR Index](docs/adr/README.md)
- [FDE Notes](docs/fde/README.md)

## Cost-Control Strategy

**Local first → free tier/credits second → pay only when required.**

- Development: Docker, local PostgreSQL, Redis, Kafka, kind — $0
- Cloud: AWS Free Tier/credits selectively; destroy unused resources
- AI: Local models where practical; metered API usage with per-task budgets

## Success Criteria

- [ ] Convert ambiguous requests into explicit technical requirements
- [ ] Build and deploy full-stack services independently
- [ ] Integrate third-party APIs with auth, retries, idempotency
- [ ] Explain REST, webhooks, gRPC, Kafka, Redis, PostgreSQL tradeoffs
- [ ] Deploy to AWS and Kubernetes via Terraform
- [ ] Instrument distributed workflows with logs, metrics, traces
- [ ] Design tenant isolation, RBAC, secrets, least-privilege access
- [ ] Diagnose failures using telemetry and RCA
- [ ] Explain AI-agent architecture, evaluation, and cost controls
- [ ] Run customer-style discovery/scoping sessions
- [ ] Public repo, demo, architecture diagrams, ADRs, case studies
