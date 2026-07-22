export type PublicMetric = {
  value: string;
  label: string;
  sourceStatus:
    "measured" | "documented" | "external" | "proposal" | "research";
};

export type CaseStudySummary = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  metrics: PublicMetric[];
  tags: string[];
};

export type ProfileFocus = {
  role: string;
  percentage: number;
};

export type HomePageData = {
  profile: {
    headline: string;
    summary: string;
    focus: ProfileFocus[];
  };
  cases: CaseStudySummary[];
};

export type CaseStudySection = {
  kind:
    | "decision"
    | "context"
    | "evidence"
    | "insight"
    | "options"
    | "recommendation"
    | "execution"
    | "limits"
    | "contribution";
  title: string;
  body: string;
};

export type CaseStudyDetail = CaseStudySummary & {
  decision: string;
  contribution: string;
  sections: CaseStudySection[];
};

export type ResumeEntryKind =
  | "work"
  | "project"
  | "activity"
  | "award"
  | "education";

export type ResumeEntry = {
  title: string;
  organization: string | null;
  role: string | null;
  period: string;
  kind: ResumeEntryKind;
  summary: string;
  evidenceNote: string | null;
  caseStudySlug: string | null;
};

export type ResumeYear = { year: number; entries: ResumeEntry[] };

export type ResumeTrainingEntry = {
  title: string;
  period: string;
  summary: string;
};

export type ResumeCredentialEntry = {
  title: string;
  period: string;
  summary: string;
};

export type ResumeData = {
  timeline: ResumeYear[];
  training: ResumeTrainingEntry[];
  credentials: ResumeCredentialEntry[];
};
