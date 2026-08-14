import { Worker, type Job } from "bullmq";
import { processWebhookWithStateMachine } from "@orchestrator/db";
import { WEBHOOK_QUEUE_NAME, type WebhookJobData } from "@orchestrator/types";
import { getRedis } from "./redis.js";
import { releaseIdempotencyKey } from "./idempotency.js";

export function startWebhookWorker(): Worker<WebhookJobData> {
  const worker = new Worker<WebhookJobData>(
    WEBHOOK_QUEUE_NAME,
    async (job: Job<WebhookJobData>) => {
      const { payload, rawPayload, idempotencyKey } = job.data;

      console.log(`[worker] Processing webhook job ${job.id} (attempt ${job.attemptsMade + 1})`);

      try {
        const task = await processWebhookWithStateMachine(payload, rawPayload);
        console.log(`[worker] Task ${task.id} → status ${task.status}`);
        return { taskId: task.id, status: task.status };
      } catch (err) {
        console.error(`[worker] Job failed:`, err);
        if (job.attemptsMade + 1 >= (job.opts.attempts ?? 1)) {
          await releaseIdempotencyKey(idempotencyKey);
        }
        throw err;
      }
    },
    {
      connection: getRedis(),
      concurrency: 5,
    },
  );

  worker.on("completed", (job) => {
    console.log(`[worker] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[worker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
