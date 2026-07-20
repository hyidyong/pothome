import { beforeEach, describe, expect, it, vi } from "vitest";

type RecordedFilter = {
  table: string;
  column: string;
  value: unknown;
};

type RecordedOrder = {
  table: string;
  column: string;
  options: unknown;
};

type QueryResult = {
  data: unknown;
  error: null;
};

type QueryBuilder = {
  select(columns: string): QueryBuilder;
  eq(column: string, value: unknown): QueryBuilder;
  order(column: string, options?: unknown): QueryBuilder;
  limit(count: number): QueryBuilder;
  maybeSingle(): QueryBuilder;
  then(
    onFulfilled: (value: QueryResult) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ): Promise<unknown>;
};

const repositoryHarness = vi.hoisted(() => {
  const filters: RecordedFilter[] = [];
  const selections: Array<{ table: string; columns: string }> = [];
  const orders: RecordedOrder[] = [];

  const detailCase = {
    slug: "global-technical-talent-strategy",
    title: "Global Technical Talent Strategy",
    summary: "채용 전략 요약",
    category: "People Strategy",
    sort_order: 1,
    metrics: [],
    tags: [],
    sections: [
      {
        kind: "decision",
        title: "결정",
        body: "결정 내용",
        sort_order: 1,
      },
      { kind: "context", title: "맥락", body: "맥락 내용", sort_order: 2 },
      { kind: "evidence", title: "근거", body: "근거 내용", sort_order: 3 },
      { kind: "insight", title: "통찰", body: "통찰 내용", sort_order: 4 },
      { kind: "options", title: "대안", body: "대안 내용", sort_order: 5 },
      {
        kind: "recommendation",
        title: "권고",
        body: "권고 내용",
        sort_order: 6,
      },
      {
        kind: "execution",
        title: "실행 설계",
        body: "실행 내용",
        sort_order: 7,
      },
      { kind: "limits", title: "한계", body: "한계 내용", sort_order: 8 },
      {
        kind: "contribution",
        title: "담당 범위",
        body: "기여 내용",
        sort_order: 9,
      },
    ],
  };

  const resumeEntries = [
    {
      section: "timeline",
      year: 2026,
      kind: "activity",
      title: "YLC completion and HR deputy activity",
      organization: "YLC",
      role: "HR deputy",
      period: "First half of 2026",
      summary: "Supported YLC completion and HR operations.",
      evidence_note: null,
      case_study_slug: null,
      sort_order: 2,
    },
    {
      section: "training",
      year: null,
      kind: "training",
      title: "Human AI Foundation completion",
      organization: null,
      role: null,
      period: "Year undisclosed",
      summary: "A publicly listed training completion.",
      evidence_note: null,
      case_study_slug: null,
      sort_order: 1,
    },
  ];

  return {
    filters,
    selections,
    orders,
    client: {
      from(table: string) {
        let selectsSingleRow = false;
        let selectsSlug = false;

        const builder: QueryBuilder = {
          select(columns) {
            selections.push({ table, columns });
            return builder;
          },
          eq(column, value) {
            filters.push({ table, column, value });
            if (column === "slug") {
              selectsSlug = true;
            }
            return builder;
          },
          order(column, options) {
            orders.push({ table, column, options });
            return builder;
          },
          limit() {
            return builder;
          },
          maybeSingle() {
            selectsSingleRow = true;
            return builder;
          },
          then(onFulfilled, onRejected) {
            let data: unknown = [];

            if (table === "site_profile") {
              data = {
                headline: "복잡한 신호를, 실행 가능한 전략으로.",
                summary: "근거에서 실행까지",
                profile_focus: [
                  { role: "전략기획", percentage: 65 },
                  { role: "HR", percentage: 20 },
                  { role: "PM", percentage: 15 },
                ],
              };
            } else if (table === "case_studies" && selectsSlug) {
              data = detailCase;
            } else if (table === "experience_entries") {
              data = resumeEntries;
            } else if (selectsSingleRow) {
              data = null;
            }

            return Promise.resolve({ data, error: null }).then(
              onFulfilled,
              onRejected,
            );
          },
        };

        return builder;
      },
    },
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: () => repositoryHarness.client,
}));

import { createPortfolioRepository } from "@/lib/portfolio/repository";

describe("PortfolioRepository metric query filters", () => {
  beforeEach(() => {
    repositoryHarness.filters.length = 0;
    repositoryHarness.selections.length = 0;
    repositoryHarness.orders.length = 0;
  });

  it("selects and returns the profile focus from the server repository", async () => {
    const repository = createPortfolioRepository();

    const home = await repository.getHomePageData();

    expect(repositoryHarness.selections).toContainEqual({
      table: "site_profile",
      columns: "headline, summary, profile_focus",
    });
    expect(home.profile.focus).toEqual([
      { role: "전략기획", percentage: 65 },
      { role: "HR", percentage: 20 },
      { role: "PM", percentage: 15 },
    ]);
  });

  it("qualifies both embedded verified filters with the selected metrics alias", async () => {
    const repository = createPortfolioRepository();

    await repository.getHomePageData();
    await repository.getCaseStudy("global-technical-talent-strategy");

    const verifiedFilterColumns = repositoryHarness.filters
      .filter((filter) => filter.column.endsWith(".verified"))
      .map((filter) => filter.column);

    expect(verifiedFilterColumns).toEqual([
      "metrics.verified",
      "metrics.verified",
    ]);
    expect(verifiedFilterColumns).not.toContain("case_study_metrics.verified");
  });

  it("retrieves only published structured resume data in chronological order", async () => {
    const repository = createPortfolioRepository();

    const resume = await repository.getResumeData();

    expect(repositoryHarness.selections).toContainEqual({
      table: "experience_entries",
      columns:
        "section, year:display_year, kind:entry_kind, title, organization, role, period:period_label, summary, evidence_note, case_study_slug, sort_order:display_order",
    });
    expect(repositoryHarness.filters).toContainEqual({
      table: "experience_entries",
      column: "published",
      value: true,
    });
    expect(repositoryHarness.orders).toEqual([
      {
        table: "experience_entries",
        column: "display_year",
        options: { ascending: false },
      },
      {
        table: "experience_entries",
        column: "display_order",
        options: { ascending: true },
      },
    ]);
    expect(resume.timeline).toEqual([
      {
        year: 2026,
        entries: [
          {
            title: "YLC completion and HR deputy activity",
            organization: "YLC",
            role: "HR deputy",
            period: "First half of 2026",
            kind: "activity",
            summary: "Supported YLC completion and HR operations.",
            evidenceNote: null,
            caseStudySlug: null,
          },
        ],
      },
    ]);
    expect(resume.training).toEqual([
      { title: "Human AI Foundation completion" },
    ]);
  });
});
