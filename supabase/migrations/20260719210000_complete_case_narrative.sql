begin;

alter table public.case_study_sections
  drop constraint if exists case_study_sections_kind_check;

update public.case_study_sections
set kind = 'context'
where kind = 'challenge';

update public.case_study_sections
set display_order = case kind
  when 'context' then 2
  when 'evidence' then 3
  when 'insight' then 4
  when 'recommendation' then 6
  when 'execution' then 7
  when 'limits' then 8
end
where kind in ('context', 'evidence', 'insight', 'recommendation', 'execution', 'limits');

with narrative_copy (case_slug, kind, heading, body, display_order) as (
  values
    (
      'global-technical-talent-strategy'::text,
      'decision'::text,
      '양면 퍼널의 연결 병목을 우선하다'::text,
      '채용 병목을 기업 수요와 해외 후보자 경험의 양면 퍼널로 나누고, 연결 단계의 정보와 책임 공백을 먼저 해결하기로 했습니다.'::text,
      1::smallint
    ),
    (
      'global-technical-talent-strategy',
      'options',
      '유입 확대와 단계별 지원 운영 비교',
      '단일 인재 풀 확대, 정보 제공 강화, 단계별 지원 운영을 비교하고 양측 판단 비용과 실행 책임의 명확성을 기준으로 삼았습니다.',
      5
    ),
    (
      'global-technical-talent-strategy',
      'contribution',
      '양면 리서치에서 실행 문서까지',
      '기업과 후보자 신호를 분리해 분석하고, 단계별 질문과 지표, 안내 항목이 이어지는 실행 문서 구조를 설계했습니다.',
      9
    ),
    (
      're100-cf100-transition-strategy',
      'decision',
      '측정 가능한 순서로 전환하다',
      '연간 RE100 달성 선언과 CF100 지향을 분리해, 측정 기준이 확보되는 순서대로 전환 경로를 설계하기로 했습니다.',
      1
    ),
    (
      're100-cf100-transition-strategy',
      'options',
      '목표, 측정, 조달 경로 비교',
      '목표 선언 중심, 시간 단위 측정 선행, 조달 포트폴리오 병행안을 데이터 가용성, 검증 가능성, 운영 부담으로 비교했습니다.',
      5
    ),
    (
      're100-cf100-transition-strategy',
      'contribution',
      '근거 교차 검토와 체크포인트 설계',
      '분석 결과와 인터뷰, 해외 자료를 교차 검토하고 단계별 데이터, 역할, 진입 조건을 의사결정 체크포인트로 정리했습니다.',
      9
    ),
    (
      'fitory-market-validation',
      'decision',
      '추천에서 로컬 행동 경로로',
      '순환 패션 MVP를 추천 기능에 한정하지 않고, 로컬 재고 확인에서 예약과 픽업까지 이어지는 행동 경로로 검증하기로 했습니다.',
      1
    ),
    (
      'fitory-market-validation',
      'options',
      '추천, 탐색, 대여 연결안 비교',
      '추천 단독, 지도 탐색, 대여와 픽업 연결안을 실제 문의 가능성, 재고 확인성, 다음 실험 용이성으로 비교했습니다.',
      5
    ),
    (
      'fitory-market-validation',
      'contribution',
      '화면 흐름과 검증 질문 설계',
      '화면 흐름과 MVP 프로토타입을 구성하고 조사, 메시지 반응, 문의 행동을 구분해 다음 검증 질문을 설계했습니다.',
      9
    ),
    (
      'pacemate-academic-os',
      'decision',
      '역할 충돌을 푸는 주간 루프',
      '기능을 늘리기보다 역할 간 충돌을 조정하는 주간 의사결정 루프를 제품의 중심 구조로 두었습니다.',
      1
    ),
    (
      'pacemate-academic-os',
      'options',
      '일정, 역할 보드, 운영 루프 비교',
      '일정 통합, 역할별 보드, 주간 운영 루프를 충돌 발견, 우선순위 판단, 회고 연결성으로 비교했습니다.',
      5
    ),
    (
      'pacemate-academic-os',
      'contribution',
      '로드맵과 화면 흐름 구조화',
      '역할별 요구를 로드맵에 배치하고 핵심 화면 흐름과 단계별 검증 항목을 구조화했습니다.',
      9
    ),
    (
      'vietnam-beauty-growth-thesis',
      'decision',
      '발견과 구매 확신의 채널을 나누다',
      '발견 채널과 구매 확신 채널을 분리해, 채널별 역할에 맞춘 진입 순서를 설계하기로 했습니다.',
      1
    ),
    (
      'vietnam-beauty-growth-thesis',
      'options',
      '집중, 동시 확장, 역할 분담 비교',
      '단일 채널 집중, 동시 확장, 발견과 비교의 역할 분담안을 메시지 적합성, 구매 확신, 검증 가능성으로 비교했습니다.',
      5
    ),
    (
      'vietnam-beauty-growth-thesis',
      'contribution',
      '채널 신호와 단계별 가설 연결',
      '전략 연구의 채널 신호를 정리하고 TikTok Shop과 Shopee의 역할을 단계별 가설과 중단 조건에 연결했습니다.',
      9
    ),
    (
      'ai-prediction-regulation',
      'decision',
      '사용 맥락과 권리 영향으로 판단하다',
      '모델 유형보다 사용 맥락과 권리 영향에 따라 위험을 판단하는 단계별 검토 모델을 중심으로 제안했습니다.',
      1
    ),
    (
      'ai-prediction-regulation',
      'options',
      '기술, 국가, 사용 단계 기준 비교',
      '기술 유형 중심, 국가별 규정 나열, 사용 단계별 검토를 비교하고 설명 가능성, 권리 영향, 적용 가능성을 기준으로 삼았습니다.',
      5
    ),
    (
      'ai-prediction-regulation',
      'contribution',
      '비교 근거를 검토 질문으로 구조화',
      '비교 관할의 근거를 검토해 입력, 예측, 의사결정 사용 단계의 질문으로 구조화했습니다.',
      9
    )
)
insert into public.case_study_sections (
  case_study_id,
  kind,
  heading,
  body,
  display_order
)
select
  cases.id,
  narrative_copy.kind,
  narrative_copy.heading,
  narrative_copy.body,
  narrative_copy.display_order
from narrative_copy
join public.case_studies as cases
  on cases.slug = narrative_copy.case_slug
on conflict (case_study_id, kind) do update
set
  heading = excluded.heading,
  body = excluded.body,
  display_order = excluded.display_order;

do $migration$
begin
  if exists (
    select 1
    from public.case_studies as cases
    left join public.case_study_sections as sections
      on sections.case_study_id = cases.id
    where cases.status = 'published'
    group by cases.id
    having count(sections.id) <> 9
  ) then
    raise exception 'Published case studies must each have nine narrative sections';
  end if;
end
$migration$;

alter table public.case_study_sections
  add constraint case_study_sections_kind_check check (
    kind in (
      'decision',
      'context',
      'evidence',
      'insight',
      'options',
      'recommendation',
      'execution',
      'limits',
      'contribution'
    )
  );

commit;
