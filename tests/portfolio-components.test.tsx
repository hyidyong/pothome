import { fireEvent, render, screen, within } from "@testing-library/react";

import { CaseStudyCard } from "@/components/portfolio/case-study-card";
import { EvidenceRail } from "@/components/portfolio/evidence-rail";
import { HeroSection } from "@/components/portfolio/hero-section";
import { LawLensSection } from "@/components/portfolio/law-lens-section";
import { SelectedWork } from "@/components/portfolio/selected-work";
import { SiteFooter } from "@/components/portfolio/site-footer";
import { SupportingWork } from "@/components/portfolio/supporting-work";
import { SiteHeader } from "@/components/site-header";
import type { CaseStudySummary, HomePageData } from "@/lib/portfolio/types";

const cases = [
  {
    slug: "global-technical-talent-strategy",
    title: "Global Technical Talent Strategy",
    summary:
      "기업과 후보자 데이터를 한 퍼널에 겹쳐 채용 병목과 지원안을 설계했습니다.",
    role: "Strategy · People",
    metrics: [
      { value: "21 + 38", label: "양면 리서치", sourceStatus: "measured" },
      { value: "13개국", label: "후보자 범위", sourceStatus: "measured" },
      { value: "제안", label: "통합 지원안", sourceStatus: "proposal" },
      {
        value: "4번째",
        label: "카드 표시 한도 밖",
        sourceStatus: "documented",
      },
    ],
    tags: ["Strategy", "People"],
  },
  {
    slug: "re100-cf100-transition-strategy",
    title: "RE100 × CF100 Transition Strategy",
    summary: "에너지 전환의 제약을 ESS·PPA 중심의 실행 선택지로 번역했습니다.",
    role: "Strategy · Energy",
    metrics: [
      { value: "57", label: "분석 결과", sourceStatus: "documented" },
      { value: "2", label: "인터뷰", sourceStatus: "measured" },
    ],
    tags: ["Strategy", "Energy"],
  },
  {
    slug: "fitory-market-validation",
    title: "Fitory Market Validation",
    summary: "설문에서 MVP와 스모크테스트까지 우선순위를 좁혔습니다.",
    role: "PM · 0→1",
    metrics: [
      { value: "118", label: "정량 응답", sourceStatus: "measured" },
      { value: "43", label: "심층 응답", sourceStatus: "research" },
    ],
    tags: ["PM", "Market Validation"],
  },
  {
    slug: "pacemate-academic-os",
    title: "PaceMate Academic OS",
    summary: "학사·상담·학습 실행을 하나의 제품 흐름으로 설계했습니다.",
    role: "Product · Education",
    metrics: [{ value: "15주", label: "로드맵", sourceStatus: "proposal" }],
    tags: ["Product", "Education"],
  },
  {
    slug: "vietnam-beauty-growth-thesis",
    title: "Vietnam Beauty Growth Thesis",
    summary: "채널별 성장 문법을 재구성한 독립 전략 연구입니다.",
    role: "Strategy · Growth",
    metrics: [{ value: "51장", label: "전략 연구", sourceStatus: "research" }],
    tags: ["Growth", "Research"],
  },
  {
    slug: "ai-prediction-regulation",
    title: "AI Prediction Regulation",
    summary: "분절된 규율을 위험기반의 3단계 모델로 번역했습니다.",
    role: "Research · AI",
    metrics: [{ value: "3단계", label: "비교 모델", sourceStatus: "external" }],
    tags: ["AI", "Research"],
  },
] satisfies CaseStudySummary[];

const homePageData = {
  profile: {
    headline: "복잡한 신호를, 실행 가능한 전략으로.",
    summary:
      "법학의 구조적 사고로 시장·사람·제품의 근거를 읽고, 의사결정 문서와 실행 로드맵으로 바꿉니다.",
  },
  cases,
} satisfies HomePageData;

it("renders only the approved editorial evidence values", () => {
  render(<EvidenceRail />);

  const region = screen.getByRole("region", { name: "대표 검증 수치" });
  expect(within(region).getByText("21 + 38")).toBeInTheDocument();
  expect(within(region).getByText("57")).toBeInTheDocument();
  expect(within(region).getByText("118")).toBeInTheDocument();
  expect(within(region).queryByText("59")).not.toBeInTheDocument();
  expect(within(region).queryByText("40")).not.toBeInTheDocument();
});

it("provides matching desktop and accessible mobile navigation", async () => {
  render(<SiteHeader />);

  const desktopNavigation = screen.getByRole("navigation", {
    name: "주요 탐색",
  });
  const destinations = [
    ["Work", "#work"],
    ["Decision Spine", "#decision-spine"],
    ["About", "#about"],
    ["Resume", "/resume"],
  ] as const;

  for (const [name, href] of destinations) {
    expect(
      within(desktopNavigation).getByRole("link", { name }),
    ).toHaveAttribute("href", href);
  }

  const trigger = screen.getByRole("button", { name: "메뉴 열기" });
  trigger.focus();
  expect(trigger).toHaveFocus();
  fireEvent.click(trigger);

  const dialog = await screen.findByRole("dialog", {
    name: "포트폴리오 메뉴",
  });
  expect(dialog).toHaveAccessibleDescription(
    "작업, 판단 방법론, 소개와 공개 이력서로 이동합니다.",
  );

  const mobileNavigation = within(dialog).getByRole("navigation", {
    name: "모바일 주요 탐색",
  });
  for (const [name, href] of destinations) {
    expect(
      within(mobileNavigation).getByRole("link", { name }),
    ).toHaveAttribute("href", href);
  }

  expect(
    document.querySelectorAll("button button, button a, a button, a a"),
  ).toHaveLength(0);
});

it("renders the typed profile, exact promise, and descriptive hero image", () => {
  render(<HeroSection profile={homePageData.profile} />);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "복잡한 신호를, 실행 가능한 전략으로.",
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(homePageData.profile.summary)).toBeInTheDocument();
  expect(screen.getByText("Strategy Planning · HR · PM")).toBeInTheDocument();

  const image = screen.getByRole("img", {
    name: "문서, 시장 지도와 의사결정 노드가 하나의 실행 방향으로 수렴하는 추상 전략 이미지",
  });
  expect(image).toHaveAttribute("alt");
  expect(image.getAttribute("alt")?.trim()).not.toBe("");
});

it("renders a case as one semantic link with capped metrics and source status", () => {
  render(<CaseStudyCard caseStudy={cases[0]!} presentation="lead" />);

  const link = screen.getByRole("link", {
    name: "프로젝트 열기: Global Technical Talent Strategy",
  });
  expect(link).toHaveAttribute(
    "href",
    "/work/global-technical-talent-strategy",
  );
  expect(link.closest("article")).toHaveAttribute("data-presentation", "lead");
  expect(link.querySelectorAll("a, button")).toHaveLength(0);
  expect(within(link).getByText("21 + 38")).toBeInTheDocument();
  expect(within(link).getByText("13개국")).toBeInTheDocument();
  expect(within(link).getByText("제안")).toBeInTheDocument();
  expect(within(link).queryByText("4번째")).not.toBeInTheDocument();
  expect(within(link).getAllByText("근거 상태: 실측")).toHaveLength(2);
  expect(within(link).getByText("근거 상태: 제안 단계")).toBeInTheDocument();
});

it("keeps the first three cases as lead work and the remaining three as support", () => {
  const { rerender } = render(<SelectedWork cases={homePageData.cases} />);

  const leadRegion = screen.getByRole("region", {
    name: "조사량이 아니라, 판단의 깊이를 보여줍니다.",
  });
  const leadArticles = within(leadRegion).getAllByRole("article");
  expect(leadArticles).toHaveLength(3);
  expect(
    leadArticles.every((article) => article.dataset.presentation === "lead"),
  ).toBe(true);
  expect(
    within(leadRegion).getByRole("heading", {
      level: 2,
      name: "조사량이 아니라, 판단의 깊이를 보여줍니다.",
    }),
  ).toBeInTheDocument();
  expect(
    within(leadRegion).queryByText("PaceMate Academic OS"),
  ).not.toBeInTheDocument();

  rerender(<SupportingWork cases={homePageData.cases} />);

  const supportRegion = screen.getByRole("region", {
    name: "전략을 중심으로, 사람과 제품까지 연결합니다.",
  });
  const supportArticles = within(supportRegion).getAllByRole("article");
  expect(supportArticles).toHaveLength(3);
  expect(
    supportArticles.every(
      (article) => article.dataset.presentation === "support",
    ),
  ).toBe(true);
  expect(
    within(supportRegion).getByRole("heading", {
      level: 2,
      name: "전략을 중심으로, 사람과 제품까지 연결합니다.",
    }),
  ).toBeInTheDocument();
  expect(
    within(supportRegion).queryByText("Global Technical Talent Strategy"),
  ).not.toBeInTheDocument();
});

it("omits optional supporting work instead of rendering an empty card", () => {
  const { container } = render(<SupportingWork cases={cases.slice(0, 3)} />);

  expect(container).toBeEmptyDOMElement();
});

it("gives the law lens and footer stable headings and safe internal links", () => {
  render(
    <>
      <LawLensSection />
      <SiteFooter />
    </>,
  );

  const lawRegion = screen.getByRole("region", {
    name: "법학은 목적지가 아니라, 더 나은 전략을 위한 렌즈입니다.",
  });
  expect(
    within(lawRegion).getByRole("heading", {
      level: 2,
      name: "법학은 목적지가 아니라, 더 나은 전략을 위한 렌즈입니다.",
    }),
  ).toBeInTheDocument();
  expect(within(lawRegion).getAllByRole("heading", { level: 3 })).toHaveLength(
    3,
  );

  expect(
    screen.getByRole("heading", {
      level: 2,
      name: "다음 움직임을, 근거에서 시작합니다.",
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "대표 프로젝트 보기" }),
  ).toHaveAttribute("href", "/work/global-technical-talent-strategy");
});
