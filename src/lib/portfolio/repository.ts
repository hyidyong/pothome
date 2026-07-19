import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";

import {
  normalizeCaseStudy,
  normalizeHomeData,
  normalizePublishedSlugs,
  normalizeResumeData,
} from "@/lib/portfolio/normalize";
import type {
  CaseStudyDetail,
  HomePageData,
  ResumeData,
} from "@/lib/portfolio/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const HOME_CASE_COLUMNS = `
  slug,
  title,
  summary,
  category,
  sort_order:display_order,
  metrics:case_study_metrics (
    value_text,
    label,
    source_status,
    verified,
    sort_order:display_order
  ),
  tags:case_study_tags (
    sort_order:id,
    tag:tags (
      label:name
    )
  )
`;

const DETAIL_CASE_COLUMNS = `
  slug,
  title,
  summary,
  category,
  sort_order:display_order,
  metrics:case_study_metrics (
    value_text,
    label,
    source_status,
    verified,
    sort_order:display_order
  ),
  tags:case_study_tags (
    sort_order:id,
    tag:tags (
      label:name
    )
  ),
  sections:case_study_sections (
    kind,
    title:heading,
    body,
    sort_order:display_order
  )
`;

export interface PortfolioRepository {
  getHomePageData(): Promise<HomePageData>;
  getCaseStudy(slug: string): Promise<CaseStudyDetail | null>;
  getPublishedSlugs(): Promise<string[]>;
  getResumeData(): Promise<ResumeData>;
}

function throwQueryError(operation: string, error: PostgrestError): never {
  throw new Error(
    `Portfolio repository ${operation} failed: ${error.message}`,
    { cause: error },
  );
}

function throwDataError(operation: string, error: unknown): never {
  const message = error instanceof Error ? error.message : "Unknown data error";
  throw new Error(
    `Portfolio repository ${operation} returned invalid data: ${message}`,
    { cause: error },
  );
}

export function createPortfolioRepository(): PortfolioRepository {
  const supabase = createSupabaseServerClient();

  return {
    async getHomePageData() {
      const profileQuery = supabase
        .from("site_profile")
        .select("headline, summary, profile_focus")
        .eq("published", true)
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();
      const casesQuery = supabase
        .from("case_studies")
        .select(HOME_CASE_COLUMNS)
        .eq("status", "published")
        .eq("metrics.verified", true)
        .order("display_order", { ascending: true });

      const [profileResult, casesResult] = await Promise.all([
        profileQuery,
        casesQuery,
      ]);

      if (profileResult.error) {
        throwQueryError("getHomePageData profile query", profileResult.error);
      }
      if (casesResult.error) {
        throwQueryError("getHomePageData cases query", casesResult.error);
      }

      try {
        return normalizeHomeData({
          profile: profileResult.data,
          cases: casesResult.data,
        });
      } catch (error) {
        throwDataError("getHomePageData", error);
      }
    },

    async getCaseStudy(slug) {
      const { data, error } = await supabase
        .from("case_studies")
        .select(DETAIL_CASE_COLUMNS)
        .eq("status", "published")
        .eq("slug", slug)
        .eq("metrics.verified", true)
        .maybeSingle();

      if (error) {
        throwQueryError(`getCaseStudy(${JSON.stringify(slug)}) query`, error);
      }
      if (data === null) {
        return null;
      }

      try {
        return normalizeCaseStudy(data);
      } catch (normalizationError) {
        throwDataError(
          `getCaseStudy(${JSON.stringify(slug)})`,
          normalizationError,
        );
      }
    },

    async getPublishedSlugs() {
      const { data, error } = await supabase
        .from("case_studies")
        .select("slug, sort_order:display_order")
        .eq("status", "published")
        .order("display_order", { ascending: true });

      if (error) {
        throwQueryError("getPublishedSlugs query", error);
      }

      try {
        return normalizePublishedSlugs(data);
      } catch (normalizationError) {
        throwDataError("getPublishedSlugs", normalizationError);
      }
    },

    async getResumeData() {
      const { data, error } = await supabase
        .from("experience_entries")
        .select(
          "section, year:display_year, kind:entry_kind, title, organization, role, period:period_label, summary, evidence_note, case_study_slug, sort_order:display_order",
        )
        .eq("published", true)
        .order("display_year", { ascending: false })
        .order("display_order", { ascending: true });

      if (error) {
        throwQueryError("getResumeData query", error);
      }

      try {
        return normalizeResumeData(data);
      } catch (normalizationError) {
        throwDataError("getResumeData", normalizationError);
      }
    },
  };
}
