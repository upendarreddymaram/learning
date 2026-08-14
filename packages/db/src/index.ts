import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@orchestrator/config";
import * as schema from "./schema.js";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!db) {
    const env = getEnv();
    const client = postgres(env.DATABASE_URL, { max: 10 });
    db = drizzle(client, { schema });
  }
  return db;
}

export { schema };
export {
  upsertTaskFromWebhook,
  transitionTaskStatus,
  processWebhookWithStateMachine,
  listTasks,
  getTaskById,
  createTaskFromDevPayload,
} from "./taskRepository.js";
export { canTransition, transition, getValidTransitions } from "./stateMachine.js";
