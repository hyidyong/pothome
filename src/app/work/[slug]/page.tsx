import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { CaseStudyPage } from "@/components/portfolio/case-study-page";
import { createPortfolioRepository } from "@/lib/portfolio/repository";

export const revalidate = 3600;

type WorkRouteProps = {
  params: Promise<{ slug: string }>;
};

const repository = createPortfolioRepository();
const getCaseStudy = cache((slug: string) => repository.getCaseStudy(slug));

export async function generateStaticParams() {
  const slugs = await repository.getPublishedSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: WorkRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);

  if (!caseStudy) {
    return { title: "프로젝트를 찾을 수 없습니다" };
  }

  return {
    title: `${caseStudy.title} | 전략기획 포트폴리오`,
    description: caseStudy.summary,
  };
}

export default async function WorkRoute({ params }: WorkRouteProps) {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);

  if (!caseStudy) {
    notFound();
  }

  return <CaseStudyPage caseStudy={caseStudy} />;
}
