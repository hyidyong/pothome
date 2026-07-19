import { describe, expect, it } from "vitest";

import {
  normalizeCaseStudy,
  normalizeHomeData,
  normalizePublishedSlugs,
  normalizeResumeData,
} from "@/lib/portfolio/normalize";

const approvedHeadline = "복잡한 신호를, 실행 가능한 전략으로.";
const approvedProfileFocus = [
  { role: "전략기획", percentage: 65 },
  { role: "HR", percentage: 20 },
  { role: "PM", percentage: 15 },
];

function makeProfile(overrides: Record<string, unknown> = {}) {
  return {
    headline: approvedHeadline,
    summary: "근거에서 실행까지",
    profile_focus: approvedProfileFocus,
    ...overrides,
  };
}

function makeCase(overrides: Record<string, unknown> = {}) {
  return {
    slug: "global-technical-talent-strategy",
    title: "Global Technical Talent Strategy",
    summary: "채용 전략 요약",
    category: "People Strategy",
    sort_order: 1,
    metrics: [
      {
        value_text: "21",
        label: "기업 응답",
        source_status: "documented_project",
        verified: true,
        sort_order: 1,
      },
      {
        value_text: "38",
        label: "유효 후보자 응답",
        source_status: "documented_project",
        verified: true,
        sort_order: 2,
      },
    ],
    tags: [],
    ...overrides,
  };
}

describe("normalizeHomeData", () => {
  it("rejects a homepage without a published profile", () => {
    expect(() => normalizeHomeData({ profile: null, cases: [] })).toThrow(
      "Published site profile is required",
    );
  });

  it("preserves the approved Hero copy exactly", () => {
    const result = normalizeHomeData({
      profile: makeProfile(),
      cases: [],
    });

    expect(result.profile.headline).toBe(approvedHeadline);
  });

  it("normalizes the approved profile focus from Supabase data", () => {
    const result = normalizeHomeData({
      profile: makeProfile(),
      cases: [],
    });

    expect(result.profile.focus).toEqual(approvedProfileFocus);
    expect(
      result.profile.focus.reduce(
        (total, focus) => total + focus.percentage,
        0,
      ),
    ).toBe(100);
  });

  it("rejects a profile focus whose percentages do not total 100", () => {
    expect(() =>
      normalizeHomeData({
        profile: makeProfile({
          profile_focus: [
            { role: "전략기획", percentage: 60 },
            { role: "HR", percentage: 20 },
            { role: "PM", percentage: 15 },
          ],
        }),
        cases: [],
      }),
    ).toThrow("Profile focus percentages must total 100");
  });

  it("sorts cases and verified metrics by sort_order", () => {
    const result = normalizeHomeData({
      profile: makeProfile(),
      cases: [
        makeCase({
          slug: "second",
          sort_order: 2,
          metrics: [
            {
              value_text: "38",
              label: "유효 후보자 응답",
              source_status: "measured",
              verified: true,
              sort_order: 2,
            },
            {
              value_text: "21",
              label: "기업 응답",
              source_status: "measured",
              verified: true,
              sort_order: 1,
            },
          ],
        }),
        makeCase({ slug: "first", sort_order: 1 }),
      ],
    });

    expect(result.cases.map((caseStudy) => caseStudy.slug)).toEqual([
      "first",
      "second",
    ]);
    expect(result.cases[1]?.metrics.map((metric) => metric.value)).toEqual([
      "21",
      "38",
    ]);
  });

  it("filters unverified rows before strict public metric validation", () => {
    const result = normalizeHomeData({
      profile: makeProfile(),
      cases: [
        makeCase({
          metrics: [
            {
              value_text: "59",
              label: "합산",
              source_status: "derived",
              verified: false,
              sort_order: 1,
            },
          ],
        }),
      ],
    });

    expect(result.cases[0]?.metrics).toEqual([]);
  });

  it("keeps 21 and 38 separate and never exposes 59", () => {
    const result = normalizeHomeData({
      profile: makeProfile(),
      cases: [
        makeCase({
          metrics: [
            {
              value_text: "38",
              label: "유효 후보자 응답",
              source_status: "measured",
              verified: true,
              sort_order: 2,
            },
            {
              value_text: "59",
              label: "합산",
              source_status: "derived",
              verified: false,
              sort_order: 3,
            },
            {
              value_text: "21",
              label: "기업 응답",
              source_status: "measured",
              verified: true,
              sort_order: 1,
            },
          ],
        }),
      ],
    });

    const values = result.cases[0]?.metrics.map((metric) => metric.value);
    expect(values).toEqual(["21", "38"]);
    expect(values).not.toContain("59");
  });

  it("rejects a verified invented total defensively", () => {
    expect(() =>
      normalizeHomeData({
        profile: makeProfile(),
        cases: [
          makeCase({
            metrics: [
              {
                value_text: "59",
                label: "합산",
                source_status: "measured",
                verified: true,
                sort_order: 1,
              },
            ],
          }),
        ],
      }),
    ).toThrow("Invented public metric value 59 is forbidden");
  });

  it("rejects the known raw candidate sample value defensively", () => {
    expect(() =>
      normalizeHomeData({
        profile: makeProfile(),
        cases: [
          makeCase({
            metrics: [
              {
                value_text: "40",
                label: "후보자 원자료",
                source_status: "measured",
                verified: true,
                sort_order: 1,
              },
            ],
          }),
        ],
      }),
    ).toThrow("Raw candidate sample value 40 is forbidden");
  });

  it("allows a legitimate verified 40 for an unrelated case", () => {
    const result = normalizeHomeData({
      profile: makeProfile(),
      cases: [
        makeCase({
          slug: "re100-cf100-transition-strategy",
          metrics: [
            {
              value_text: "40",
              label: "검증된 분석 범위",
              source_status: "documented_project",
              verified: true,
              sort_order: 1,
            },
          ],
        }),
      ],
    });

    expect(result.cases[0]?.metrics.map((metric) => metric.value)).toEqual([
      "40",
    ]);
  });

  it("fails clearly when required public data is malformed", () => {
    expect(() =>
      normalizeHomeData({
        profile: makeProfile({ summary: "" }),
        cases: [],
      }),
    ).toThrow("Malformed public portfolio data");
  });

  it("normalizes nested tag join rows to labels in stable order", () => {
    const result = normalizeHomeData({
      profile: makeProfile(),
      cases: [
        makeCase({
          tags: [
            { sort_order: 3, tag: { label: "Research" } },
            { sort_order: 1, tag: { label: "Strategy" } },
            { sort_order: 2, tag: { label: "People" } },
          ],
        }),
      ],
    });

    expect(result.cases[0]?.tags).toEqual(["Strategy", "People", "Research"]);
  });
});

describe("normalizeCaseStudy", () => {
  it("sorts sections and derives required detail copy from stored sections", () => {
    const result = normalizeCaseStudy(
      makeCase({
        sections: [
          {
            kind: "execution",
            title: "실행 설계",
            body: "실행 기여 내용",
            sort_order: 2,
          },
          {
            kind: "challenge",
            title: "의사결정 문제",
            body: "결정해야 할 내용",
            sort_order: 1,
          },
        ],
      }),
    );

    expect(result.decision).toBe("결정해야 할 내용");
    expect(result.contribution).toBe("실행 기여 내용");
    expect(result.sections.map((section) => section.kind)).toEqual([
      "challenge",
      "execution",
    ]);
  });

  it("fails clearly when required decision or contribution sections are absent", () => {
    expect(() =>
      normalizeCaseStudy(
        makeCase({
          sections: [
            {
              kind: "challenge",
              title: "의사결정 문제",
              body: "결정해야 할 내용",
              sort_order: 1,
            },
          ],
        }),
      ),
    ).toThrow("Published case study requires challenge and execution sections");
  });
});

describe("normalizeResumeData", () => {
  it("returns published entries in stable order without inventing copy", () => {
    const result = normalizeResumeData([
      {
        title: "Product Discovery & Execution",
        period: "Selected proposals and prototypes",
        summary: "제품 전략 요약",
        sort_order: 2,
      },
      {
        title: "Strategy Research & Decision Design",
        period: "Selected documented projects",
        summary: "전략 기획 요약",
        sort_order: 1,
      },
    ]);

    expect(result.entries.map((entry) => entry.title)).toEqual([
      "Strategy Research & Decision Design",
      "Product Discovery & Execution",
    ]);
    expect(result.entries[0]?.organization).toBeNull();
  });
});

describe("normalizePublishedSlugs", () => {
  it("validates and returns slugs in stable public order", () => {
    expect(
      normalizePublishedSlugs([
        { slug: "second", sort_order: 2 },
        { slug: "first", sort_order: 1 },
      ]),
    ).toEqual(["first", "second"]);
  });
});
