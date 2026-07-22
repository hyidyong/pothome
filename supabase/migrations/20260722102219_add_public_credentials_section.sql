alter table public.experience_entries
  drop constraint experience_entries_section_check,
  add constraint experience_entries_section_check check (section in ('timeline', 'training', 'credential'));

alter table public.experience_entries
  drop constraint experience_entries_entry_kind_check,
  add constraint experience_entries_entry_kind_check check (entry_kind in ('work', 'project', 'activity', 'award', 'education', 'training', 'credential'));

alter table public.experience_entries
  drop constraint experience_entries_section_shape_check,
  add constraint experience_entries_section_shape_check check (
    (section = 'timeline' and display_year is not null and entry_kind not in ('training', 'education', 'credential'))
    or (section = 'training' and display_year is null and entry_kind in ('training', 'education'))
    or (section = 'credential' and display_year is null and entry_kind = 'credential')
  );

insert into public.experience_entries (
  slug, title, period_label, summary, display_order, published,
  section, display_year, entry_kind, organization, role, evidence_note, case_study_slug
)
values (
  'driver-license-2025',
  '자동차 운전면허',
  '2025년 7월경',
  '자동차 운전면허를 취득했습니다.',
  1,
  true,
  'credential',
  null,
  'credential',
  null,
  null,
  null,
  null
)
on conflict (slug) do update
set
  title = excluded.title,
  period_label = excluded.period_label,
  summary = excluded.summary,
  display_order = excluded.display_order,
  published = excluded.published,
  section = excluded.section,
  display_year = excluded.display_year,
  entry_kind = excluded.entry_kind,
  organization = excluded.organization,
  role = excluded.role,
  evidence_note = excluded.evidence_note,
  case_study_slug = excluded.case_study_slug;
