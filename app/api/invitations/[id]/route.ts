import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getLocalInvitation, updateLocalRSVP } from "@/lib/local-store";
import { Guest, RSVPStatus, Wedding } from "@/types";

type InvitationRow = {
  id: string; name: string; phone: string; table_number: string;
  lucky_id: string; status: RSVPStatus; wedding: Wedding;
};

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (id.startsWith("local-guest-")) {
    const invitation = getLocalInvitation(id);
    if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    return NextResponse.json(invitation);
  }

  const result = await query<InvitationRow>(
    `select g.id, g.name, g.phone, g.table_number, g.lucky_id, g.status, w.data as wedding
     from guests g join weddings w on w.client_id = g.client_id where g.id = $1`,
    [id]
  );
  const row = result.rows[0];
  if (!row) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  const guest: Guest = {
    id: row.id, name: row.name, phone: row.phone, table: row.table_number,
    luckyId: row.lucky_id, status: row.status
  };
  return NextResponse.json({ wedding: row.wedding, guest });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { status } = await request.json() as { status: RSVPStatus };
  if (!["attending", "declined"].includes(status)) {
    return NextResponse.json({ error: "Invalid RSVP status" }, { status: 400 });
  }
  if (id.startsWith("local-guest-")) {
    if (!updateLocalRSVP(id, status)) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }
  const result = await query("update guests set status = $1 where id = $2 returning id", [status, id]);
  if (!result.rowCount) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
