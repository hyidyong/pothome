begin;

select plan(4);

select is(
  (
    select count(*)::integer
    from public.case_study_sections as sections
    join public.case_studies as cases
      on cases.id = sections.case_study_id
    where cases.status = 'published'
  ),
  45,
  'each of the five published cases has nine narrative sections'
);

select ok(
  not exists (
    select 1
    from public.case_study_sections
    where kind = 'challenge'
  ),
  'the legacy challenge kind is replaced by context'
);

select results_eq(
  $$
    select kind
    from public.case_study_sections as sections
    join public.case_studies as cases
      on cases.id = sections.case_study_id
    where cases.slug = 'global-technical-talent-strategy'
    order by sections.display_order
  $$,
  $$values
    ('decision'::text),
    ('context'::text),
    ('evidence'::text),
    ('insight'::text),
    ('options'::text),
    ('recommendation'::text),
    ('execution'::text),
    ('limits'::text),
    ('contribution'::text)
  $$,
  'case narratives use the complete decision-to-contribution order'
);

select ok(
  not exists (
    select 1
    from public.case_study_sections
    where btrim(heading) = '' or btrim(body) = ''
  ),
  'every narrative section stores its own heading and body'
);

select * from finish();
rollback;
