# Interview Card Template

Use one card per major technology or concept. Prepare a 30–60 second spoken answer every Friday.

---

## 1. Definition

What is the technology/concept?

## 2. Problem it solves

Why does it exist?

## 3. How it works

Explain the mental model and important internals.

## 4. Where I used it

Describe the exact AI Dev Orchestrator component.

## 5. Why I chose it

Mention alternatives and the decision criteria.

## 6. Trade-offs

Latency, cost, complexity, consistency, operability, lock-in, etc.

## 7. Failure scenario

What happens if this dependency fails?

## 8. Production considerations

Security, scaling, monitoring, deployment and recovery.

## 9. Interview Answer

Prepare a 30–60 second answer.

## 10. Example

Include a small architecture or code example.

---

## Example: Kafka

**Definition:** Kafka is a distributed event-streaming platform for publishing, storing and consuming durable event streams.

**Project usage:** In the orchestrator, Kafka decouples ClickUp ingestion from long-running task execution and lets multiple consumers process events independently.

**Why:** decoupling, replay, scalability and independent consumers.

**Tradeoff:** operational complexity and eventual consistency. Mention partitions, consumer groups, offsets and delivery semantics when the interviewer goes deeper.
