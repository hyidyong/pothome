create table public.review_comments (
  id uuid primary key default gen_random_uuid(),
  author_name text not null check (char_length(btrim(author_name)) between 1 and 24),
  body text not null check (char_length(btrim(body)) between 1 and 1500),
  rating smallint not null check (rating between 1 and 5),
  like_count integer not null default 0 check (like_count >= 0),
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.review_comment_likes (
  comment_id uuid not null references public.review_comments(id) on delete cascade,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (comment_id, visitor_id)
);

create index review_comments_public_feed_idx
  on public.review_comments (created_at desc)
  where published is true;

alter table public.review_comments enable row level security;
alter table public.review_comment_likes enable row level security;

revoke all on table public.review_comments, public.review_comment_likes from anon, authenticated;

-- Local development uses server routes with direct database access. Public browser roles
-- cannot enumerate, write, or manipulate feedback records directly.
