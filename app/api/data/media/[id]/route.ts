import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";
import { query } from "@/lib/db";
import { isLocalClient, removeLocalMedia } from "@/lib/local-store";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  if (isLocalClient(client.id)) {
    if (!removeLocalMedia(id)) return NextResponse.json({ error: "Media not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }
  const result = await query("delete from wedding_media where id = $1 and client_id = $2", [id, client.id]);
  if (!result.rowCount) return NextResponse.json({ error: "Media not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
