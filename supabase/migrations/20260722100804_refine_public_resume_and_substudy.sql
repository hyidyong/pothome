-- Keep the public resume focused on completed work, projects, awards, and roles.
-- Learning records live in their own section so they do not compete with experience.

alter table public.experience_entries
  drop constraint experience_entries_section_shape_check;

delete from public.experience_entries
where slug = 'fki-hr-lead-2026';

delete from public.experience_entries
where slug = 'vietnam-beauty-growth-2026';

delete from public.case_studies
where slug = 'vietnam-beauty-growth-thesis';

update public.case_studies
set
  title = 'Substudy',
  summary = '팀장으로 제품 기획부터 프론트엔드·백엔드 구현까지 연결하고, 실무 협력 프로세스를 경험한 제품 개발 프로젝트입니다.',
  category = 'Product Development',
  evidence_status = '팀장·기획·FE·BE 구현 및 최우수상(1위) 수상',
  updated_at = now()
where slug = 'pacemate-academic-os';

update public.case_study_sections as sections
set
  heading = updates.heading,
  body = updates.body,
  updated_at = now()
from (
  values
    ('decision', '제품 가설부터 구현까지 연결', '사용자 문제와 핵심 흐름을 정의한 뒤, 기획·프론트엔드·백엔드 작업을 한 제품 단위로 연결했습니다.'),
    ('evidence', '협업 가능한 작업 흐름', '기획 기준과 화면·서버 구현 항목을 나누고, 팀 내에서 검토와 전달이 가능한 협업 흐름을 구성했습니다.'),
    ('insight', '실무 협력은 연결 지점에서 완성된다', '기획, 인터페이스, 서버 구현의 경계가 끊기지 않도록 작업 순서와 전달 기준을 맞추는 경험을 쌓았습니다.'),
    ('recommendation', '핵심 흐름 우선 구현', '가장 중요한 사용자 흐름부터 구현하고, 검토 가능한 단위로 나누어 팀 협업의 속도와 명확성을 높였습니다.'),
    ('execution', '팀장으로 기획·FE·BE 수행', '팀장으로 제품 기획을 이끌고 프론트엔드와 백엔드 구현에 참여해, 실제 협업 프로세스를 끝까지 경험했습니다.'),
    ('limits', '검증 범위', '최우수상(1위) 수상과 프로젝트 구현 경험을 기록하며, 장기 서비스 성과나 상용 운영 성과는 주장하지 않습니다.'),
    ('contribution', '제품 리딩과 구현 연결', '요구사항을 제품 흐름으로 정리하고, 프론트엔드·백엔드 구현과 팀 협업을 연결했습니다.'),
    ('context', '제품 개발 팀 프로젝트', '문제 정의, 기획, 구현, 협업이 동시에 필요한 팀 프로젝트로 진행했습니다.'),
    ('options', '구현 순서와 협업 방식', '핵심 흐름 중심 구현과 역할별 병렬 작업을 비교해, 검토 가능한 작업 단위로 진행했습니다.')
) as updates(kind, heading, body)
where sections.case_study_id = (
  select id from public.case_studies where slug = 'pacemate-academic-os'
)
and sections.kind = updates.kind;

delete from public.case_study_metrics
where case_study_id = (select id from public.case_studies where slug = 'pacemate-academic-os');

insert into public.case_study_metrics (
  case_study_id, value_text, label, source_status, verified, display_order
)
select
  cases.id,
  metrics.value_text,
  metrics.label,
  'documented_project',
  true,
  metrics.display_order
from public.case_studies as cases
cross join (
  values
    ('1위', '최우수상', 1),
    ('4개', '수행 역할', 2),
    ('2개', '구현 영역 (FE·BE)', 3)
) as metrics(value_text, label, display_order)
where cases.slug = 'pacemate-academic-os';

update public.experience_entries
set
  title = 'YLC 수료 및 인사팀 부팀장 활동',
  period_label = '2026년 상반기',
  summary = 'YLC 수료 후 인사팀 부팀장으로 활동하며 팀 운영과 구성원 경험 개선을 지원했습니다.',
  organization = 'YLC',
  role = '인사팀 부팀장',
  display_order = 3
where slug = 'ylc-hr-deputy-2026';

update public.experience_entries
set
  slug = 'substudy-product-project-2026',
  title = 'Substudy 제품 개발 프로젝트 — 최우수상(1위)',
  period_label = '2026년',
  summary = '팀장으로 제품 기획, 프론트엔드·백엔드 구현에 참여하고 실무 협력 프로세스를 경험했습니다.',
  organization = 'Substudy',
  role = '팀장 · Product Planning · FE · BE',
  evidence_note = '최우수상(1위) 수상',
  case_study_slug = 'pacemate-academic-os',
  display_order = 4
where slug = 'pacemate-academic-os-2026';

update public.experience_entries
set
  period_label = '2025년 9월 ~ 현재',
  summary = '키오스크·노래방 기기와 매장 환경을 관리하고 고객 응대, 결제·이용 문의를 지원하고 있습니다.'
where slug = 'daily-coin-2025-2026';

update public.experience_entries
set
  section = 'training',
  display_year = null,
  entry_kind = 'education',
  period_label = '2022년 ~ 현재',
  title = '계명대학교 법학과 재학',
  summary = '법학 전공 과정을 이수하고 있습니다.',
  display_order = 41
where slug = 'keimyung-law-2022';

update public.experience_entries
set
  section = 'training',
  display_year = null,
  entry_kind = 'training',
  period_label = '2022년',
  title = '반기문 재단 기후리더양성과정 1기 참여',
  summary = '기후 리더십 양성 과정 1기에 참여했습니다.',
  display_order = 42
where slug = 'ban-ki-moon-climate-leader-2022';

update public.experience_entries
set period_label = '2026년 7월', summary = '첨단산업 인재양성 AI 부트캠프 Human AI Foundation을 수료했습니다.', display_order = 21
where slug = 'human-ai-foundation';

update public.experience_entries
set period_label = '2026년 6월', summary = '공개 승인된 수료 과정입니다.', display_order = 22
where slug = 'vibecoding-intermediate';

update public.experience_entries
set period_label = '2026년 6월', summary = '공개 승인된 수료 과정입니다.', display_order = 23
where slug = 'ai-coding-course';

update public.experience_entries
set period_label = '2026년 6월', summary = '공개 승인된 수료 과정입니다.', display_order = 24
where slug = 'dsac-data-scientist';

update public.experience_entries
set period_label = '2026년 5월', summary = '공개 승인된 수료 과정입니다.', display_order = 25
where slug = 'adsp-preparation';

update public.experience_entries
set period_label = '2023년 9월', summary = '공개 승인된 수료 과정입니다.', display_order = 36
where slug = 'digital-marketer-nia';

update public.experience_entries
set period_label = '수료 연도 확인 중', summary = 'AI 디지털 학습 Change & Learn 노션 특강을 수료했습니다.', display_order = 39
where slug = 'change-and-learn-notion';

update public.experience_entries
set period_label = '2025년 2학기', summary = '국제법 대학 교육을 이수했습니다.', display_order = 35
where slug = 'international-law-college';

insert into public.experience_entries (
  slug, title, period_label, summary, display_order, published,
  section, display_year, entry_kind, organization, role, evidence_note, case_study_slug
)
values
  ('vision-pruner-hyundai-peb-2026', '비전프러너 현대차 PEB 프로젝트 교육 수료', '2026년 6월 29일 ~ 7월 1일', '비전프러너 현대차 PEB 프로젝트 교육을 수료했습니다.', 26, true, 'training', null, 'training', null, null, null, null),
  ('kdi-youth-economic-fiscal-camp-2026', 'KDI 2026 청년 경제재정 캠프 (수료 예정)', '2026년 7월 27일 ~ 29일', 'KDI 주관 청년 경제재정 캠프 참여가 예정되어 있습니다.', 20, true, 'training', null, 'training', 'KDI', null, null, null)
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

alter table public.experience_entries
  add constraint experience_entries_section_shape_check check (
    (section = 'timeline' and display_year is not null and entry_kind not in ('training', 'education'))
    or (section = 'training' and display_year is null and entry_kind in ('training', 'education'))
  );
