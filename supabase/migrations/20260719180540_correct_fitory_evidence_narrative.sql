begin;

do $migration$
declare
  fitory_case_id bigint;
begin
  select id
  into strict fitory_case_id
  from public.case_studies
  where slug = 'fitory-market-validation';

  if (
    select count(*)
    from public.case_study_sections
    where case_study_id = fitory_case_id
      and kind in ('challenge', 'insight', 'recommendation', 'execution')
  ) <> 4 then
    raise exception 'Fitory corrective migration expected four narrative sections';
  end if;
end
$migration$;

update public.case_studies
set summary = '유휴 의류와 로컬 재고가 발견에서 대여·픽업까지 이어지는 과정의 마찰을 조사하고 순환 패션 MVP의 검증 범위를 좁힌 사례입니다.'
where slug = 'fitory-market-validation'
  and summary is distinct from '유휴 의류와 로컬 재고가 발견에서 대여·픽업까지 이어지는 과정의 마찰을 조사하고 순환 패션 MVP의 검증 범위를 좁힌 사례입니다.';

with approved_copy (kind, heading, body) as (
  values
    (
      'challenge'::text,
      '관심에서 문의·예약까지의 실제 행동 구분'::text,
      '유휴 의류와 로컬 재고의 발견 신호가 실제 문의, 대여 예약, 픽업 행동으로 이어지는지 구분하며 순환 패션 MVP의 범위를 좁혀야 했습니다.'::text
    ),
    (
      'insight'::text,
      '추천만으로는 행동 경로가 완성되지 않는다는 가설'::text,
      '추천만으로는 충분하지 않으며 가까운 재고 확인, 예약, 로컬 픽업이 함께 연결되어야 한다는 가설을 다음 검증 대상으로 두었습니다.'::text
    ),
    (
      'recommendation'::text,
      '추천에서 공급자 재고까지 잇는 흐름'::text,
      'AI 코디 추천, 지도 탐색, 대여 예약, 로컬 픽업, 공급자 재고 관리로 이어지는 MVP 흐름을 우선 검증하도록 제안했습니다.'::text
    ),
    (
      'execution'::text,
      '화면 흐름과 단계별 행동 검토'::text,
      '화면 흐름과 MVP 프로토타입을 구성하고 조사, 메시지 반응, 문의 행동을 단계별로 검토했습니다.'::text
    )
)
update public.case_study_sections as sections
set
  heading = approved_copy.heading,
  body = approved_copy.body
from public.case_studies as cases,
  approved_copy
where cases.slug = 'fitory-market-validation'
  and sections.case_study_id = cases.id
  and sections.kind = approved_copy.kind
  and (sections.heading, sections.body) is distinct from (approved_copy.heading, approved_copy.body);

commit;
