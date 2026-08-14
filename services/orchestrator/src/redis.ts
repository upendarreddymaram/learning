import { Redis } from "ioredis";
import { getEnv } from "@orchestrator/config";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const env = getEnv();
    redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  }
  return redis;
}

export async function checkRedisConnection(): Promise<boolean> {
  try {
    const result = await getRedis().ping();
    return result === "PONG";
  } catch {
    return false;
  }
}
