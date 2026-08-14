import { createHmac, timingSafeEqual } from "node:crypto";
import type { ClickUpTaskResponse } from "@orchestrator/types";

const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

export class ClickUpClient {
  constructor(private readonly apiToken: string) {}

  async getTask(taskId: string): Promise<ClickUpTaskResponse> {
    const response = await fetch(`${CLICKUP_API_BASE}/task/${taskId}`, {
      headers: {
        Authorization: this.apiToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`ClickUp API error (${response.status}): ${body}`);
    }

    return response.json() as Promise<ClickUpTaskResponse>;
  }
}

export function verifyClickUpSignature(
  rawBody: string,
  signature: string | undefined,
  secret: string | undefined,
): boolean {
  if (!secret) {
    return process.env.NODE_ENV === "development";
  }

  if (!signature) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const bufA = Buffer.from(expected, "utf8");
  const bufB = Buffer.from(signature, "utf8");

  if (bufA.length !== bufB.length) {
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}
