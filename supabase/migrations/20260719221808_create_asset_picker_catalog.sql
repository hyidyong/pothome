create table public.asset_picker_assets (
  id uuid primary key default gen_random_uuid(),
  file_path text not null unique,
  file_name text not null,
  source_group text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  modified_at timestamptz not null,
  decision text not null default 'undecided'
    check (decision in ('undecided', 'selected', 'rejected')),
  indexed_at timestamptz not null default now(),
  decision_updated_at timestamptz not null default now()
);

create index asset_picker_assets_source_group_idx
  on public.asset_picker_assets (source_group, file_name);

create index asset_picker_assets_decision_idx
  on public.asset_picker_assets (decision, source_group);

alter table public.asset_picker_assets enable row level security;

revoke all on table public.asset_picker_assets from anon, authenticated;
