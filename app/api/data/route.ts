import { NextRequest, NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";
import { query } from "@/lib/db";
import { getLocalStore, isLocalClient, updateLocalWedding } from "@/lib/local-store";
import { Guest, Wedding } from "@/types";

type GuestRow = {
  id: string; name: string; phone: string; table_number: string;
  lucky_id: string; status: Guest["status"];
};

function mapGuest(row: GuestRow): Guest {
  return {
    id: row.id, name: row.name, phone: row.phone, table: row.table_number,
    luckyId: row.lucky_id, status: row.status
  };
}

export async function GET() {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isLocalClient(client.id)) {
    const store = getLocalStore();
    return NextResponse.json({
      username: store.username,
      wedding: store.wedding,
      guests: store.guests
    });
  }

  const [weddingResult, guestResult] = await Promise.all([
    query<{ data: Wedding }>("select data from weddings where client_id = $1", [client.id]),
    query<GuestRow>("select id, name, phone, table_number, lucky_id, status from guests where client_id = $1 order by created_at", [client.id])
  ]);
  return NextResponse.json({
    username: client.username,
    wedding: weddingResult.rows[0]?.data,
    guests: guestResult.rows.map(mapGuest)
  });
}

export async function PUT(request: NextRequest) {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const wedding = await request.json() as Wedding;
  if (isLocalClient(client.id)) {
    updateLocalWedding(wedding);
    return NextResponse.json({ ok: true });
  }
  await query("update weddings set data = $1, updated_at = now() where client_id = $2", [wedding, client.id]);
  return NextResponse.json({ ok: true });
}
