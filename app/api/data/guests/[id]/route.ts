import { NextRequest, NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";
import { query } from "@/lib/db";
import { isLocalClient, removeLocalGuest } from "@/lib/local-store";

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (isLocalClient(client.id)) {
    if (!removeLocalGuest(id)) return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }
  await query("delete from guests where id = $1 and client_id = $2", [id, client.id]);
  return NextResponse.json({ ok: true });
}
