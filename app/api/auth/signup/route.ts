import { NextRequest, NextResponse } from "next/server";
import { PoolClient } from "pg";
import { createSession, hashPassword, SESSION_COOKIE } from "@/lib/auth";
import { db } from "@/lib/db";
import { defaultWedding } from "@/lib/data";
import { LOCAL_CLIENT_ID, setLocalUsername } from "@/lib/local-store";

function normalizeUsername(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "";
}

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const normalizedUsername = normalizeUsername(username);
  if (!/^[\p{L}\p{N} ._-]{3,30}$/u.test(normalizedUsername)) {
    return NextResponse.json({ error: "Name must be 3-30 letters, numbers, spaces, dots, dashes, or underscores." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  let client: PoolClient | undefined;
  try {
    client = await db.connect();
    await client.query("begin");
    const passwordHash = await hashPassword(password);
    const account = await client.query<{ id: string }>(
      "insert into client_accounts (username, password_hash) values ($1, $2) returning id",
      [normalizedUsername, passwordHash]
    );
    await client.query("insert into weddings (client_id, data) values ($1, $2)", [account.rows[0].id, defaultWedding]);
    await client.query("commit");
    const session = await createSession(account.rows[0].id);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt, path: "/"
    });
    return response;
  } catch (error) {
    if (client) await client.query("rollback");
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "Username is already taken." }, { status: 409 });
    }
    if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
      setLocalUsername(normalizedUsername);
      const session = await createSession(LOCAL_CLIENT_ID);
      const response = NextResponse.json({ ok: true, mode: "local" });
      response.cookies.set(SESSION_COOKIE, session.token, {
        httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
        expires: session.expiresAt, path: "/"
      });
      return response;
    }
    return NextResponse.json({ error: "Database connection is unavailable. Use the local admin password or check POSTGRES_URL." }, { status: 503 });
  } finally {
    client?.release();
  }
}
