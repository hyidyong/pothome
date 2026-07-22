insert into public.experience_entries (
  slug, title, period_label, summary, display_order, published,
  section, display_year, entry_kind, organization, role, evidence_note, case_study_slug
)
values (
  'korean-history-proficiency-level-3',
  '한국사능력검정시험 3급',
  '취득 시기 확인 중',
  '한국사능력검정시험 3급을 취득했습니다.',
  2,
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
