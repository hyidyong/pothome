begin;
select plan(13);

select has_column('public', 'experience_entries', 'section', 'resume section is stored');
select has_column('public', 'experience_entries', 'display_year', 'resume year is stored');
select has_column('public', 'experience_entries', 'entry_kind', 'resume kind is stored');
select has_column('public', 'experience_entries', 'organization', 'resume organization is stored');
select has_column('public', 'experience_entries', 'role', 'resume role is stored');
select has_column('public', 'experience_entries', 'evidence_note', 'resume evidence note is stored');
select results_eq(
  $$select display_year from (select distinct display_year from public.experience_entries where section = 'timeline') years order by display_year desc$$,
  array[2026::smallint, 2025::smallint, 2024::smallint, 2023::smallint],
  'public experience timeline contains 2026 through 2023 in descending order'
);
select ok(exists (select 1 from public.experience_entries where slug = 'ylc-hr-deputy-2026' and display_year = 2026), '2026 YLC HR activity is public');
select ok(exists (select 1 from public.experience_entries where slug = 'substudy-product-project-2026' and display_year = 2026), '2026 Substudy project is public');
select results_eq($$select count(*)::bigint from public.experience_entries where section = 'training' and published$$, array[12::bigint], 'twelve education and training records are public');
select ok(exists (select 1 from public.experience_entries where slug = 'driver-license-2025' and section = 'credential' and published), 'public driving licence credential is stored separately');
select results_eq($$select title from public.experience_entries where section = 'credential' order by display_order$$, $$values ('1종 보통 운전면허'::text), ('한국사능력검정시험 3급'::text)$$, 'public credential titles are exact');
select is_empty($$select 1 from public.experience_entries where slug in ('strategy-research-decision-design', 'people-strategy-talent-systems', 'product-discovery-execution', 'legal-research-strategy-lens')$$, 'legacy generic resume rows are removed');
select * from finish();
rollback;
