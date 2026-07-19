alter table public.experience_entries
  add column section text not null default 'timeline',
  add column display_year smallint,
  add column entry_kind text,
  add column organization text,
  add column role text,
  add column evidence_note text,
  add column case_study_slug text references public.case_studies(slug) on delete set null,
  add constraint experience_entries_section_check check (section in ('timeline', 'training')),
  add constraint experience_entries_display_year_check check (display_year is null or display_year between 1900 and 2100),
  add constraint experience_entries_entry_kind_check check (entry_kind in ('work', 'project', 'activity', 'award', 'education', 'training'));

delete from public.experience_entries
where slug in (
  'strategy-research-decision-design',
  'people-strategy-talent-systems',
  'product-discovery-execution',
  'legal-research-strategy-lens'
);

alter table public.experience_entries
  add constraint experience_entries_section_shape_check check (
    (section = 'timeline' and display_year is not null and entry_kind <> 'training')
    or (section = 'training' and display_year is null and entry_kind = 'training')
  );

insert into public.experience_entries (
  slug,
  title,
  period_label,
  summary,
  display_order,
  published,
  section,
  display_year,
  entry_kind,
  organization,
  role,
  evidence_note,
  case_study_slug
)
values
  ('ai-solution-award-2026', 'AI Solution Challenge Program 우수상', '2026년', 'AI Solution Challenge Program에서 우수상을 받았습니다.', 1, true, 'timeline', 2026, 'award', 'AI Solution Challenge Program', null, null, null),
  ('future-leaders-award-2026', '퓨처리더스캠프 기업가정신 경연 장려상', '2026년', '퓨처리더스캠프 기업가정신 경연에서 장려상을 받았습니다.', 2, true, 'timeline', 2026, 'award', '퓨처리더스캠프', null, null, null),
  ('fki-hr-lead-2026', 'FKI 소속 경제·경영 학술 동아리 인사팀장 활동 및 우수 운영진상', '2026년', '인사팀 운영을 맡고 우수 운영진상을 받았습니다.', 3, true, 'timeline', 2026, 'activity', 'FKI 소속 경제·경영 학술 동아리', '인사팀장', null, null),
  ('ylc-hr-deputy-2026', 'YLC 수료 및 인사팀 부팀장 활동', '2026년 상반기', '수료 후 인사팀 운영을 지원했습니다.', 4, true, 'timeline', 2026, 'activity', 'YLC', '인사팀 부팀장', null, null),
  ('ai-prediction-regulation-2026', 'AI Prediction Regulation', '2026 · 문서화', '법학 관점에서 AI 예측 플랫폼의 규제 쟁점을 검토한 연구 초안입니다. 미게재·미심사이며 법률 자문이 아닙니다.', 5, true, 'timeline', 2026, 'project', null, 'Legal Strategy', '2026 · 문서화된 연구 초안', 'ai-prediction-regulation'),
  ('global-technical-talent-2026', 'Global Technical Talent Strategy', '2026 · 문서화된 프로젝트', '기업 수요와 해외 기술인재 경험을 분리해 채용 파이프라인의 우선 과제를 구조화한 전략 사례입니다.', 6, true, 'timeline', 2026, 'project', null, 'People Strategy', '2026 · 문서화된 프로젝트', 'global-technical-talent-strategy'),
  ('re100-cf100-2026', 'RE100 × CF100 Transition Strategy', '2026 · 문서화된 프로젝트', '연간 재생에너지 목표와 시간 단위 무탄소 전력 기준의 전환 순서를 비교한 전략 프로젝트입니다.', 7, true, 'timeline', 2026, 'project', null, 'Transition Strategy', '2026 · 문서화된 프로젝트', 're100-cf100-transition-strategy'),
  ('fitory-market-validation-2026', 'Fitory Market Validation', '2026 · 문서화된 프로젝트', '순환패션 맥락에서 로컬 재고 발견부터 대여·픽업까지의 MVP 가설을 검토한 탐색적 프로젝트입니다.', 8, true, 'timeline', 2026, 'project', null, 'Product Strategy', '2026 · 문서화된 프로젝트', 'fitory-market-validation'),
  ('pacemate-academic-os-2026', 'PaceMate Academic OS', '2026 · 문서화된 프로젝트', '서로 충돌하는 역할의 우선순위를 조정하는 단계별 프로토타입과 검증 순서를 제안한 프로젝트입니다.', 9, true, 'timeline', 2026, 'project', null, 'Product Execution', '2026 · 문서화된 프로젝트', 'pacemate-academic-os'),
  ('vietnam-beauty-growth-2026', 'Vietnam Beauty Growth Thesis', '2026 · 문서화된 프로젝트', '발견·증명 채널과 비교·구매 확정 채널을 구분한 독립 전략 연구입니다.', 10, true, 'timeline', 2026, 'project', null, 'Market Research', '2026 · 문서화된 프로젝트', 'vietnam-beauty-growth-thesis'),
  ('ylc-completion-2025', 'YLC 수료', '2025년 하반기', 'YLC 과정을 수료했습니다.', 11, true, 'timeline', 2025, 'activity', 'YLC', null, null, null),
  ('ai-solution-team-lead-2025', 'AI Solution Challenge 단기 집중 과정 팀장 참여', '2025학년도', 'AI Solution Challenge 단기 집중 과정에서 팀장으로 참여했습니다.', 12, true, 'timeline', 2025, 'activity', 'AI Solution Challenge', '팀장', null, null),
  ('daily-coin-2025-2026', '데일리 코인 노래방 매장 스태프', '2025년 9월 ~ 2026년 7월', '키오스크·노래방 기기와 매장 환경을 관리하고 고객 응대, 결제·이용 문의를 지원했습니다.', 13, true, 'timeline', 2025, 'work', '데일리 코인 노래방', '매장 스태프', null, null),
  ('dandi-mobile-2024', '단디모바일 비산점 경리 사무원', '2024년 2월 ~ 12월', '고객 DB·엑셀 관리, 일별 정산과 경리, 고객 응대, 매장 운영 보조 및 SNS 홍보 콘텐츠 관리를 맡았습니다.', 14, true, 'timeline', 2024, 'work', '단디모바일 비산점', '경리 사무원', null, null),
  ('upgi-tteokbokki-2024', '업기 떡볶이 대구비산점 매장 스태프', '2024년 2월 ~ 8월', '주문 접수, 조리 보조, 포장, 배달 주문 관리, 고객 응대와 위생 관리를 맡았습니다.', 15, true, 'timeline', 2024, 'work', '업기 떡볶이 대구비산점', '매장 스태프', null, null),
  ('dalseo-english-mentor-2022-2023', '달서구청 영어 멘토', '2022년 3월 ~ 2023년 7월', '드림봉사단 영어지도를 통해 초등학생 학습 지도, 진도·과제 관리와 피드백을 제공했습니다.', 16, true, 'timeline', 2023, 'activity', '달서구청', '영어 멘토', null, null),
  ('dalseo-coordinator-2022-2023', '달서구청 코디네이터', '2022년 3월 ~ 2023년 4월', '멘토 선발 면접을 보조하고 활동 관리, 자료 수합·보고와 교육봉사 프로그램 운영을 지원했습니다.', 17, true, 'timeline', 2023, 'activity', '달서구청', '코디네이터', null, null),
  ('youth-leader-daegu-2022-2023', '한국청년지도자연합회 대구지부 지도자', '2022년 3월 ~ 2023년 2월', '청소년 봉사활동을 기획·인솔·관리하고 봉사기관 컨택, 일정 조율과 현장 운영을 지원했습니다.', 18, true, 'timeline', 2023, 'activity', '한국청년지도자연합회 대구지부', '지도자', null, null),
  ('ban-ki-moon-climate-leader-2022', '반기문 재단 기후리더양성과정 1기 참여', '2022년', '반기문 재단 기후리더양성과정 1기에 참여했습니다.', 19, true, 'timeline', 2022, 'education', '반기문 재단', null, null, null),
  ('keimyung-law-2022', '계명대학교 법학과 재학 시작', '2022년', '계명대학교 법학과 재학을 시작했습니다.', 20, true, 'timeline', 2022, 'education', '계명대학교', '법학과', null, null),
  ('human-ai-foundation', '첨단산업 인재양성 AI 부트캠프 Human AI Foundation 수료', '연도 미상', '공개 승인된 수료 과정입니다.', 21, true, 'training', null, 'training', null, null, null, null),
  ('vibecoding-intermediate', '(재)대구디지털혁신진흥원 바이브코딩 중급 교육 과정 수료', '연도 미상', '공개 승인된 수료 과정입니다.', 22, true, 'training', null, 'training', null, null, null, null),
  ('ai-coding-course', '(재)대구디지털혁신진흥원 AI 기반 코딩 교육 과정 수료', '연도 미상', '공개 승인된 수료 과정입니다.', 23, true, 'training', null, 'training', null, null, null, null),
  ('dsac-data-scientist', 'DSAC 데이터 사이언티스트 능력인증 교육 과정 수료', '연도 미상', '공개 승인된 수료 과정입니다.', 24, true, 'training', null, 'training', null, null, null, null),
  ('adsp-preparation', 'ADsP 데이터분석준전문가 취득 대비 과정 수료', '연도 미상', '공개 승인된 수료 과정입니다.', 25, true, 'training', null, 'training', null, null, null, null),
  ('digital-marketer-nia', '에이블런 & 한국지능정보사회진흥원(NIA) 디지털 마케터 양성 프로젝트 도약 과정 수료', '연도 미상', '공개 승인된 수료 과정입니다.', 26, true, 'training', null, 'training', null, null, null, null),
  ('change-and-learn-notion', 'AI 디지털 학습 Change & Learn 노션 특강 수료', '연도 미상', '공개 승인된 수료 과정입니다.', 27, true, 'training', null, 'training', null, null, null, null),
  ('international-law-college', '국제법 대학 교육 이수', '연도 미상', '공개 승인된 수료 과정입니다.', 28, true, 'training', null, 'training', null, null, null, null)
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
