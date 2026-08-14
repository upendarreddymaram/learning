import { Router } from "express";
import { sql } from "drizzle-orm";
import { getDb } from "@orchestrator/db";
import { checkRedisConnection } from "@orchestrator/orchestrator/lib";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  try {
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    const redisOk = await checkRedisConnection();

    if (!redisOk) {
      res.status(503).json({
        status: "degraded",
        database: "connected",
        redis: "disconnected",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.json({
      status: "ok",
      database: "connected",
      redis: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(503).json({ status: "degraded", database: "disconnected", redis: "unknown" });
  }
});
