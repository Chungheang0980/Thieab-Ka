import { Pool, QueryResultRow } from "pg";

const globalForDb = globalThis as unknown as { thieabKaPool?: Pool };
const connectionUrl = new URL(process.env.POSTGRES_URL!);
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
