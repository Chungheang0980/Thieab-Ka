import { NextRequest, NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";
import { query } from "@/lib/db";
import { createLocalGuests, isLocalClient } from "@/lib/local-store";
import { Guest } from "@/types";

type GuestInput = Pick<Guest, "name" | "phone" | "table">;
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

function normalizeGuestName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function POST(request: NextRequest) {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { guests?: GuestInput[] };
  const inputs = (body.guests ?? []).filter((guest) => guest.name?.trim());
  if (!inputs.length) return NextResponse.json({ guests: [] });
  if (isLocalClient(client.id)) {
    return NextResponse.json({ guests: createLocalGuests(inputs) });
  }

  const countResult = await query<{ count: string }>("select count(*) from guests where client_id = $1", [client.id]);
  const start = Number(countResult.rows[0].count);
  const created: Guest[] = [];
  for (const [index, guest] of inputs.entries()) {
    const luckyId = `TK-${String(1400 + (start + index) * 13).padStart(4, "0")}`;
    const result = await query<GuestRow>(
      `insert into guests (client_id, name, phone, table_number, lucky_id)
       values ($1, $2, $3, $4, $5)
       returning id, name, phone, table_number, lucky_id, status`,
      [client.id, normalizeGuestName(guest.name), guest.phone?.trim() ?? "", guest.table?.trim() ?? "", luckyId]
    );
    created.push(mapGuest(result.rows[0]));
  }
  return NextResponse.json({ guests: created });
}
