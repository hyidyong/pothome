insert into public.site_profile (
  slug,
  headline,
  summary,
  role_focus,
  published
)
values (
  'strategy-portfolio',
  '복잡한 신호를, 실행 가능한 전략으로.',
  '법학의 구조적 사고로 쟁점과 이해관계자를 구분하고, 검증된 근거를 선택지와 실행안으로 연결합니다.',
  '전략기획 65% · People Strategy 20% · Product Execution 15%',
  true
);

insert into public.case_studies (
  slug,
  title,
  summary,
  category,
  evidence_status,
  status,
  display_order,
  featured,
  published_at
)
values
  (
    'global-technical-talent-strategy',
    'Global Technical Talent Strategy',
    '기업 수요와 해외 기술인재 후보자 경험을 서로 다른 표본으로 읽고 채용 퍼널의 우선 과제를 구조화한 전략 사례입니다.',
    'People Strategy',
    '실측 표본과 제안 단계를 분리한 문서화된 프로젝트',
    'published',
    1,
    true,
    timestamptz '2026-07-19 00:00:00+09'
  ),
  (
    're100-cf100-transition-strategy',
    'RE100 × CF100 Transition Strategy',
    '연간 재생에너지 목표와 시간 단위 무탄소 전력 기준의 차이를 비교해 단계적 전환 선택지를 설계한 사례입니다.',
    'Transition Strategy',
    '문서화된 프로젝트 · 기업 채택 여부 미확인',
    'published',
    2,
    true,
    timestamptz '2026-07-19 00:00:00+09'
  ),
  (
    'fitory-market-validation',
    'Fitory Market Validation',
    '운동 지속의 문제를 정량·심층 조사와 스모크테스트로 검토하고 초기 제품 가설을 좁힌 사례입니다.',
    'Product Strategy',
    '탐색적 조사와 스모크테스트 · 시장성 확정 아님',
    'published',
    3,
    true,
    timestamptz '2026-07-19 00:00:00+09'
  ),
  (
    'pacemate-academic-os',
    'PaceMate Academic OS',
    '학업과 프로젝트를 함께 운영하는 사용자의 역할을 정의하고 우선순위와 실행 로드맵을 설계한 제품 제안입니다.',
    'Product Execution',
    '제안·프로토타입과 데모 · 실제 도입 성과 미검증',
    'published',
    4,
    false,
    timestamptz '2026-07-19 00:00:00+09'
  ),
  (
    'vietnam-beauty-growth-thesis',
    'Vietnam Beauty Growth Thesis',
    '베트남 뷰티 커머스의 발견과 비교 채널을 구분하고 시장 진입 논리를 정리한 독립 전략 연구입니다.',
    'Market Research',
    '독립 전략 연구 · 기업 의뢰 프로젝트 아님',
    'published',
    5,
    false,
    timestamptz '2026-07-19 00:00:00+09'
  ),
  (
    'ai-prediction-regulation',
    'AI Prediction Regulation',
    'AI 예측 서비스의 규제 쟁점을 비교법 관점에서 분해하고 단계별 검토 모델을 제안한 연구입니다.',
    'Legal Strategy',
    '연구 초안 · 미게재·미심사',
    'published',
    6,
    false,
    timestamptz '2026-07-19 00:00:00+09'
  );

insert into public.case_study_metrics (
  case_study_id,
  value_text,
  label,
  source_status,
  verified,
  display_order
)
select
  cases.id,
  evidence.value_text,
  evidence.label,
  evidence.source_status,
  true,
  evidence.display_order
from (
  values
    ('global-technical-talent-strategy', '21', '기업 응답', 'documented_project', 1),
    ('global-technical-talent-strategy', '38', '유효 후보자 응답', 'documented_project', 2),
    ('global-technical-talent-strategy', '13', '개국', 'documented_project', 3),
    ('re100-cf100-transition-strategy', '57', '분석 결과', 'documented_project', 1),
    ('re100-cf100-transition-strategy', '2', '인터뷰', 'documented_project', 2),
    ('re100-cf100-transition-strategy', '27', '해외자료', 'documented_project', 3),
    ('fitory-market-validation', '118', '정량 응답', 'exploratory_research', 1),
    ('fitory-market-validation', '43', '심층 응답', 'exploratory_research', 2),
    ('fitory-market-validation', '51분', '첫 문의', 'exploratory_research', 3),
    ('pacemate-academic-os', '4', '사용자 역할', 'proposal_prototype', 1),
    ('pacemate-academic-os', '15주', '로드맵', 'proposal_prototype', 2),
    ('pacemate-academic-os', '2인', '팀', 'proposal_prototype', 3),
    ('vietnam-beauty-growth-thesis', '51장', '전략 덱', 'independent_research', 1),
    ('vietnam-beauty-growth-thesis', 'TikTok Shop', '발견·증명 채널', 'independent_research', 2),
    ('vietnam-beauty-growth-thesis', 'Shopee', '비교·확신 채널', 'independent_research', 3),
    ('ai-prediction-regulation', '2', '핵심 비교국', 'unpublished_draft', 1),
    ('ai-prediction-regulation', '1', '보조 사례', 'unpublished_draft', 2),
    ('ai-prediction-regulation', '3단계', '모델', 'unpublished_draft', 3)
) as evidence(case_slug, value_text, label, source_status, display_order)
join public.case_studies as cases
  on cases.slug = evidence.case_slug;

insert into public.case_study_sections (
  case_study_id,
  kind,
  heading,
  body,
  display_order
)
select
  cases.id,
  sections.kind,
  sections.heading,
  sections.body,
  sections.display_order
from (
  values
    (
      'global-technical-talent-strategy',
      'challenge',
      '서로 다른 신호를 한 퍼널로 읽기',
      '기업의 채용 수요와 해외 후보자의 이동·지원 경험을 섞지 않고 각각의 병목으로 정의해야 했습니다.',
      1
    ),
    (
      'global-technical-talent-strategy',
      'evidence',
      '양면 리서치',
      '기업 응답과 유효 후보자 응답을 별도 표본으로 검토하고 응답 국가 범위를 함께 기록했습니다.',
      2
    ),
    (
      'global-technical-talent-strategy',
      'insight',
      '채용은 유입보다 연결의 문제',
      '직무 정보, 체류 조건, 선발 절차가 분절될수록 후보자의 판단 비용과 기업의 탐색 비용이 함께 커진다고 보았습니다.',
      3
    ),
    (
      'global-technical-talent-strategy',
      'recommendation',
      '단계별 정보와 지원 설계',
      '관심 형성, 지원 판단, 선발, 정착의 각 단계에서 필요한 정보와 책임 주체를 분리해 제안했습니다.',
      4
    ),
    (
      'global-technical-talent-strategy',
      'execution',
      '퍼널 운영 문서',
      '측정 지표, 단계별 질문, 후보자 안내 항목을 한 실행 문서에 연결하는 방식을 설계했습니다.',
      5
    ),
    (
      'global-technical-talent-strategy',
      'limits',
      '제안 단계의 한계',
      '조사 범위와 전략 제안은 문서화했지만 실제 채용 도입이나 장기 성과는 확인하지 않았습니다.',
      6
    ),
    (
      're100-cf100-transition-strategy',
      'challenge',
      '연간 목표와 시간 단위 기준의 간극',
      'RE100 달성과 CF100 지향 사이의 정의, 데이터, 조달 선택지를 하나의 전환 문제로 정리해야 했습니다.',
      1
    ),
    (
      're100-cf100-transition-strategy',
      'evidence',
      '문서와 인터뷰의 교차 확인',
      '4주 동안 3인 팀이 분석 결과, 인터뷰, 해외자료를 비교해 기준 차이와 실행 조건을 문서화했습니다.',
      2
    ),
    (
      're100-cf100-transition-strategy',
      'insight',
      '목표 선언보다 전환 순서',
      '데이터 가용성과 조달 수단이 다른 상황에서는 동일한 목표보다 검증 가능한 전환 순서가 중요하다고 판단했습니다.',
      3
    ),
    (
      're100-cf100-transition-strategy',
      'recommendation',
      '측정에서 조달로 이어지는 단계안',
      '기준선 정리, 시간 단위 측정, 조달 포트폴리오 검토를 순차적으로 진행하는 선택지를 제시했습니다.',
      4
    ),
    (
      're100-cf100-transition-strategy',
      'execution',
      '판단 기준과 체크포인트',
      '각 단계의 필요 데이터, 담당 역할, 다음 단계 진입 조건을 의사결정 체크포인트로 정리했습니다.',
      5
    ),
    (
      're100-cf100-transition-strategy',
      'limits',
      '채택 여부 미확인',
      '프로젝트 산출물과 조사 범위는 확인했지만 특정 기업의 채택이나 운영 결과는 확인하지 않았습니다.',
      6
    ),
    (
      'fitory-market-validation',
      'challenge',
      '운동 지속 문제의 실제 수요 확인',
      '관심 표현과 반복 사용 의도를 구분하면서 초기 가설을 빠르게 검증해야 했습니다.',
      1
    ),
    (
      'fitory-market-validation',
      'evidence',
      '정량·심층 조사와 스모크테스트',
      '정량 응답, 심층 응답, 첫 문의 시간과 2.57% 스모크테스트 결과를 서로 다른 근거로 기록했습니다.',
      2
    ),
    (
      'fitory-market-validation',
      'insight',
      '의지는 기능보다 맥락에 묶인다',
      '사용자가 원하는 것은 계획 자체보다 상황 변화에 맞춰 다음 행동을 다시 정하는 지원이라고 해석했습니다.',
      3
    ),
    (
      'fitory-market-validation',
      'recommendation',
      '좁은 반복 행동부터 검증',
      '전체 운동 플랫폼보다 주간 계획 수정과 피드백 루프를 먼저 검증하는 제품 범위를 제안했습니다.',
      4
    ),
    (
      'fitory-market-validation',
      'execution',
      '가설별 실험 순서',
      '문제 인터뷰, 메시지 반응, 문의 행동을 순서대로 확인하고 다음 실험 조건을 명시했습니다.',
      5
    ),
    (
      'fitory-market-validation',
      'limits',
      '탐색 결과의 한계',
      '조사와 스모크테스트는 초기 신호이며 시장성, 반복 사용, 사업 성과를 확정하는 근거가 아닙니다.',
      6
    ),
    (
      'pacemate-academic-os',
      'challenge',
      '겹치는 역할과 우선순위 충돌',
      '학업, 프로젝트, 협업, 회복의 역할이 한 주 안에서 충돌할 때 무엇을 먼저 조정할지 정의해야 했습니다.',
      1
    ),
    (
      'pacemate-academic-os',
      'evidence',
      '역할·로드맵·팀 범위',
      '사용자 역할, 주 단위 로드맵, 팀 범위를 프로토타입의 검토 가능한 증거로 기록했습니다.',
      2
    ),
    (
      'pacemate-academic-os',
      'insight',
      '일정이 아니라 판단 체계',
      '작업을 더 넣는 기능보다 역할별 기준과 포기할 항목을 함께 보여주는 구조가 필요하다고 보았습니다.',
      3
    ),
    (
      'pacemate-academic-os',
      'recommendation',
      '주간 운영 루프',
      '역할 확인, 충돌 탐지, 우선순위 선택, 회고를 하나의 주간 루프로 묶는 제품안을 제안했습니다.',
      4
    ),
    (
      'pacemate-academic-os',
      'execution',
      '단계형 프로토타입',
      '핵심 흐름을 먼저 데모하고 역할 간 전환과 회고 기능을 후속 검증 항목으로 배치했습니다.',
      5
    ),
    (
      'pacemate-academic-os',
      'limits',
      '프로토타입 범위',
      '제안과 데모까지 문서화했으며 실제 도입, 장기 유지, 학업 성과는 검증하지 않았습니다.',
      6
    ),
    (
      'vietnam-beauty-growth-thesis',
      'challenge',
      '발견과 구매 판단 채널 구분',
      '뷰티 소비자가 제품을 발견하는 순간과 비교해 확신하는 순간을 같은 퍼널로 단순화하지 않아야 했습니다.',
      1
    ),
    (
      'vietnam-beauty-growth-thesis',
      'evidence',
      '전략 덱과 채널 표식',
      '51장 전략 덱에서 TikTok Shop은 발견·증명, Shopee는 비교·확신 채널이라는 근거 표식을 정리했습니다.',
      2
    ),
    (
      'vietnam-beauty-growth-thesis',
      'insight',
      '채널은 서로 다른 질문에 답한다',
      '콘텐츠 반응과 구매 비교는 다른 판단 단계이므로 메시지와 측정 기준도 분리해야 한다고 보았습니다.',
      3
    ),
    (
      'vietnam-beauty-growth-thesis',
      'recommendation',
      '채널 역할 기반 진입안',
      '발견 콘텐츠, 사회적 증거, 상품 비교, 구매 확신을 잇는 단계별 실험안을 제안했습니다.',
      4
    ),
    (
      'vietnam-beauty-growth-thesis',
      'execution',
      '가설과 지표의 연결',
      '각 채널에서 확인할 질문과 중단 조건을 전략 덱의 실행 순서에 연결했습니다.',
      5
    ),
    (
      'vietnam-beauty-growth-thesis',
      'limits',
      '독립 연구의 범위',
      '독립 전략 연구이며 기업 의뢰, 캠페인 실행, 매출 성과를 근거로 하지 않습니다.',
      6
    ),
    (
      'ai-prediction-regulation',
      'challenge',
      '예측 기능과 규제 책임의 연결',
      '데이터 입력, 예측 결과, 의사결정 사용 단계에서 책임과 설명 의무가 어떻게 달라지는지 구조화해야 했습니다.',
      1
    ),
    (
      'ai-prediction-regulation',
      'evidence',
      '비교국과 보조 사례',
      '핵심 비교국, 보조 사례, 단계 모델을 연구 초안의 검토 가능한 범위로 명시했습니다.',
      2
    ),
    (
      'ai-prediction-regulation',
      'insight',
      '위험은 모델보다 사용 맥락에서 커진다',
      '동일한 예측이라도 권리 영향과 사람이 개입할 수 있는 시점에 따라 규제 판단이 달라진다고 보았습니다.',
      3
    ),
    (
      'ai-prediction-regulation',
      'recommendation',
      '단계별 검토 모델',
      '입력의 적법성, 예측의 설명 가능성, 실제 의사결정의 권리 영향을 순서대로 검토하는 모델을 제안했습니다.',
      4
    ),
    (
      'ai-prediction-regulation',
      'execution',
      '쟁점 매트릭스',
      '비교법 근거와 제품 단계별 질문을 매트릭스로 연결해 후속 검토가 가능하도록 구성했습니다.',
      5
    ),
    (
      'ai-prediction-regulation',
      'limits',
      '미게재 연구 초안',
      '독립 연구 초안이며 게재나 심사를 거치지 않았고 실제 서비스의 법률 자문으로 사용할 수 없습니다.',
      6
    )
) as sections(case_slug, kind, heading, body, display_order)
join public.case_studies as cases
  on cases.slug = sections.case_slug;

insert into public.experience_entries (
  slug,
  title,
  period_label,
  summary,
  display_order,
  published
)
values
  (
    'strategy-research-decision-design',
    'Strategy Research & Decision Design',
    'Selected documented projects',
    '정량·정성 근거를 분리해 판단 기준, 선택지, 실행 순서를 설계했습니다.',
    1,
    true
  ),
  (
    'people-strategy-talent-systems',
    'People Strategy & Talent Systems',
    'Selected documented projects',
    '인재 수요와 후보자 경험을 양면에서 검토해 채용 퍼널과 지원 체계를 구조화했습니다.',
    2,
    true
  ),
  (
    'product-discovery-execution',
    'Product Discovery & Execution',
    'Selected proposals and prototypes',
    '사용자 문제를 조사하고 좁은 가설, 검증 순서, 단계형 로드맵으로 연결했습니다.',
    3,
    true
  ),
  (
    'legal-research-strategy-lens',
    'Legal Research as a Strategy Lens',
    'Independent research',
    '쟁점, 이해관계자, 책임 구조를 비교해 제품과 시장의 의사결정 질문으로 번역했습니다.',
    4,
    true
  );

insert into public.tags (slug, name)
values
  ('strategy', 'Strategy'),
  ('people', 'People'),
  ('product', 'Product'),
  ('legal', 'Legal'),
  ('research', 'Research');

insert into public.case_study_tags (case_study_id, tag_id)
select cases.id, tags.id
from (
  values
    ('global-technical-talent-strategy', 'strategy'),
    ('global-technical-talent-strategy', 'people'),
    ('global-technical-talent-strategy', 'research'),
    ('re100-cf100-transition-strategy', 'strategy'),
    ('re100-cf100-transition-strategy', 'research'),
    ('fitory-market-validation', 'strategy'),
    ('fitory-market-validation', 'product'),
    ('fitory-market-validation', 'research'),
    ('pacemate-academic-os', 'strategy'),
    ('pacemate-academic-os', 'product'),
    ('vietnam-beauty-growth-thesis', 'strategy'),
    ('vietnam-beauty-growth-thesis', 'research'),
    ('ai-prediction-regulation', 'strategy'),
    ('ai-prediction-regulation', 'legal'),
    ('ai-prediction-regulation', 'research')
) as joins(case_slug, tag_slug)
join public.case_studies as cases
  on cases.slug = joins.case_slug
join public.tags as tags
  on tags.slug = joins.tag_slug;
