import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { getEnv } from "@orchestrator/config";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = resolve(__dirname, "../../../apps/api/drizzle");

async function runMigrations() {
  const env = getEnv();
  const client = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  console.log("Running migrations from", migrationsFolder);
  await migrate(db, { migrationsFolder });
  console.log("Migrations complete.");
  await client.end();
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
