create extension if not exists pgcrypto;

create table if not exists public.asset_picker_assets (
  id uuid primary key default gen_random_uuid(),
  file_path text not null unique,
  file_name text not null,
  source_group text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  modified_at timestamptz not null default now(),
  decision text not null default 'undecided'
    check (decision in ('undecided', 'selected', 'rejected')),
  indexed_at timestamptz not null default now(),
  decision_updated_at timestamptz not null default now(),
  gallery_category text not null default 'result'
    check (gallery_category in ('field', 'result', 'credential')),
  gallery_title text,
  gallery_description text
);

create index if not exists asset_picker_assets_decision_idx
  on public.asset_picker_assets (decision, source_group);
create index if not exists asset_picker_assets_source_group_idx
  on public.asset_picker_assets (source_group, file_name);

create table if not exists public.press_releases (
  id uuid primary key default gen_random_uuid(),
  publisher text not null,
  headline text not null,
  summary text not null,
  published_on date not null,
  thumbnail_asset_id uuid references public.asset_picker_assets(id) on delete set null,
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists press_releases_published_on_idx
  on public.press_releases (published_on desc, created_at desc);

alter table public.asset_picker_assets enable row level security;
alter table public.press_releases enable row level security;
revoke all on table public.asset_picker_assets, public.press_releases from anon, authenticated;

insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', false)
on conflict (id) do update set public = excluded.public;
