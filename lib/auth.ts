import { query } from "@/lib/db";
import { defaultWedding } from "@/lib/data";
import { LOCAL_CLIENT_ID } from "@/lib/local-store";

export async function getCurrentClient() {
  if (process.env.NODE_ENV !== "production") {
    return { id: LOCAL_CLIENT_ID, username: "local admin" };
  }

  const existing = await query<{ id: string; username: string }>(
    `select a.id, a.username
     from client_accounts a
     join weddings w on w.client_id = a.id
     order by a.created_at
     limit 1`
  );
  if (existing.rows[0]) return existing.rows[0];

  const created = await query<{ id: string; username: string }>(
    `insert into client_accounts (username, password_hash)
     values ('public admin', 'authentication-disabled')
     on conflict (username) do update set username = excluded.username
     returning id, username`
  );
  const client = created.rows[0];
  await query(
    `insert into weddings (client_id, data)
     values ($1, $2)
     on conflict (client_id) do nothing`,
    [client.id, defaultWedding]
  );
  return client;
}
