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
    | "challenge"
    | "evidence"
    | "insight"
    | "recommendation"
    | "execution"
    | "limits";
  title: string;
  body: string;
};

export type CaseStudyDetail = CaseStudySummary & {
  decision: string;
  contribution: string;
  sections: CaseStudySection[];
};

export type ResumeEntry = {
  title: string;
  organization: string | null;
  period: string;
  summary: string;
};

export type ResumeData = { entries: ResumeEntry[] };
