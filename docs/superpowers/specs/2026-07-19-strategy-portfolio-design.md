# 전략기획 포트폴리오 웹사이트 디자인 스펙

- 상태: 사용자 승인된 B1.2 디자인
- 기준 시안: `.superpowers/brainstorm/173-1784464204/content/homepage-strategy-motion-v2.html`
- 핵심 문장: **복잡한 신호를, 실행 가능한 전략으로.**
- 우선 직무: 전략기획 65% · HR/People Strategy 20% · PM/Product Execution 15%

## 1. 목표

법학 전공자의 구조적 사고를 전략기획 역량으로 번역해, 채용담당자가 30초 안에 지원 직무와 근거 수준을 파악하고 3분 안에 대표 프로젝트의 판단 과정까지 확인할 수 있는 포트폴리오를 만든다.

성공 조건은 다음과 같다.

1. 첫 화면에서 전략기획 지원자라는 점이 분명하다.
2. 성과를 과장하지 않고 검증된 숫자와 조사 범위를 크게 보여준다.
3. 법학은 목표 직무가 아니라 쟁점 발견·이해관계자 추론·의사결정 문서화의 사고 도구로 표현한다.
4. 스크롤 모션은 정보의 수렴 과정을 설명하며, 사용자의 스크롤 속도를 방해하지 않는다.
5. 모바일, 키보드, 200% 확대, 모션 감소 설정에서도 같은 정보를 읽을 수 있다.
6. 브라우저 저장소나 정적 JSON을 운영 데이터 원본으로 사용하지 않고 Supabase를 콘텐츠 원본으로 사용한다.

## 2. 범위와 비범위

### 포함

- 반응형 홈페이지
- 대표 사례와 보조 사례
- `/work/[slug]` 사례 상세 페이지
- `/resume` 공개 이력 요약 페이지
- Supabase 기반 공개 콘텐츠 조회
- GSAP ScrollTrigger 기반 Decision Spine
- 카드 진입 리빌, 포커스·호버·활성 상태
- 민감자료 공개 제외 목록과 사용자 작업 TODO
- 배포 가능한 환경변수·마이그레이션 구조

### 초기 버전에서 제외

- CMS 관리자 화면
- 공개 회원가입과 인증
- 실시간 데이터 구독
- 댓글, 좋아요, 방문자 개인화
- 확인되지 않은 매출·성장·도입 성과
- 신분증, 계약서, 지원서, 서명, 연락처, 원시 설문·인터뷰 행 업로드

## 3. 사용자 탐색 흐름

### 30초 흐름

1. Hero: 전략기획 포지셔닝과 법학 기반 사고법
2. Evidence Rail: `21+38`, `57`, `118`
3. 대표 사례 3개 비교
4. Resume 또는 대표 프로젝트 진입

### 3분 흐름

1. 외국인 기술인재 채용 퍼널
2. RE100 × CF100 전환 전략
3. Fitory 0→1 시장 검증
4. Decision Spine
5. 법학 기반 전략 방법론
6. PaceMate, 베트남 뷰티 전략, AI 예측 플랫폼 규제 연구
7. 이력서와 연락 경로

## 4. 정보 구조

### 홈페이지

1. 최소 내비게이션: Work · Decision Spine · About · Resume
2. Hero: 핵심 문장, 보조 설명, 역할 비중, 전략 이미지
3. Evidence Rail: 대표 검증 수치
4. Selected Work: 리드 사례 3개
5. Decision Spine: 판단 방법론을 설명하는 시그니처 스크롤 장면
6. Why Law Matters: 밝은 배경으로 전환되는 법학 렌즈 섹션
7. Additional Evidence: 보조 사례 3개
8. Footer: 대표 프로젝트 CTA와 직무 범위

`Resume`는 민감한 PDF를 직접 노출하지 않고 `/resume`의 공개 승인 정보로 이동한다. 이메일·전화번호 CTA는 사용자가 공개 연락 수단을 승인한 뒤에만 활성화한다.

### 사례 상세 페이지

1. Executive snapshot
2. Decision to make
3. Context and constraints
4. Evidence scope
5. Insight chain
6. Options and criteria
7. Recommendation
8. Execution design
9. Outcome and limits
10. My contribution

## 5. 공개 사례와 수치 규칙

### 대표 사례

| 사례 | 공개 수치 | 공개 상태 문구 |
|---|---|---|
| Global Technical Talent Strategy | 기업 21명, 유효 후보자 38명, 13개국 | 실측 표본과 제안 단계 분리 |
| RE100 × CF100 Transition Strategy | 분석 결과 57건, 인터뷰 2건, 해외자료 27건, 4주, 3인 | 문서화된 프로젝트, 기업 채택 여부 미확인 |
| Fitory Market Validation | 정량 118명, 심층 43명, 첫 문의 51분, 2.57% | 탐색적 조사와 스모크테스트, 시장성 확정 주장 금지 |

### 보조 사례

| 사례 | 공개 수치 | 공개 상태 문구 |
|---|---|---|
| PaceMate Academic OS | 4개 역할, 15주 로드맵, 2인 팀 | 프로토타입과 데모, 실제 도입 성과 미검증 |
| Vietnam Beauty Growth Thesis | 51장 | 독립 전략 연구, 기업 의뢰 프로젝트가 아님 |
| AI Prediction Regulation | 2개 핵심 비교국, 1개 보조 사례, 3단계 모델 | 연구 초안, 미게재·미심사 |

`07 cases` 같은 편집상 숫자는 KPI로 사용하지 않는다. 외국인 후보자 자료는 원시행 40개가 아니라 최종 유효 표본 38개만 공개한다. 서로 다른 표본인 21과 38은 합계 59명으로 표현하지 않고 `21 + 38`의 양면 리서치로 표현한다.

## 6. 시각 시스템

### 방향

- 브랜드 본질: 근거
- 시각적 긴장: Warm graphite와 signal mint
- 시그니처 장면: 근거가 선택과 실행안으로 수렴하는 Decision Spine
- 디자인 성격: Apple식 절제, Toss식 명료한 위계, shadcn의 접근 가능한 상태 처리

### 색상

- 배경: `#090B0D`
- 패널: `#111518`
- 주 텍스트: `#F4F5F2`
- 본문 보조색: 최소 `#A9AEAA` 상당의 대비
- 선: 흰색 13%
- 신호색: `#7BE4B6`
- 보조 온도: `#C89A67`
- 법학 섹션 배경: `#ECE9DF`
- 법학 섹션 녹색: `#0E6D4A` 이상 대비

민트는 CTA, 현재 단계, 핵심 숫자에만 사용한다. 활성 상태는 색상만으로 표시하지 않고 위치, 선, 밑줄 또는 아이콘을 함께 사용한다.

### 타이포그래피

- 한국어 제목·본문·UI: Pretendard Variable
- 영문 디스플레이·대형 숫자: Instrument Serif
- 본문: 16px 이상, `line-height: 1.6–1.7`, 최대 65ch
- Hero: `clamp(56px, 7.5vw, 126px)`, 모바일 최소 48px
- 섹션 제목: `clamp(44px, 6.3vw, 100px)`
- UI 라벨: 12px 이상
- 한국어: `word-break: keep-all`, 제목 `text-wrap: balance`, 본문 `text-wrap: pretty`
- 영어 대문자 라벨만 넓은 자간을 허용한다.

## 7. 오토레이아웃과 반응형

- 전역 거터: `clamp(20px, 4.5vw, 72px)`
- 반복 그리드: `repeat(auto-fit, minmax(min(100%, 300–330px), 1fr))`
- 모든 그리드 자식에 `min-width: 0`
- 고정 너비 대신 `minmax`, `clamp`, `aspect-ratio`, 컨테이너 쿼리 사용
- 주요 전환점: 1100px, 900px, 640px
- Hero는 데스크톱 2열, 900px 이하 1열
- 대표 사례 첫 카드는 컨테이너 폭 820px 이상에서 2칸을 차지한다.
- 390px 모바일과 200% 확대에서 가로 스크롤이 없어야 한다.
- 모바일 내비게이션은 핵심 CTA만 유지하고 나머지는 메뉴로 축약한다.
- 모든 클릭 대상은 최소 44×44px이다.

## 8. 모션 시스템

### 기본 원칙

- 모션은 `transform`과 `opacity`만 사용한다.
- 커스텀 이징은 `cubic-bezier(.16, 1, .3, 1)`을 기본으로 한다.
- 콘텐츠는 JavaScript 실패 시에도 기본적으로 보인다.
- 일반 카드와 핵심 텍스트에 패럴랙스를 적용하지 않는다.
- Lenis를 사용하더라도 스크롤을 가로채지 않고 기본 스크롤 속도를 보존한다.

### 카드 리빌

- 일반 카드는 최초 진입 시 한 번만 나타난다.
- 시작: `opacity: 0`, `y: 36–54px`, `scale: .965–.985`
- 종료: `opacity: 1`, `y: 0`, `scale: 1`
- 지속시간: 약 0.72초
- 내부 순서: 카드 표면 → 숫자/이미지 → 제목 → 설명/상태
- 화면을 벗어날 때 일반 카드를 다시 숨기지 않는다.

### Decision Spine

- GSAP ScrollTrigger를 사용하는 유일한 복합 스크롤 구간이다.
- 데스크톱에서 소개 영역은 sticky, 단계들은 세로 진행한다.
- 현재 단계는 선명해지고 이전·다음 단계는 낮은 불투명도로 전환한다.
- pinned 요소 자체를 변형하지 않고 내부 자식만 움직인다.
- 모바일과 `prefers-reduced-motion`에서는 sticky, scrub, fade-out을 제거하고 정적 세로 목록으로 제공한다.
- 폰트와 이미지 로딩 후 `ScrollTrigger.refresh()`를 실행한다.

### 미세 상호작용

- 버튼과 카드 클릭 피드백은 100ms 이내 제공한다.
- 카드 hover: 이미지 최대 1.015배, 테두리 민트 35–48%; 레이아웃 위치를 크게 움직이지 않는다.
- 링크 화살표는 4px 이동한다.
- 키보드 focus ring은 민트색과 외곽 여백으로 명확히 표시한다.
- 커스텀 커서는 사용하지 않는다.

## 9. 애플리케이션 아키텍처

### 프런트엔드

- Next.js App Router와 TypeScript
- React Server Components가 공개 포트폴리오 데이터를 조회한다.
- GSAP이 필요한 작은 섹션만 Client Component로 분리한다.
- shadcn/ui는 버튼, 내비게이션, 다이얼로그, 접근성 상태의 기반으로 사용하고 Hero와 사례 카드는 전용 컴포넌트로 제작한다.
- 브라우저 `localStorage`는 테마나 임시 UI 선호에도 초기 버전에서 사용하지 않는다.

권장 컴포넌트 경계:

- `SiteHeader`
- `HeroSection`
- `EvidenceRail`
- `CaseStudyGrid` / `CaseStudyCard`
- `DecisionSpine`
- `LawLensSection`
- `SupportingWork`
- `SiteFooter`
- `CaseStudyPage`

### 데이터 계층

- 서버 전용 데이터 어댑터가 Supabase에서 필요한 열만 조회한다.
- 홈페이지 데이터는 한 번의 중첩 조회로 가져와 N+1을 방지한다.
- 공개 페이지는 `revalidate = 3600`인 ISR을 사용한다.
- 데이터베이스 오류 시 빌드된 마지막 공개 결과를 유지하며, 신규 빌드에서는 명확한 서버 로그를 남긴다.

## 10. Supabase 설계

### 개발과 배포

- 개발 원본: Docker 기반 로컬 Supabase
- 배포 원본: 호스팅 Supabase
- 동일한 마이그레이션을 로컬과 호스팅 환경에 적용한다.
- 브라우저 localStorage와 런타임 JSON 파일은 데이터 원본으로 사용하지 않는다.
- 초기 공개 콘텐츠는 재현 가능한 SQL 마이그레이션으로 기록한다.
- 앱은 서버 전용 `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`를 사용한다.

### 테이블

- `site_profile`
- `case_studies`
- `case_study_metrics`
- `case_study_sections`
- `experience_entries`
- `tags`
- `case_study_tags`

PK는 identity bigint, slug는 unique text, 날짜는 timestamptz, 상태는 check constraint를 사용한다. 모든 FK와 공개 정렬 쿼리에 인덱스를 둔다.

### 권한

- 모든 공개 테이블에 RLS 활성화
- `anon`은 `published` 콘텐츠 SELECT만 가능
- insert/update/delete 정책 없음
- 자식 테이블은 공개된 부모 사례가 있을 때만 읽기 가능
- `service_role`은 앱과 `NEXT_PUBLIC_` 변수에 절대 포함하지 않는다.
- 초기 버전에는 Auth와 관리자 쓰기 경로를 만들지 않는다.

## 11. 이미지 전략

- Hero 이미지는 법원·의사봉·악수 스톡 이미지를 사용하지 않는다.
- 핵심 개념은 `evidence becoming direction`이다.
- 비식별 문서 조각, 시장 지도, 결정 노드, 민트 신호선, 저채도 앰버를 사용한다.
- 읽을 수 있는 개인정보, 실제 문서 원문, 로고, 얼굴을 포함하지 않는다.
- 생성 이미지는 AVIF/WebP로 최적화해 `public/images`에 fingerprint 파일명으로 둔다.
- 자주 바꿀 미디어만 Supabase Storage의 공개 읽기 버킷으로 이동한다.
- Hero 목표 전송량은 300KB 이하, LCP 이미지로 크기를 미리 예약한다.

Higgsfield 원격 MCP는 설정에 등록됐지만 OAuth 콜백 호환성으로 현재 미인증 상태다. Windows Defender가 제거한 로컬 실행 파일은 복원하거나 예외 처리하지 않는다. 디자인 구현은 현재 생성된 안전한 Hero 자산으로 진행하며, Higgsfield는 공식 호환성이 해결된 뒤 선택적으로 교체한다.

## 12. 민감자료 처리

다음 자료는 웹사이트, Supabase Database, Supabase Storage, 저장소에 넣지 않는다.

- 신분증과 주민등록 관련 자료
- 계약서, 서명, 지원서 원문
- 개인 연락처와 주소
- 원시 설문·인터뷰 행과 식별 가능 응답
- 인사 데이터와 평가 문서
- `.env`, 토큰, API 키, 서비스 역할 키

`SENSITIVE_REVIEW.txt`에는 파일 경로와 공개 제외 사유만 기록하고 원문을 복사하지 않는다. 사용자가 직접 선별하기 전에는 집계치와 비식별 요약만 사용한다.

## 13. 오류 처리와 빈 상태

- 필수 `site_profile` 또는 대표 사례가 없음: 개발·배포 빌드를 명확한 오류로 실패
- 선택적 보조 사례가 없음: 빈 카드나 편집 중 문구를 만들지 않고 해당 목록만 렌더링하지 않음
- 이미지 실패: 고정 비율의 그래파이트 배경과 대체 텍스트 유지
- Supabase 개발 서버 중단: 개발 화면에 서버 오류를 표시하고 정적 샘플로 조용히 대체하지 않는다.
- 배포 환경변수 누락: 빌드 단계에서 읽기 쉬운 오류로 실패
- 모션 라이브러리 실패: 모든 콘텐츠는 정적 상태로 표시

## 14. 검증 기준

### 기능

- 홈페이지와 모든 공개 상세 경로가 정상 렌더링된다.
- 공개된 DB 콘텐츠만 노출된다.
- CTA와 내비게이션이 키보드로 동작한다.
- 카드와 Decision Spine이 데스크톱에서 의도대로 작동한다.

### 반응형·접근성

- 1280×720, 900px, 390×844, 200% 확대 확인
- 가로 스크롤 없음
- `prefers-reduced-motion`에서 숨겨지는 콘텐츠 없음
- WCAG AA 수준 텍스트 대비
- 논리적 heading 순서와 의미 있는 alt

### 성능

- Hero 이미지 300KB 이하 목표
- 레이아웃 이동을 막기 위한 이미지 비율 예약
- GSAP Client Component 범위 최소화
- 불필요한 Realtime, Auth, 대형 클라이언트 데이터 패칭 없음
- Lighthouse Performance와 Accessibility 각각 90점 이상 목표

## 15. 산출물

- Next.js 애플리케이션
- Supabase 마이그레이션과 타입
- 최적화 이미지 자산
- `EXPERIENCE_INVENTORY.md`: 공개 가능한 경험·근거 요약
- `SENSITIVE_REVIEW.txt`: 민감 가능 파일 경로와 제외 사유
- `TODO.md`: 사용자가 직접 해야 할 배포·선별 작업
- 재사용 가능한 포트폴리오 워크플로 스킬

이 문서는 B1.2 시안의 정보 구조와 시각적 의도를 구현의 기준으로 고정한다. 구현 중 새로운 대형 섹션, 확인되지 않은 수치, 다른 색상 체계, 임의의 카드 패턴을 추가하지 않는다.
