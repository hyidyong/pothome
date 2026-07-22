alter table public.asset_picker_assets
  add column if not exists gallery_category text not null default 'strategy'
    check (gallery_category in ('field', 'strategy', 'execution', 'product')),
  add column if not exists gallery_title text,
  add column if not exists gallery_description text;

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

alter table public.press_releases enable row level security;

revoke all on table public.press_releases from anon, authenticated;
