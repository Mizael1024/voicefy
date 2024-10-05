import type { Config } from "drizzle-kit";
const { TURSO_DB_URL, TURSO_DB_TOKEN } = process.env;

if (!TURSO_DB_URL || !TURSO_DB_TOKEN) {
  throw new Error("Missing 'TURSO_DB_URL' or 'TURSO_DB_TOKEN' environment variables");
}

export default {
  schema: "./server/database/schema.ts",
  out: "./server/database/migrations",
  driver: "turso",
  dialect: "sqlite",
  dbCredentials: {
    url: TURSO_DB_URL,
    authToken: TURSO_DB_TOKEN,
  },
} satisfies Config;
