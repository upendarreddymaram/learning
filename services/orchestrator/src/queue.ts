import { Queue } from "bullmq";
import { getEnv } from "@orchestrator/config";
import { WEBHOOK_QUEUE_NAME, type WebhookJobData } from "@orchestrator/types";
import { getRedis } from "./redis.js";

let webhookQueue: Queue<WebhookJobData> | null = null;

export function getWebhookQueue(): Queue<WebhookJobData> {
  if (!webhookQueue) {
    getEnv();
    webhookQueue = new Queue<WebhookJobData>(WEBHOOK_QUEUE_NAME, {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
  }
  return webhookQueue;
}

export async function enqueueWebhookJob(data: WebhookJobData): Promise<string> {
  const queue = getWebhookQueue();
  const jobId = data.idempotencyKey.replace(/:/g, "-");
  const job = await queue.add("process-webhook", data, { jobId });
  return job.id ?? jobId;
}
