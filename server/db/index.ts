import "../env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { logger } from "../lib/logger";

// Log only the host — never the full connection string (it contains the password).
try {
  const dbHost = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).host : "unknown";
  logger.info(`🔌 Database host: ${dbHost}`);
} catch {
  logger.warn("DATABASE_URL is not a valid URL");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
  logger.error("Unexpected database pool error", { error: err.message });
});

export const db = drizzle(pool, { schema });
export { pool };