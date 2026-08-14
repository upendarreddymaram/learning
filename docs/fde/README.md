# FDE Learning Notes

## What is a Forward Deployed Engineer?

A **Forward Deployed Engineer (FDE)** is a hybrid role that sits between customers and engineering teams. Unlike a traditional backend or frontend engineer who builds product features for many users, an FDE embeds with a specific customer or problem domain to:

1. **Discover** ambiguous business requirements through direct customer interaction
2. **Translate** those requirements into explicit technical specifications
3. **Build and integrate** full-stack solutions — APIs, databases, third-party systems, cloud infrastructure
4. **Deploy and operate** what they build — monitoring, incident response, reliability
5. **Iterate** based on real-world feedback and teach the customer team to maintain the solution

FDEs are common at companies like Palantir, Databricks, and high-growth B2B startups where every enterprise customer needs custom integration work. The role demands breadth (full stack + cloud + data + AI) and the ability to ship independently under ambiguity.

**In this project:** we simulate the FDE workflow by building a platform that ingests real customer tickets (ClickUp), orchestrates AI agents to implement changes, validates via CI/CD, and exposes observability — the same end-to-end delivery loop an FDE runs for enterprise customers.

## Strengths (existing)

- React Native / Android / TypeScript production experience
- Production delivery

## Gaps to close

- Python / backend depth
- Distributed systems
- AWS / infrastructure
- Kubernetes
- Kafka / Flink
- Observability / SRE
- AI agent systems
- Security
- Customer discovery
- FDE-style interviews

## Resources

| Topic | Resource |
|-------|----------|
| FDE orientation | [FDE Academy roadmap](https://fde.academy/blog/the-forward-deployed-engineer-roadmap) |
| FDE stack | [FDE Academy tech stack](https://fde.academy/blog/forward-deployed-engineer-tech-stack) |
| Full stack | [Full Stack Open](https://fullstackopen.com/en/) |
| Python backend | [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/) |
| System design | [System Design Primer](https://github.com/donnemartin/system-design-primer) |
| gRPC | [gRPC Go Quickstart](https://grpc.io/docs/languages/go/quickstart/) |
| Kafka/Flink | [Confluent Developer Tutorials](https://developer.confluent.io/tutorials/) |
| Terraform/AWS | [HashiCorp Terraform AWS Tutorials](https://developer.hashicorp.com/terraform/tutorials/aws-get-started) |
| Kubernetes | [Kubernetes Tutorials](https://kubernetes.io/docs/tutorials/) |
| Observability | [OpenTelemetry Demo](https://opentelemetry.io/docs/demo/) |
| AI agents | [Microsoft Learn — Develop AI Agents](https://learn.microsoft.com/en-us/training/paths/develop-ai-agents-azure/) |
| FDE interview | [Google FDE Interview Guide](https://github.com/YagyanshB/google-fde-interview-guide) |
