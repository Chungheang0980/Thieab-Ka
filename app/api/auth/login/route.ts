import { NextRequest, NextResponse } from "next/server";
import { createSession, SESSION_COOKIE, verifyPassword } from "@/lib/auth";
import { query } from "@/lib/db";
import { LOCAL_CLIENT_ID, setLocalUsername } from "@/lib/local-store";

function normalizeUsername(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "";
}

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const normalizedUsername = normalizeUsername(username);

  try {
    const result = await query<{ id: string; password_hash: string }>(
      "select id, password_hash from client_accounts where username = $1",
      [normalizedUsername]
    );
    const account = result.rows[0];
    if (!account || typeof password !== "string" || !await verifyPassword(password, account.password_hash)) {
      return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
    }
    const session = await createSession(account.id);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt, path: "/"
    });
    return response;
  } catch (error) {
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

    return NextResponse.json(
      { error: "Database connection is unavailable. Use the local admin password or check POSTGRES_URL." },
      { status: 503 }
    );
  }
}
