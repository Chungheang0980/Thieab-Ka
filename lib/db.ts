import { Pool, QueryResultRow } from "pg";

const globalForDb = globalThis as unknown as { thieabKaPool?: Pool };
const connectionString = process.env.LIVE_POSTGRES_URL ?? process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("Set LIVE_POSTGRES_URL or POSTGRES_URL before starting Thieab Ka.");
}

const connectionUrl = new URL(connectionString);
const sslMode = connectionUrl.searchParams.get("sslmode");
const isLocalDatabase = ["localhost", "127.0.0.1", "::1"].includes(connectionUrl.hostname);
connectionUrl.searchParams.delete("sslmode");

export const db = globalForDb.thieabKaPool ?? new Pool({
  connectionString: connectionUrl.toString(),
  ssl: !isLocalDatabase && sslMode !== "disable" ? { rejectUnauthorized: false } : false
});

if (process.env.NODE_ENV !== "production") globalForDb.thieabKaPool = db;

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  return db.query<T>(text, values);
}
