import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../../packages/db/src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://orchestrator:orchestrator@localhost:5432/orchestrator",
  },
});
