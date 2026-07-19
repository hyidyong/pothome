begin;

select plan(57);

-- The public portfolio contract consists of exactly these seven application tables.
select has_table('public', 'site_profile', 'site_profile exists');
select has_table('public', 'case_studies', 'case_studies exists');
select has_table('public', 'case_study_metrics', 'case_study_metrics exists');
select has_table('public', 'case_study_sections', 'case_study_sections exists');
select has_table('public', 'experience_entries', 'experience_entries exists');
select has_table('public', 'tags', 'tags exists');
select has_table('public', 'case_study_tags', 'case_study_tags exists');

select ok(coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.site_profile')), false), 'site_profile has RLS enabled');
select ok(coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.case_studies')), false), 'case_studies has RLS enabled');
select ok(coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.case_study_metrics')), false), 'case_study_metrics has RLS enabled');
select ok(coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.case_study_sections')), false), 'case_study_sections has RLS enabled');
select ok(coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.experience_entries')), false), 'experience_entries has RLS enabled');
select ok(coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.tags')), false), 'tags has RLS enabled');
select ok(coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.case_study_tags')), false), 'case_study_tags has RLS enabled');

select results_eq(
  $$
    select count(*)::bigint
    from information_schema.columns
    where table_schema = 'public'
      and table_name in (
        'site_profile',
        'case_studies',
        'case_study_metrics',
        'case_study_sections',
        'experience_entries',
        'tags',
        'case_study_tags'
      )
      and column_name = 'id'
      and data_type = 'bigint'
      and is_identity = 'YES'
      and identity_generation = 'ALWAYS'
  $$,
  array[7::bigint],
  'all application tables use bigint generated always identity ids'
);

select results_eq(
  $$
    select count(*)::bigint
    from pg_constraint
    where contype = 'p'
      and conrelid in (
        to_regclass('public.site_profile'),
        to_regclass('public.case_studies'),
        to_regclass('public.case_study_metrics'),
        to_regclass('public.case_study_sections'),
        to_regclass('public.experience_entries'),
        to_regclass('public.tags'),
        to_regclass('public.case_study_tags')
      )
  $$,
  array[7::bigint],
  'all application tables have primary keys'
);

select results_eq(
  $$
    select count(*)::bigint
    from pg_constraint c
    cross join lateral unnest(c.conkey) as key(attnum)
    where c.contype = 'f'
      and c.connamespace = 'public'::regnamespace
      and c.conrelid in (
        to_regclass('public.case_study_metrics'),
        to_regclass('public.case_study_sections'),
        to_regclass('public.case_study_tags')
      )
      and not exists (
        select 1
        from pg_index i
        where i.indrelid = c.conrelid
          and key.attnum = any(i.indkey)
      )
  $$,
  array[0::bigint],
  'every foreign-key column is indexed'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'case_studies'
      and indexname = 'case_studies_published_order_idx'
      and indexdef ilike '%where (status = ''published''%'
  ),
  'published case ordering has a matching partial index'
);

select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = to_regclass('public.case_studies')
      and conname = 'case_studies_status_check'
  ),
  'case study status has a named constraint'
);

select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = to_regclass('public.case_study_sections')
      and conname = 'case_study_sections_kind_check'
  ),
  'section kind has a named constraint'
);

select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = to_regclass('public.case_study_metrics')
      and conname = 'case_study_metrics_source_status_check'
  ),
  'metric source status has a named constraint'
);

select ok(
  (
    select bool_and(has_table_privilege('anon', table_name, 'select'))
    from (values
      ('public.site_profile'),
      ('public.case_studies'),
      ('public.case_study_metrics'),
      ('public.case_study_sections'),
      ('public.experience_entries'),
      ('public.tags'),
      ('public.case_study_tags')
    ) as application_tables(table_name)
  ),
  'anon has explicit SELECT on all application tables'
);

select ok(
  (
    select bool_and(has_table_privilege('authenticated', table_name, 'select'))
    from (values
      ('public.site_profile'),
      ('public.case_studies'),
      ('public.case_study_metrics'),
      ('public.case_study_sections'),
      ('public.experience_entries'),
      ('public.tags'),
      ('public.case_study_tags')
    ) as application_tables(table_name)
  ),
  'authenticated has explicit SELECT on all application tables'
);

select ok(not has_table_privilege('anon', 'public.case_studies', 'insert'), 'anon cannot insert');
select ok(not has_table_privilege('anon', 'public.case_studies', 'update'), 'anon cannot update');
select ok(not has_table_privilege('anon', 'public.case_studies', 'delete'), 'anon cannot delete');
select ok(not has_table_privilege('authenticated', 'public.case_studies', 'insert'), 'authenticated cannot insert');
select ok(not has_table_privilege('authenticated', 'public.case_studies', 'update'), 'authenticated cannot update');
select ok(not has_table_privilege('authenticated', 'public.case_studies', 'delete'), 'authenticated cannot delete');

select ok(
  not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'S'
      and (
        has_sequence_privilege('anon', c.oid, 'usage')
        or has_sequence_privilege('authenticated', c.oid, 'usage')
      )
  ),
  'public read roles have no identity sequence usage'
);

select results_eq(
  $$
    select count(*)::bigint
    from pg_policy
    where polrelid in (
      to_regclass('public.site_profile'),
      to_regclass('public.case_studies'),
      to_regclass('public.case_study_metrics'),
      to_regclass('public.case_study_sections'),
      to_regclass('public.experience_entries'),
      to_regclass('public.tags'),
      to_regclass('public.case_study_tags')
    )
      and polcmd <> 'r'
  $$,
  array[0::bigint],
  'there are no insert, update, or delete policies'
);

select results_eq(
  $$select count(*)::bigint from public.site_profile where published is true$$,
  array[1::bigint],
  'one public site profile is seeded'
);

select results_eq(
  $$select count(*)::bigint from public.case_studies where status = 'published'$$,
  array[6::bigint],
  'six published cases are seeded'
);

select results_eq(
  $$select count(*)::bigint from public.case_study_metrics where verified is true$$,
  array[18::bigint],
  'exactly eighteen approved metrics are seeded'
);

select results_eq(
  $$
    select count(*)::bigint
    from public.case_study_metrics
    group by case_study_id
    order by case_study_id
  $$,
  $$values (3::bigint), (3::bigint), (3::bigint), (3::bigint), (3::bigint), (3::bigint)$$,
  'each case has exactly three evidence rows'
);

select results_eq(
  $$select count(distinct kind)::bigint from public.case_study_sections$$,
  array[9::bigint],
  'all nine approved narrative section kinds are represented'
);

select results_eq(
  $$select count(*)::bigint from public.tags$$,
  array[5::bigint],
  'five approved tags are seeded'
);

select results_eq(
  $$select title from public.case_studies order by display_order$$,
  $$values
    ('Global Technical Talent Strategy'::text),
    ('RE100 × CF100 Transition Strategy'::text),
    ('Fitory Market Validation'::text),
    ('PaceMate Academic OS'::text),
    ('Vietnam Beauty Growth Thesis'::text),
    ('AI Prediction Regulation'::text)
  $$,
  'the six cases retain the approved public order'
);

select results_eq(
  $$select headline from public.site_profile where published is true$$,
  $$values ('복잡한 신호를, 실행 가능한 전략으로.'::text)$$,
  'the approved strategy-first headline is exact'
);

select results_eq(
  $$
    select metrics.value_text, metrics.label
    from public.case_study_metrics as metrics
    join public.case_studies as cases on cases.id = metrics.case_study_id
    where cases.slug = 'global-technical-talent-strategy'
      and metrics.value_text = '21'
  $$,
  $$values ('21'::text, '개 기업'::text)$$,
  'the 21 metric is explicitly a company count'
);

select results_eq(
  $$
    select sections.body
    from public.case_study_sections as sections
    join public.case_studies as cases on cases.id = sections.case_study_id
    where cases.slug = 'global-technical-talent-strategy'
      and sections.kind = 'evidence'
  $$,
  $$values ('21개 기업과 유효 후보자 38명의 응답을 별도 표본으로 검토하고 13개국의 후보자 범위를 함께 기록했습니다.'::text)$$,
  'the talent evidence keeps company and candidate units separate'
);

select col_type_is(
  'public',
  'site_profile',
  'profile_focus',
  'jsonb',
  'profile focus is stored as structured jsonb'
);

select results_eq(
  $$select profile_focus from public.site_profile where published is true$$,
  $$values ('[
    {"role": "전략기획", "percentage": 65},
    {"role": "HR", "percentage": 20},
    {"role": "PM", "percentage": 15}
  ]'::jsonb)$$,
  'the approved role mix is seeded exactly'
);

select results_eq(
  $$
    select copy_key, copy_value
    from (
      select
        'summary'::text as copy_key,
        cases.summary as copy_value,
        0 as display_order
      from public.case_studies as cases
      where cases.slug = 'fitory-market-validation'

      union all

      select
        sections.kind as copy_key,
        sections.heading || E'\n' || sections.body as copy_value,
        sections.display_order
      from public.case_study_sections as sections
      join public.case_studies as cases
        on cases.id = sections.case_study_id
      where cases.slug = 'fitory-market-validation'
        and sections.kind in ('context', 'insight', 'recommendation', 'execution')
    ) as fitory_copy
    order by display_order
  $$,
  $$values
    (
      'summary'::text,
      '유휴 의류와 로컬 재고가 발견에서 대여·픽업까지 이어지는 과정의 마찰을 조사하고 순환 패션 MVP의 검증 범위를 좁힌 사례입니다.'::text
    ),
    (
      'context'::text,
      E'관심에서 문의·예약까지의 실제 행동 구분\n유휴 의류와 로컬 재고의 발견 신호가 실제 문의, 대여 예약, 픽업 행동으로 이어지는지 구분하며 순환 패션 MVP의 범위를 좁혀야 했습니다.'::text
    ),
    (
      'insight'::text,
      E'추천만으로는 행동 경로가 완성되지 않는다는 가설\n추천만으로는 충분하지 않으며 가까운 재고 확인, 예약, 로컬 픽업이 함께 연결되어야 한다는 가설을 다음 검증 대상으로 두었습니다.'::text
    ),
    (
      'recommendation'::text,
      E'추천에서 공급자 재고까지 잇는 흐름\nAI 코디 추천, 지도 탐색, 대여 예약, 로컬 픽업, 공급자 재고 관리로 이어지는 MVP 흐름을 우선 검증하도록 제안했습니다.'::text
    ),
    (
      'execution'::text,
      E'화면 흐름과 단계별 행동 검토\n화면 흐름과 MVP 프로토타입을 구성하고 조사, 메시지 반응, 문의 행동을 단계별로 검토했습니다.'::text
    )
  $$,
  'Fitory uses the approved circular-fashion decision narrative'
);

select ok(
  not exists (
    select 1
    from (
      select cases.summary as copy_value
      from public.case_studies as cases
      where cases.slug = 'fitory-market-validation'

      union all

      select sections.heading || ' ' || sections.body as copy_value
      from public.case_study_sections as sections
      join public.case_studies as cases
        on cases.id = sections.case_study_id
      where cases.slug = 'fitory-market-validation'
    ) as fitory_copy
    where fitory_copy.copy_value ~ '(운동|주간[[:space:]]*계획|계획[[:space:]]*수정|피드백[[:space:]]*루프)'
  ),
  'Fitory contains no exercise or weekly-planning narrative'
);

-- Add non-public fixtures inside this transaction so the policies are exercised as anon.
insert into public.site_profile (slug, headline, summary, profile_focus, published)
values (
  'hidden-profile',
  'Hidden profile',
  'Must remain private.',
  '[{"role": "Hidden", "percentage": 100}]'::jsonb,
  false
);

insert into public.case_studies (
  slug,
  title,
  summary,
  category,
  evidence_status,
  status,
  display_order,
  featured
)
values (
  'hidden-draft-case',
  'Hidden draft case',
  'Must remain private.',
  'Test',
  'unpublished draft',
  'draft',
  99,
  false
);

insert into public.case_study_metrics (
  case_study_id,
  value_text,
  label,
  source_status,
  verified,
  display_order
)
select id, '1', 'hidden draft metric', 'unpublished_draft', true, 1
from public.case_studies
where slug = 'hidden-draft-case';

insert into public.case_study_metrics (
  case_study_id,
  value_text,
  label,
  source_status,
  verified,
  display_order
)
select id, '1', 'hidden unverified metric', 'documented_project', false, 99
from public.case_studies
where slug = 'global-technical-talent-strategy';

insert into public.case_study_sections (
  case_study_id,
  kind,
  heading,
  body,
  display_order
)
select id, 'limits', 'Hidden section', 'Must remain private.', 1
from public.case_studies
where slug = 'hidden-draft-case';

insert into public.tags (slug, name)
values ('unused-hidden-tag', 'Unused hidden tag');

insert into public.case_study_tags (case_study_id, tag_id)
select c.id, t.id
from public.case_studies c
cross join public.tags t
where c.slug = 'hidden-draft-case'
  and t.slug = 'unused-hidden-tag';

insert into public.experience_entries (
  slug,
  title,
  period_label,
  summary,
  display_order,
  published
)
values (
  'hidden-experience',
  'Hidden experience',
  'Private',
  'Must remain private.',
  99,
  false
);

set local role anon;

select results_eq(
  $$select count(*)::bigint from public.case_studies$$,
  array[6::bigint],
  'anon sees exactly the six published cases'
);

select results_eq(
  $$select count(*)::bigint from public.case_study_metrics$$,
  array[18::bigint],
  'anon sees exactly the eighteen verified metrics of published cases'
);

select results_eq(
  $$select count(*)::bigint from public.case_studies where slug = 'hidden-draft-case'$$,
  array[0::bigint],
  'anon cannot see a draft case'
);

select results_eq(
  $$select count(*)::bigint from public.case_study_metrics where label = 'hidden draft metric'$$,
  array[0::bigint],
  'anon cannot see a verified metric whose parent is draft'
);

select results_eq(
  $$select count(*)::bigint from public.case_study_metrics where label = 'hidden unverified metric'$$,
  array[0::bigint],
  'anon cannot see an unverified metric whose parent is published'
);

select results_eq(
  $$select count(*)::bigint from public.case_study_sections where heading = 'Hidden section'$$,
  array[0::bigint],
  'anon cannot see a section whose parent is draft'
);

select results_eq(
  $$
    select count(*)::bigint
    from public.case_study_tags cst
    join public.tags t on t.id = cst.tag_id
    where t.slug = 'unused-hidden-tag'
  $$,
  array[0::bigint],
  'anon cannot see a tag join whose parent is draft'
);

select results_eq(
  $$select count(*)::bigint from public.tags where slug = 'unused-hidden-tag'$$,
  array[0::bigint],
  'anon cannot see a tag unused by published cases'
);

select results_eq(
  $$select count(*)::bigint from public.site_profile where slug = 'hidden-profile'$$,
  array[0::bigint],
  'anon cannot see an unpublished site profile'
);

select results_eq(
  $$select count(*)::bigint from public.experience_entries where slug = 'hidden-experience'$$,
  array[0::bigint],
  'anon cannot see an unpublished experience entry'
);

select results_eq(
  $$select count(*)::bigint from public.site_profile$$,
  array[1::bigint],
  'anon sees the single published site profile'
);

select results_eq(
  $$select count(*)::bigint from public.tags$$,
  array[5::bigint],
  'anon sees only tags joined to a published case'
);

select * from finish();
rollback;
