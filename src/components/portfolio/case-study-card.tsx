import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { CaseStudySummary, PublicMetric } from "@/lib/portfolio/types";

const sourceStatusLabels = {
  measured: "실측",
  documented: "문서화",
  external: "외부 자료",
  proposal: "제안 단계",
  research: "조사·연구",
} as const satisfies Record<PublicMetric["sourceStatus"], string>;

type CaseStudyCardProps = {
  caseStudy: CaseStudySummary;
  presentation: "lead" | "support";
};

export function CaseStudyCard({ caseStudy, presentation }: CaseStudyCardProps) {
  const metrics = caseStudy.metrics.slice(0, 3);

  return (
    <article className="case-study-card" data-presentation={presentation}>
      <Link
        className="case-study-card__link"
        href={`/work/${caseStudy.slug}`}
        aria-label={`프로젝트 열기: ${caseStudy.title}`}
      >
        <div className="case-study-card__topline">
          <span>{caseStudy.role}</span>
          <span aria-hidden="true">↗</span>
        </div>

        <div
          className="case-study-card__metrics"
          aria-label="검증된 프로젝트 수치"
        >
          {metrics.map((metric) => (
            <div
              className="case-study-card__metric"
              key={`${metric.value}-${metric.label}`}
            >
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
              <small>
                근거 상태: {sourceStatusLabels[metric.sourceStatus]}
              </small>
            </div>
          ))}
        </div>

        <div className="case-study-card__copy">
          <h3>{caseStudy.title}</h3>
          <p>{caseStudy.summary}</p>
          <div className="case-study-card__tags" aria-label="프로젝트 태그">
            {caseStudy.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}
