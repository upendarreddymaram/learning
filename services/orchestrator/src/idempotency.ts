import { createHash } from "node:crypto";
import type { ClickUpWebhookPayload } from "@orchestrator/types";
import { getRedis } from "./redis.js";

const IDEMPOTENCY_TTL_SECONDS = 86400; // 24 hours

export function buildIdempotencyKey(payload: ClickUpWebhookPayload): string {
  if (payload.webhook_id) {
    return `webhook:${payload.webhook_id}`;
  }

  const historyId = payload.history_items?.[0]?.id ?? "";
  const raw = `${payload.task_id}:${payload.event}:${historyId}`;
  const hash = createHash("sha256").update(raw).digest("hex").slice(0, 16);
  return `webhook:${payload.task_id}:${hash}`;
}

/**
 * Returns true if this is a new event (should be processed).
 * Returns false if duplicate (already seen).
 */
export async function claimIdempotencyKey(key: string): Promise<boolean> {
  const redis = getRedis();
  const result = await redis.set(key, "1", "EX", IDEMPOTENCY_TTL_SECONDS, "NX");
  return result === "OK";
}

export async function releaseIdempotencyKey(key: string): Promise<void> {
  await getRedis().del(key);
}
