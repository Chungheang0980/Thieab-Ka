import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { LOCAL_CLIENT_ID } from "@/lib/local-store";

const scrypt = promisify(scryptCallback);
export const SESSION_COOKIE = "thieab-ka-client";

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(clientId: string) {
  if (clientId === LOCAL_CLIENT_ID) {
    const token = process.env.ADMIN_SESSION_TOKEN || randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return { token, expiresAt };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await query(
    "insert into client_sessions (token_hash, client_id, expires_at) values ($1, $2, $3)",
    [hashToken(token), clientId, expiresAt]
  );
  return { token, expiresAt };
}

export async function getCurrentClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  if (process.env.ADMIN_PASSWORD && token === process.env.ADMIN_SESSION_TOKEN) {
    return { id: LOCAL_CLIENT_ID, username: "local admin" };
  }
  const result = await query<{ id: string; username: string }>(
    `select a.id, a.username
     from client_sessions s
     join client_accounts a on a.id = s.client_id
     where s.token_hash = $1 and s.expires_at > now()`,
    [hashToken(token)]
  );
  return result.rows[0] ?? null;
}
