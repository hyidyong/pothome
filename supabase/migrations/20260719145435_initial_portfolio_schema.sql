create table public.site_profile (
  id bigint generated always as identity,
  slug text not null,
  headline text not null,
  summary text not null,
  role_focus text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_profile_pkey primary key (id),
  constraint site_profile_slug_key unique (slug),
  constraint site_profile_slug_not_blank_check check (btrim(slug) <> ''),
  constraint site_profile_headline_not_blank_check check (btrim(headline) <> ''),
  constraint site_profile_summary_not_blank_check check (btrim(summary) <> ''),
  constraint site_profile_role_focus_not_blank_check check (btrim(role_focus) <> '')
);

create table public.case_studies (
  id bigint generated always as identity,
  slug text not null,
  title text not null,
  summary text not null,
  category text not null,
  evidence_status text not null,
  status text not null default 'draft',
  display_order smallint not null,
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint case_studies_pkey primary key (id),
  constraint case_studies_slug_key unique (slug),
  constraint case_studies_slug_not_blank_check check (btrim(slug) <> ''),
  constraint case_studies_title_not_blank_check check (btrim(title) <> ''),
  constraint case_studies_summary_not_blank_check check (btrim(summary) <> ''),
  constraint case_studies_category_not_blank_check check (btrim(category) <> ''),
  constraint case_studies_evidence_status_not_blank_check check (btrim(evidence_status) <> ''),
  constraint case_studies_status_check check (status in ('draft', 'published', 'archived')),
  constraint case_studies_display_order_check check (display_order > 0),
  constraint case_studies_published_at_check check (status <> 'published' or published_at is not null)
);

create table public.case_study_metrics (
  id bigint generated always as identity,
  case_study_id bigint not null,
  value_text text not null,
  label text not null,
  source_status text not null,
  verified boolean not null default false,
  display_order smallint not null,
  created_at timestamptz not null default now(),
  constraint case_study_metrics_pkey primary key (id),
  constraint case_study_metrics_case_study_id_fkey
    foreign key (case_study_id) references public.case_studies (id) on delete cascade,
  constraint case_study_metrics_case_order_key unique (case_study_id, display_order),
  constraint case_study_metrics_value_text_not_blank_check check (btrim(value_text) <> ''),
  constraint case_study_metrics_label_not_blank_check check (btrim(label) <> ''),
  constraint case_study_metrics_source_status_check check (
    source_status in (
      'documented_project',
      'exploratory_research',
      'proposal_prototype',
      'independent_research',
      'unpublished_draft'
    )
  ),
  constraint case_study_metrics_display_order_check check (display_order > 0)
);

create table public.case_study_sections (
  id bigint generated always as identity,
  case_study_id bigint not null,
  kind text not null,
  heading text not null,
  body text not null,
  display_order smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint case_study_sections_pkey primary key (id),
  constraint case_study_sections_case_study_id_fkey
    foreign key (case_study_id) references public.case_studies (id) on delete cascade,
  constraint case_study_sections_case_kind_key unique (case_study_id, kind),
  constraint case_study_sections_kind_check check (
    kind in ('challenge', 'evidence', 'insight', 'recommendation', 'execution', 'limits')
  ),
  constraint case_study_sections_heading_not_blank_check check (btrim(heading) <> ''),
  constraint case_study_sections_body_not_blank_check check (btrim(body) <> ''),
  constraint case_study_sections_display_order_check check (display_order > 0)
);

create table public.experience_entries (
  id bigint generated always as identity,
  slug text not null,
  title text not null,
  period_label text not null,
  summary text not null,
  display_order smallint not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint experience_entries_pkey primary key (id),
  constraint experience_entries_slug_key unique (slug),
  constraint experience_entries_slug_not_blank_check check (btrim(slug) <> ''),
  constraint experience_entries_title_not_blank_check check (btrim(title) <> ''),
  constraint experience_entries_period_label_not_blank_check check (btrim(period_label) <> ''),
  constraint experience_entries_summary_not_blank_check check (btrim(summary) <> ''),
  constraint experience_entries_display_order_check check (display_order > 0)
);

create table public.tags (
  id bigint generated always as identity,
  slug text not null,
  name text not null,
  created_at timestamptz not null default now(),
  constraint tags_pkey primary key (id),
  constraint tags_slug_key unique (slug),
  constraint tags_name_key unique (name),
  constraint tags_slug_not_blank_check check (btrim(slug) <> ''),
  constraint tags_name_not_blank_check check (btrim(name) <> '')
);

create table public.case_study_tags (
  id bigint generated always as identity,
  case_study_id bigint not null,
  tag_id bigint not null,
  created_at timestamptz not null default now(),
  constraint case_study_tags_pkey primary key (id),
  constraint case_study_tags_case_study_id_fkey
    foreign key (case_study_id) references public.case_studies (id) on delete cascade,
  constraint case_study_tags_tag_id_fkey
    foreign key (tag_id) references public.tags (id) on delete cascade,
  constraint case_study_tags_case_tag_key unique (case_study_id, tag_id)
);

create index case_studies_published_order_idx
  on public.case_studies (display_order, id)
  where status = 'published';

create index case_study_tags_tag_id_idx
  on public.case_study_tags (tag_id);

alter table public.site_profile enable row level security;
alter table public.case_studies enable row level security;
alter table public.case_study_metrics enable row level security;
alter table public.case_study_sections enable row level security;
alter table public.experience_entries enable row level security;
alter table public.tags enable row level security;
alter table public.case_study_tags enable row level security;

revoke all on table
  public.site_profile,
  public.case_studies,
  public.case_study_metrics,
  public.case_study_sections,
  public.experience_entries,
  public.tags,
  public.case_study_tags
from anon, authenticated;

grant select on table
  public.site_profile,
  public.case_studies,
  public.case_study_metrics,
  public.case_study_sections,
  public.experience_entries,
  public.tags,
  public.case_study_tags
to anon, authenticated;

revoke all on sequence
  public.site_profile_id_seq,
  public.case_studies_id_seq,
  public.case_study_metrics_id_seq,
  public.case_study_sections_id_seq,
  public.experience_entries_id_seq,
  public.tags_id_seq,
  public.case_study_tags_id_seq
from anon, authenticated;

create policy "published site profile is public"
on public.site_profile
for select
to anon, authenticated
using (published is true);

create policy "published cases are public"
on public.case_studies
for select
to anon, authenticated
using (status = 'published');

create policy "verified metrics of published cases are public"
on public.case_study_metrics
for select
to anon, authenticated
using (
  verified is true
  and exists (
    select 1
    from public.case_studies as parent_case
    where parent_case.id = case_study_metrics.case_study_id
      and parent_case.status = 'published'
  )
);

create policy "sections of published cases are public"
on public.case_study_sections
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.case_studies as parent_case
    where parent_case.id = case_study_sections.case_study_id
      and parent_case.status = 'published'
  )
);

create policy "published experience entries are public"
on public.experience_entries
for select
to anon, authenticated
using (published is true);

create policy "tags used by published cases are public"
on public.tags
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.case_study_tags as joined_tag
    join public.case_studies as parent_case
      on parent_case.id = joined_tag.case_study_id
    where joined_tag.tag_id = tags.id
      and parent_case.status = 'published'
  )
);

create policy "tag joins of published cases are public"
on public.case_study_tags
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.case_studies as parent_case
    where parent_case.id = case_study_tags.case_study_id
      and parent_case.status = 'published'
  )
);
