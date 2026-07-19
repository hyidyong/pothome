import { render, screen, within } from "@testing-library/react";
import { readFile } from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routeHarness = vi.hoisted(() => ({
  getHomePageData: vi.fn(),
  getCaseStudy: vi.fn(),
  getPublishedSlugs: vi.fn(),
  getResumeData: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/portfolio/repository", () => ({
  createPortfolioRepository: () => routeHarness,
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/components/portfolio/decision-spine", () => ({
  DecisionSpine: () => (
    <section aria-labelledby="decision-spine-heading">
      <h2 id="decision-spine-heading">Decision Spine.</h2>
    </section>
  ),
}));

import { CaseStudyPage } from "@/components/portfolio/case-study-page";
import { HomePage } from "@/components/portfolio/home-page";
import { ResumePage } from "@/components/portfolio/resume-page";
import type {
  CaseStudyDetail,
  CaseStudySummary,
  HomePageData,
  ResumeData,
} from "@/lib/portfolio/types";

const cases = [
  {
    slug: "global-technical-talent-strategy",
    title: "Global Technical Talent Strategy",
    summary: "기업과 후보자 데이터를 분리해 채용 병목과 지원안을 설계했습니다.",
    role: "Strategy · People",
    metrics: [
      { value: "21 + 38", label: "양면 리서치", sourceStatus: "measured" },
      { value: "13개국", label: "후보자 범위", sourceStatus: "measured" },
    ],
    tags: ["Strategy", "People"],
  },
  {
    slug: "re100-cf100-transition-strategy",
    title: "RE100 × CF100 Transition Strategy",
    summary: "에너지 전환의 제약을 실행 선택지로 번역했습니다.",
    role: "Strategy · Energy",
    metrics: [{ value: "57", label: "분석 결과", sourceStatus: "documented" }],
    tags: ["Strategy", "Energy"],
  },
  {
    slug: "fitory-market-validation",
    title: "Fitory Market Validation",
    summary: "설문에서 MVP와 스모크테스트까지 우선순위를 좁혔습니다.",
    role: "PM · 0→1",
    metrics: [{ value: "118", label: "정량 응답", sourceStatus: "measured" }],
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
    summary: "분절된 규율을 위험기반의 단계 모델로 번역했습니다.",
    role: "Research · AI",
    metrics: [{ value: "3단계", label: "비교 모델", sourceStatus: "external" }],
    tags: ["AI", "Research"],
  },
] satisfies CaseStudySummary[];

const homePageData = {
  profile: {
    headline: "복잡한 신호를, 실행 가능한 전략으로.",
    summary:
      "법학의 구조적 사고로 시장·사람·제품의 근거를 읽고 실행 로드맵으로 바꿉니다.",
  },
  cases,
} satisfies HomePageData;

const caseStudy = {
  ...cases[0]!,
  decision: "양면 시장의 병목을 어디에서 먼저 해소할지 결정했습니다.",
  contribution: "리서치 구조와 실행 로드맵을 설계했습니다.",
  sections: [
    {
      kind: "challenge",
      title: "의사결정 문제",
      body: "기업과 후보자의 상반된 요구를 같은 기준으로 비교해야 했습니다.",
    },
    {
      kind: "evidence",
      title: "근거 범위",
      body: "기업 21명과 유효 후보자 38명의 응답을 분리해 분석했습니다.",
    },
    {
      kind: "insight",
      title: "핵심 인사이트",
      body: "정보 부족보다 전환 과정의 마찰이 더 큰 병목이었습니다.",
    },
    {
      kind: "recommendation",
      title: "권고안과 비교 기준",
      body: "지원안을 도달성, 실행 난도, 책임 주체 기준으로 비교했습니다.",
    },
    {
      kind: "execution",
      title: "실행 설계",
      body: "우선순위와 다음 검증 질문을 로드맵에 연결했습니다.",
    },
    {
      kind: "limits",
      title: "결과와 한계",
      body: "최종 채택 여부는 확인되지 않아 제안 단계로 표시합니다.",
    },
  ],
} satisfies CaseStudyDetail;

const resumeData = {
  entries: [
    {
      title: "전략 리서치 및 의사결정 설계",
      organization: null,
      period: "2025",
      summary: "복수 근거를 비교해 권고안과 실행 순서를 설계했습니다.",
    },
    {
      title: "제품 가설 검증",
      organization: null,
      period: "2024",
      summary: "정량·정성 신호를 MVP 우선순위로 연결했습니다.",
    },
  ],
} satisfies ResumeData;

function expectBefore(first: Element, second: Element) {
  expect(first.compareDocumentPosition(second)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
}

it("composes the homepage in the approved order with exact evidence and six cases", () => {
  const { container } = render(<HomePage data={homePageData} />);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "복잡한 신호를, 실행 가능한 전략으로.",
    }),
  ).toBeInTheDocument();

  const header = container.querySelector("header.site-header");
  const hero = container.querySelector("section.hero-section");
  const evidence = screen.getByRole("region", { name: "대표 검증 수치" });
  const leadWork = screen.getByRole("region", {
    name: "조사량이 아니라, 판단의 깊이를 보여줍니다.",
  });
  const decisionSpine = screen.getByRole("region", {
    name: "Decision Spine.",
  });
  const lawLens = screen.getByRole("region", {
    name: "법학은 목적지가 아니라, 더 나은 전략을 위한 렌즈입니다.",
  });
  const supportWork = screen.getByRole("region", {
    name: "전략을 중심으로, 사람과 제품까지 연결합니다.",
  });
  const footer = container.querySelector("footer.site-footer");

  for (const landmark of [header, hero, footer]) {
    expect(landmark).not.toBeNull();
  }
  expectBefore(header!, hero!);
  expectBefore(hero!, evidence);
  expectBefore(evidence, leadWork);
  expectBefore(leadWork, decisionSpine);
  expectBefore(decisionSpine, lawLens);
  expectBefore(lawLens, supportWork);
  expectBefore(supportWork, footer!);

  const evidenceRail = within(evidence);
  expect(evidenceRail.getByText("21 + 38")).toBeInTheDocument();
  expect(evidenceRail.getByText("57")).toBeInTheDocument();
  expect(evidenceRail.getByText("118")).toBeInTheDocument();
  expect(evidenceRail.queryByText("59")).not.toBeInTheDocument();
  expect(evidenceRail.queryByText("40")).not.toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /^프로젝트 열기:/ })).toHaveLength(
    6,
  );
});

it("renders the complete strategy-first case narrative without invented evidence", () => {
  const { container } = render(<CaseStudyPage caseStudy={caseStudy} />);

  const backLink = screen.getByRole("link", {
    name: "전체 프로젝트로 돌아가기",
  });
  expect(backLink).toHaveAttribute("href", "/#work");
  expect(backLink.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  expect(container).not.toHaveTextContent("←");
  expect(
    screen.getByRole("heading", { level: 1, name: caseStudy.title }),
  ).toBeInTheDocument();

  const headings = [
    "Executive snapshot",
    "Decision",
    "Context",
    "Evidence",
    "Insight chain",
    "Options and criteria",
    "Recommendation",
    "Execution",
    "Outcome and limits",
    "My contribution",
  ];
  for (const heading of headings) {
    expect(
      screen.getByRole("heading", { level: 2, name: heading }),
    ).toBeInTheDocument();
  }

  expect(screen.getByText("21 + 38")).toBeInTheDocument();
  expect(screen.queryByText("59")).not.toBeInTheDocument();
  expect(screen.queryByText("40")).not.toBeInTheDocument();
  expect(screen.getByText(caseStudy.contribution)).toBeInTheDocument();
});

it("renders only the supplied public resume entries and omits null organizations", () => {
  const { container } = render(<ResumePage data={resumeData} />);

  const backLink = screen.getByRole("link", {
    name: "포트폴리오 홈으로 돌아가기",
  });
  expect(backLink).toHaveAttribute("href", "/");
  expect(backLink.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  expect(container).not.toHaveTextContent("←");
  expect(
    screen.getByRole("heading", { level: 1, name: "공개 이력" }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(2);
  expect(screen.getByText(resumeData.entries[0]!.summary)).toBeInTheDocument();
  expect(container).not.toHaveTextContent(/null|undefined/i);
  expect(container).not.toHaveTextContent(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
  expect(container).not.toHaveTextContent(/01[016789][ -]?\d{3,4}[ -]?\d{4}/);
  expect(container).not.toHaveTextContent(/\b\d{5}\b/);
});

describe("server portfolio routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeHarness.getHomePageData.mockResolvedValue(homePageData);
    routeHarness.getCaseStudy.mockImplementation(async (slug: string) =>
      slug === caseStudy.slug ? caseStudy : null,
    );
    routeHarness.getPublishedSlugs.mockResolvedValue(
      cases.map((item) => item.slug),
    );
    routeHarness.getResumeData.mockResolvedValue(resumeData);
  });

  it("loads the homepage and resume from one server repository contract", async () => {
    const homeRoute = await import("@/app/page");
    const resumeRoute = await import("@/app/resume/page");

    expect(homeRoute.revalidate).toBe(3600);
    expect(resumeRoute.revalidate).toBe(3600);

    const homeView = await homeRoute.default();
    const { unmount } = render(homeView);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "복잡한 신호를, 실행 가능한 전략으로.",
      }),
    ).toBeInTheDocument();
    unmount();

    const resumeView = await resumeRoute.default();
    render(resumeView);
    expect(
      screen.getByRole("heading", { level: 1, name: "공개 이력" }),
    ).toBeInTheDocument();
    expect(routeHarness.getHomePageData).toHaveBeenCalledTimes(1);
    expect(routeHarness.getResumeData).toHaveBeenCalledTimes(1);
  });

  it("generates published work paths and renders only an existing case", async () => {
    const workRoute = await import("@/app/work/[slug]/page");

    expect(workRoute.revalidate).toBe(3600);
    await expect(workRoute.generateStaticParams()).resolves.toEqual(
      cases.map((item) => ({ slug: item.slug })),
    );

    const view = await workRoute.default({
      params: Promise.resolve({ slug: caseStudy.slug }),
    });
    render(view);
    expect(
      screen.getByRole("heading", { level: 1, name: caseStudy.title }),
    ).toBeInTheDocument();
    expect(routeHarness.getCaseStudy).toHaveBeenCalledWith(caseStudy.slug);
  });

  it("returns the not-found boundary for a missing or unpublished case", async () => {
    const workRoute = await import("@/app/work/[slug]/page");

    await expect(
      workRoute.default({
        params: Promise.resolve({ slug: "unpublished-case" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("keeps runtime content server-only with no browser storage or fallback", async () => {
    const routeSources = await Promise.all(
      [
        "../src/app/page.tsx",
        "../src/app/resume/page.tsx",
        "../src/app/work/[slug]/page.tsx",
      ].map((path) => readFile(new URL(path, import.meta.url), "utf8")),
    );
    const source = routeSources.join("\n");

    expect(source).not.toMatch(
      /NEXT_PUBLIC_|service_role|localStorage|\.json["']|realtime|createBrowserClient/i,
    );
    expect(source.match(/revalidate\s*=\s*3600/g)).toHaveLength(3);
  });
});
