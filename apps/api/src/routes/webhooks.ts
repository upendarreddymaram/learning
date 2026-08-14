import { Router, type Request, type Response } from "express";
import { verifyClickUpSignature } from "@orchestrator/clients";
import { getEnv } from "@orchestrator/config";
import type { ClickUpWebhookPayload } from "@orchestrator/types";
import {
  buildIdempotencyKey,
  claimIdempotencyKey,
  enqueueWebhookJob,
  releaseIdempotencyKey,
} from "@orchestrator/orchestrator/lib";

export const webhooksRouter = Router();

async function queueWebhook(payload: ClickUpWebhookPayload, rawPayload: Record<string, unknown>, res: Response) {
  const idempotencyKey = buildIdempotencyKey(payload);
  const isNew = await claimIdempotencyKey(idempotencyKey);

  if (!isNew) {
    res.status(200).json({ ok: true, duplicate: true, idempotencyKey });
    return;
  }

  try {
    const jobId = await enqueueWebhookJob({
      idempotencyKey,
      payload,
      rawPayload,
      receivedAt: new Date().toISOString(),
    });
    res.status(202).json({ ok: true, queued: true, jobId, idempotencyKey });
  } catch (err) {
    await releaseIdempotencyKey(idempotencyKey);
    throw err;
  }
}

webhooksRouter.post("/clickup", async (req: Request, res: Response) => {
  try {
    const rawBody = (req as Request & { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
    const signature = req.headers["x-signature"] as string | undefined;
    const env = getEnv();

    if (!verifyClickUpSignature(rawBody, signature, env.CLICKUP_WEBHOOK_SECRET)) {
      res.status(401).json({ error: "Invalid webhook signature" });
      return;
    }

    const payload = req.body as ClickUpWebhookPayload;

    if (!payload.task_id) {
      res.status(400).json({ error: "Missing task_id in webhook payload" });
      return;
    }

    await queueWebhook(payload, req.body as Record<string, unknown>, res);
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Failed to queue webhook" });
  }
});

/** Dev-only: simulate ClickUp webhook without signature */
webhooksRouter.post("/clickup/dev/simulate", async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({ error: "Not available in production" });
    return;
  }

  try {
    const payload = req.body as ClickUpWebhookPayload;

    if (!payload.task_id) {
      res.status(400).json({ error: "Missing task_id" });
      return;
    }

    if (!payload.event) {
      payload.event = "taskUpdated";
    }

    await queueWebhook(payload, req.body as Record<string, unknown>, res);
  } catch (err) {
    console.error("Simulate webhook error:", err);
    res.status(500).json({ error: "Failed to queue simulated webhook" });
  }
});
