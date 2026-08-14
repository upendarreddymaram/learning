import express from "express";
import cors from "cors";
import { getEnv } from "@orchestrator/config";
import { webhooksRouter } from "./routes/webhooks.js";
import { tasksRouter } from "./routes/tasks.js";
import { healthRouter } from "./routes/health.js";

const app = express();

app.use(
  cors({
    origin: [getEnv().DASHBOARD_URL, "http://localhost:3001"],
  }),
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: string }).rawBody = buf.toString("utf8");
    },
  }),
);

app.use("/health", healthRouter);
app.use("/webhooks", webhooksRouter);
app.use("/api/tasks", tasksRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const env = getEnv();
const port = env.PORT;

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
  console.log(`  Health:   GET  /health`);
  console.log(`  Webhook:  POST /webhooks/clickup (async queue)`);
  console.log(`  Tasks:    GET  /api/tasks`);
  console.log(`  Dev seed: POST /api/tasks/dev/seed (development only)`);
});
