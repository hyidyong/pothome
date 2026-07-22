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
const profileFocusSchema = z
  .array(
    z.object({
      role: nonBlankText,
      percentage: z.number().int().positive().max(100),
    }),
  )
  .min(1)
  .superRefine((focus, context) => {
    const total = focus.reduce(
      (sum, focusItem) => sum + focusItem.percentage,
      0,
    );

    if (total !== 100) {
      context.addIssue({
        code: "custom",
        message: "Profile focus percentages must total 100",
      });
    }
  });

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

const narrativeSectionKinds = [
  "decision",
  "context",
  "evidence",
  "insight",
  "options",
  "recommendation",
  "execution",
  "limits",
  "contribution",
] as const;

const sectionSchema = z.object({
  kind: z.enum(narrativeSectionKinds),
  title: nonBlankText,
  body: nonBlankText,
  sort_order: sortOrder,
});

const caseDetailSchema = caseSummarySchema.safeExtend({
  sections: z.array(sectionSchema),
});

const nullableNonBlankText = nonBlankText.nullable();

const resumeTimelineEntrySchema = z.object({
  section: z.literal("timeline"),
  year: z.number().int().min(1900).max(2100),
  kind: z.enum(["work", "project", "activity", "award", "education"]),
  title: nonBlankText,
  organization: nullableNonBlankText,
  role: nullableNonBlankText,
  period: nonBlankText,
  summary: nonBlankText,
  evidence_note: nullableNonBlankText,
  case_study_slug: nullableNonBlankText,
  sort_order: sortOrder,
});

const resumeTrainingEntrySchema = z.object({
  section: z.literal("training"),
  year: z.null(),
  kind: z.enum(["training", "education"]),
  title: nonBlankText,
  organization: nullableNonBlankText,
  role: nullableNonBlankText,
  period: nonBlankText,
  summary: nonBlankText,
  evidence_note: nullableNonBlankText,
  case_study_slug: nullableNonBlankText,
  sort_order: sortOrder,
});

const resumeCredentialEntrySchema = z.object({
  section: z.literal("credential"),
  year: z.null(),
  kind: z.literal("credential"),
  title: nonBlankText,
  organization: nullableNonBlankText,
  role: nullableNonBlankText,
  period: nonBlankText,
  summary: nonBlankText,
  evidence_note: nullableNonBlankText,
  case_study_slug: nullableNonBlankText,
  sort_order: sortOrder,
});

const resumeEntrySchema = z.union([
  resumeTimelineEntrySchema,
  resumeTrainingEntrySchema,
  resumeCredentialEntrySchema,
]);

const resumeEntryArraySchema = z.preprocess((value) => {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.map((entry) => {
    if (typeof entry !== "object" || entry === null) {
      return entry;
    }

    const row = entry as Record<string, unknown>;
    return {
      ...row,
      year: Object.hasOwn(row, "year") ? row.year : row.display_year,
      kind: Object.hasOwn(row, "kind") ? row.kind : row.entry_kind,
    };
  });
}, z.array(resumeEntrySchema));

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
        profile_focus: profileFocusSchema,
      }),
      cases: z.array(caseSummarySchema),
    }),
    input,
  );

  return {
    profile: {
      headline: parsed.profile.headline,
      summary: parsed.profile.summary,
      focus: parsed.profile.profile_focus,
    },
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
  const sectionByKind = new Map(
    sections.map((section) => [section.kind, section]),
  );
  const missingKinds = narrativeSectionKinds.filter(
    (kind) => !sectionByKind.has(kind),
  );

  if (missingKinds.length > 0) {
    throw new Error(
      `Published case study requires all narrative sections: ${missingKinds.join(", ")}`,
    );
  }

  const decision = sectionByKind.get("decision")!;
  const contribution = sectionByKind.get("contribution")!;

  return {
    ...normalizeCaseSummary(parsed),
    decision: decision.body,
    contribution: contribution.body,
    sections: sections.map<CaseStudySection>((section) => ({
      kind: section.kind,
      title: section.title,
      body: section.body,
    })),
  };
}

export function normalizeResumeData(input: unknown): ResumeData {
  const parsed = parsePublicData(resumeEntryArraySchema, input);
  const timelineEntries = new Map<number, ResumeData["timeline"][number]["entries"]>();
  const training = [] as ResumeData["training"];
  const credentials = [] as ResumeData["credentials"];

  for (const entry of [...parsed].sort(
    (left, right) => left.sort_order - right.sort_order,
  )) {
    if (entry.section === "training") {
      training.push({
        title: entry.title,
        period: entry.period,
        summary: entry.summary,
      });
      continue;
    }

    if (entry.section === "credential") {
      credentials.push({
        title: entry.title,
        period: entry.period,
        summary: entry.summary,
      });
      continue;
    }

    const entries = timelineEntries.get(entry.year) ?? [];
    entries.push({
        title: entry.title,
        organization: entry.organization,
        role: entry.role,
        period: entry.period,
        kind: entry.kind,
        summary: entry.summary,
        evidenceNote: entry.evidence_note,
        caseStudySlug: entry.case_study_slug,
      });
    timelineEntries.set(entry.year, entries);
  }

  return {
    timeline: [...timelineEntries.entries()]
      .map(([year, entries]) => ({ year, entries }))
      .sort((left, right) => right.year - left.year),
    training,
    credentials,
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
