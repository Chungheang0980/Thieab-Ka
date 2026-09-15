create extension if not exists pgcrypto;

create table if not exists client_accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists client_sessions (
  token_hash text primary key,
  client_id uuid not null references client_accounts(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists weddings (
  client_id uuid primary key references client_accounts(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists wedding_media (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references client_accounts(id) on delete cascade,
  kind text not null check (kind in ('photo', 'video')),
  file_name text not null,
  mime_type text not null,
  data bytea not null,
  created_at timestamptz not null default now()
);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references client_accounts(id) on delete cascade,
  name text not null,
  phone text not null default '',
  table_number text not null default '',
  lucky_id text not null,
  status text not null default 'pending' check (status in ('pending', 'attending', 'declined')),
  created_at timestamptz not null default now()
);

create index if not exists guests_client_id_idx on guests(client_id);
create index if not exists wedding_media_client_id_idx on wedding_media(client_id);
