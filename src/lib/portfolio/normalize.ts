import { z } from "zod";

import type {
  CaseStudyDetail,
  CaseStudySection,
  CaseStudySummary,
  HomePageData,
  PublicMetric,
  ResumeData,
} from "@/lib/portfolio/types";

const nonBlankText = z
  .string()
  .refine((value) => value.trim().length > 0, "must not be blank");
const sortOrder = z.number().int().positive();

const sourceStatusSchema = z.enum([
  "measured",
  "documented",
  "external",
  "proposal",
  "research",
  "documented_project",
  "exploratory_research",
  "proposal_prototype",
  "independent_research",
  "unpublished_draft",
]);

const metricSchema = z
  .object({
    value_text: nonBlankText,
    label: nonBlankText,
    source_status: sourceStatusSchema,
    verified: z.literal(true),
    sort_order: sortOrder,
  })
  .superRefine((metric, context) => {
    if (metric.value_text === "59") {
      context.addIssue({
        code: "custom",
        message: "Invented public metric value 59 is forbidden",
        path: ["value_text"],
      });
    }
  });

const verifiedMetricArraySchema = z.preprocess((value) => {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.filter(
    (metric) =>
      typeof metric === "object" &&
      metric !== null &&
      "verified" in metric &&
      metric.verified === true,
  );
}, z.array(metricSchema));

const tagJoinSchema = z.object({
  sort_order: sortOrder,
  tag: z.object({ label: nonBlankText }),
});

const caseSummarySchema = z
  .object({
    slug: nonBlankText,
    title: nonBlankText,
    summary: nonBlankText,
    category: nonBlankText,
    sort_order: sortOrder,
    metrics: verifiedMetricArraySchema,
    tags: z.array(tagJoinSchema),
  })
  .refine(
    (caseStudy) =>
      caseStudy.slug !== "global-technical-talent-strategy" ||
      caseStudy.metrics.every((metric) => metric.value_text !== "40"),
    {
      message: "Raw candidate sample value 40 is forbidden",
      path: ["metrics"],
    },
  );

const sectionSchema = z.object({
  kind: z.enum([
    "challenge",
    "evidence",
    "insight",
    "recommendation",
    "execution",
    "limits",
  ]),
  title: nonBlankText,
  body: nonBlankText,
  sort_order: sortOrder,
});

const caseDetailSchema = caseSummarySchema.safeExtend({
  sections: z.array(sectionSchema),
});

const resumeEntrySchema = z.object({
  title: nonBlankText,
  period: nonBlankText,
  summary: nonBlankText,
  sort_order: sortOrder,
});

const sourceStatusMap = {
  measured: "measured",
  documented: "documented",
  external: "external",
  proposal: "proposal",
  research: "research",
  documented_project: "documented",
  exploratory_research: "research",
  proposal_prototype: "proposal",
  independent_research: "research",
  unpublished_draft: "research",
} as const satisfies Record<
  z.infer<typeof sourceStatusSchema>,
  PublicMetric["sourceStatus"]
>;

function parsePublicData<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "data"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Malformed public portfolio data: ${details}`);
  }

  return result.data;
}

function normalizeMetrics(
  metrics: z.infer<typeof caseSummarySchema>["metrics"],
): PublicMetric[] {
  return [...metrics]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((metric) => ({
      value: metric.value_text,
      label: metric.label,
      sourceStatus: sourceStatusMap[metric.source_status],
    }));
}

function normalizeCaseSummary(
  caseStudy: z.infer<typeof caseSummarySchema>,
): CaseStudySummary {
  return {
    slug: caseStudy.slug,
    title: caseStudy.title,
    summary: caseStudy.summary,
    role: caseStudy.category,
    metrics: normalizeMetrics(caseStudy.metrics),
    tags: [...caseStudy.tags]
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((join) => join.tag.label),
  };
}

export function normalizeHomeData(input: unknown): HomePageData {
  if (
    typeof input === "object" &&
    input !== null &&
    "profile" in input &&
    input.profile === null
  ) {
    throw new Error("Published site profile is required");
  }

  const parsed = parsePublicData(
    z.object({
      profile: z.object({
        headline: nonBlankText,
        summary: nonBlankText,
      }),
      cases: z.array(caseSummarySchema),
    }),
    input,
  );

  return {
    profile: parsed.profile,
    cases: [...parsed.cases]
      .sort((left, right) => left.sort_order - right.sort_order)
      .map(normalizeCaseSummary),
  };
}

export function normalizeCaseStudy(input: unknown): CaseStudyDetail {
  const parsed = parsePublicData(caseDetailSchema, input);
  const sections = [...parsed.sections].sort(
    (left, right) => left.sort_order - right.sort_order,
  );
  const challenge = sections.find((section) => section.kind === "challenge");
  const execution = sections.find((section) => section.kind === "execution");

  if (!challenge || !execution) {
    throw new Error(
      "Published case study requires challenge and execution sections",
    );
  }

  return {
    ...normalizeCaseSummary(parsed),
    decision: challenge.body,
    contribution: execution.body,
    sections: sections.map<CaseStudySection>((section) => ({
      kind: section.kind,
      title: section.title,
      body: section.body,
    })),
  };
}

export function normalizeResumeData(input: unknown): ResumeData {
  const parsed = parsePublicData(z.array(resumeEntrySchema), input);

  return {
    entries: [...parsed]
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((entry) => ({
        title: entry.title,
        organization: null,
        period: entry.period,
        summary: entry.summary,
      })),
  };
}

export function normalizePublishedSlugs(input: unknown): string[] {
  const parsed = parsePublicData(
    z.array(
      z.object({
        slug: nonBlankText,
        sort_order: sortOrder,
      }),
    ),
    input,
  );

  return [...parsed]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((caseStudy) => caseStudy.slug);
}
