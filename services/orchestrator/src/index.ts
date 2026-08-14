import { startWebhookWorker } from "./worker.js";

console.log("Orchestrator worker starting...");
console.log(`  Queue: webhook-processing`);
console.log(`  Waiting for jobs...`);

const worker = startWebhookWorker();

process.on("SIGINT", async () => {
  console.log("Shutting down worker...");
  await worker.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
