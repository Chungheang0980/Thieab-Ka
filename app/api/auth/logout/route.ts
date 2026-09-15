import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hashToken, SESSION_COOKIE } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await query("delete from client_sessions where token_hash = $1", [hashToken(token)]);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
