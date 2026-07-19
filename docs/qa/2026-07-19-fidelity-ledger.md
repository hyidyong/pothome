# B1.2 Signal Noir 구현 충실도 원장

검증 대상은 B1.2 동적 콘셉트와 로컬 프로덕션 빌드(`http://localhost:3108`)다. 비교 캡처는 모두 브라우저 UI를 제외한 1280px 폭이며, [accepted-b1-2.png](./accepted-b1-2.png)는 승인 콘셉트, [rendered-homepage.png](./rendered-homepage.png)는 구현 결과다.

## 캡처 방법

- 승인 콘셉트 HTML에는 charset 메타 태그가 없으므로, 소스는 수정하지 않고 임시 서버가 `text/html; charset=utf-8` 응답 헤더를 보내도록 했다. `document.characterSet === "UTF-8"`과 정확한 Hero 카피를 확인했다.
- 승인 콘셉트의 full-page 비교 캡처는 `prefers-reduced-motion: reduce`를 사용했다. 이 방식은 14개 스크롤 카드가 모두 정적·가시 상태여서 애니메이션 시작 프레임의 빈 영역을 캡처하지 않는다.
- 구현 캡처는 일반 모션 환경에서 5개 Reveal을 차례로 화면 중앙까지 스크롤해 모두 `visible`, `opacity: 1`, `transform: none`이 된 것을 확인한 뒤 최상단으로 돌아와 촬영했다.
- 구현 캡처의 Decision Spine 아래 긴 검은 영역은 콘텐츠 누락이 아니다. GSAP ScrollTrigger의 140% scrub 구간을 위한 pin scroll-space가 full-page 캡처에 펼쳐진 것이다. 실제 브라우저에서는 섹션이 고정된 동안 네 판단 단계가 순서대로 전환된다.

## 시각 충실도

| 항목            | 승인 콘셉트                                           | 구현 결과                                                                             | 판정                     |
| --------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------ |
| 카피            | “복잡한 신호를, 실행 가능한 전략으로.”                | 문구와 문장부호까지 동일                                                              | 일치                     |
| 첫 화면 구성    | Signal Noir의 어두운 split hero, 역할 비중, 핵심 지표 | 왼쪽 전략 카피와 오른쪽 전략 신호 이미지, 역할 블록, 바로 이어지는 수치 rail          | 의도 유지·정보 밀도 개선 |
| 타이포그래피    | 굵은 한국어 headline과 editorial serif 숫자           | Pretendard Variable UI·한국어, Instrument Serif 영문 display·숫자                     | 일치                     |
| 팔레트          | noir, off-white, mint signal, warm law section        | `#090b0d`, `#f4f5f2`, `#7be4b6`, `#ece9df` 중심                                       | 일치                     |
| Hero 크롭       | 이미지 없는 미니멀한 수치 중심 비주얼                 | 1672×941 생성 이미지를 원본 비율로 보존하고 데스크톱 78%, 태블릿·모바일 74% 초점 적용 | 의도적 확장              |
| 그리드·컨테이너 | 비대칭 2열, fluid card mosaic                         | `clamp()` gutter·section spacing, 1280/900/640/390px에서 유동 재배치                  | 일치                     |
| 모션            | Reveal과 Decision Spine signature motion              | 일반 Reveal은 1회 등장, Decision Spine만 pin·scrub 단계 전환                          | 일치                     |
| 모바일          | 단일 열과 정적 정보 우선                              | 390px에서 4:5 Hero, 6개 고유 프로젝트, 정적 Reveal·Decision 단계                      | 일치                     |

의도적 차이는 Hero에 직무 주제와 맞는 생성 이미지를 추가한 점, 카드에 실제 공개 가능한 프로젝트 데이터와 출처 상태를 연결한 점, 모바일에서 스크롤 pin을 제거한 점이다. 모두 콘텐츠 명료도·접근성·성능을 위한 승인 스펙 범위의 확장이다.

## 브라우저·접근성 증거

- 1280×720: 문서 `scrollWidth/clientWidth = 1280/1280`, 고유 프로젝트 6개, `21 + 38`, `57`, `118` 표시, 금지 수치 `59`와 원시 표본 수 `40` 미표시, 보이는 포인터 타깃 44px 미만 없음.
- 900×900: `900/900`, Hero 16:10과 74% 초점, 자연스러운 2줄 제목, 모바일 헤더, Decision Spine 데스크톱 모션 유지.
- 390×844: `390/390`, 제목 `clientWidth/scrollWidth = 346/346`, Hero 4:5, pin 0, Reveal 5개와 Decision 단계 4개가 모두 `opacity: 1`, 보이는 포인터 타깃 44px 미만 없음.
- 200% 확대: 1280px 기준을 절반인 640 CSS px로 재배치하는 브라우저 reflow equivalent로 검사했다. `640/640`, 보이는 텍스트 잘림 없음, 제목·수치·카드 유지, 페이지 끝 이동값과 최대 이동값이 일치했다. 자동화 브라우저의 `Ctrl++`는 zoom 값을 바꾸지 않아 이 재현 가능한 등가 방법을 기록했다.
- 키보드: 첫 `Tab`은 44px 높이의 “본문으로 건너뛰기”이며 3px outline이 보인다. `Enter` 후 `#main-content`와 `main` focus를 확인했다. 이어지는 순서는 wordmark → Work → Decision Spine → About → Resume다.
- 모바일 메뉴: 키보드 `Enter`로 dialog를 열고, `Tab` focus가 dialog 내부에 머물며, `Escape` 후 메뉴 버튼으로 focus가 복귀한다.
- reduced-motion: 실제 미디어 쿼리가 `true`인 1280px 검사에서 pin 0, indicator 숨김, section `min-height: 0`, 단일 열, 모든 Reveal·Decision 단계 `opacity: 1`·`transform: none`을 확인했다.
- 동적 Decision Spine: 1008px scrub 범위에서 단계 01 → 02 → 03 → 04가 활성화된다. 비활성·이전 단계는 `opacity: 0`으로 완전히 사라진 뒤 다음 단계가 나타나므로 텍스트가 겹치지 않는다. 실제 정지점 0%, 40%, 70%, 100%에서 가시 단계는 각각 01, 02, 03, 04 한 개였고, 13개 지점 sweep에서도 동시에 legible한 단계는 최대 한 개였다. intro에는 transform을 적용하지 않았다.
- 경로: `/resume`와 대표 `/work/global-technical-talent-strategy`를 프로덕션 브라우저에서 열어 제목·overflow·console error 부재를 확인했고, 빌드는 6개 work 정적 경로를 생성했다.

## 성능·데이터·개인정보

- Hero는 SHA-256 `F48EA2A64F7DC9380EA6AFC314DBD21ECE082A8CCD37011024CDB357F84EA40C`인 수정하지 않은 1672×941 원본에서 AVIF 64,206B와 WebP 82,712B를 만들었다. 커밋된 CI 계약은 로컬 전용 원본에 의존하지 않고 감사된 stem `hero-strategy-signal-f48ea2a6`과 결과 파일 자체를 검사한다. 원본을 임시 분리한 회귀 실행에서도 미디어 테스트 3/3이 통과했고 동일 해시로 복원됐다. Next Image가 AVIF를 전송했으며 첫 로컬 측정은 transfer 13,970B, 약 131ms였다.
- Supabase는 server-only repository로만 접근한다. 브라우저 공개 환경변수, localStorage, 런타임 JSON CMS, Auth·Realtime은 사용하지 않는다.
- 로컬 Supabase reset, pgTAP 53/53, database lint, security/performance advisor를 검증했다. 호스팅 프로젝트 생성·연결과 Vercel 배포는 사용자 승인 전까지 보류한다.
- 사용자가 확정한 민감자료 선별 결정을 반영했다. 계약·동의서·합류제안서, 개인 대화, 혼합 강의자료·복제물, 중복본과 `~$` 파일은 내용을 열지 않고 경로만 EXCLUDE 처리했다. 후속 파일명 전용 스캔에서 발견한 카카오톡 이름 이미지 7개도 경로 메타데이터만 기록했으며 이미지 내용·해시·미리보기에는 접근하지 않았다. 직접 작성한 과제·포트폴리오·화면 로직 등은 읽기 허용일 뿐 공개 승인으로 간주하지 않는다. 절대 Desktop 경로의 존재 여부는 로컬에서 한 번 확인했지만 커밋된 테스트는 사용자 머신 경로 존재에 의존하지 않는다.

## 최종 판정

미해결 중대 불일치: 없음

공개 배포 전에 남은 사용자 승인 항목은 [TODO.md](../../TODO.md)에 1개 완료·9개 보류 상태로 분리했다.
