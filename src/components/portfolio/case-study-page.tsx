import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type {
  CaseStudyDetail,
  CaseStudySection,
  PublicMetric,
} from "@/lib/portfolio/types";

const sourceStatusLabels = {
  measured: "실측",
  documented: "문서화",
  external: "외부 자료",
  proposal: "제안 단계",
  research: "조사·연구",
} as const satisfies Record<PublicMetric["sourceStatus"], string>;

type CaseStudyPageProps = {
  caseStudy: CaseStudyDetail;
};

export function CaseStudyPage({ caseStudy }: CaseStudyPageProps) {
  const sectionByKind = new Map<CaseStudySection["kind"], CaseStudySection>(
    caseStudy.sections.map((section) => [section.kind, section]),
  );
  const context = sectionByKind.get("context");
  const evidence = sectionByKind.get("evidence");
  const insight = sectionByKind.get("insight");
  const options = sectionByKind.get("options");
  const recommendation = sectionByKind.get("recommendation");
  const execution = sectionByKind.get("execution");
  const limits = sectionByKind.get("limits");

  return (
    <main className="case-study-page">
      <nav className="case-study-page__nav" aria-label="프로젝트 경로">
        <Link href="/#work" aria-label="전체 프로젝트로 돌아가기">
          <ArrowLeftIcon aria-hidden="true" />
          <span>Selected Work</span>
        </Link>
      </nav>

      <header className="case-study-page__hero">
        <div className="case-study-page__identity">
          <p>{caseStudy.role}</p>
          <h1>{caseStudy.title}</h1>
        </div>
        <div className="case-study-page__summary-wrap">
          <p className="case-study-page__summary">{caseStudy.summary}</p>
          {caseStudy.slug === "pacemate-academic-os" ? (
            <a
              className="case-study-page__live-link"
              href="https://pacemate-git-main-handhj03-3080s-projects.vercel.app/login"
              target="_blank"
              rel="noreferrer"
            >
              Substudy 배포 열기 <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </header>

      <div className="case-study-page__body">
        <section
          className="case-study-page__snapshot"
          aria-labelledby="executive-snapshot-title"
        >
          <div className="case-study-page__section-label">
            <p>00 · At a glance</p>
            <h2 id="executive-snapshot-title">Executive snapshot</h2>
          </div>

          <div className="case-study-page__snapshot-content">
            <div
              className="case-study-page__metrics"
              aria-label="검증된 프로젝트 수치"
            >
              {caseStudy.metrics.map((metric) => (
                <article
                  className="case-study-page__metric"
                  key={`${metric.value}-${metric.label}`}
                >
                  <strong>{metric.value}</strong>
                  <p>{metric.label}</p>
                  <small>
                    근거 상태: {sourceStatusLabels[metric.sourceStatus]}
                  </small>
                </article>
              ))}
            </div>
            <div className="case-study-page__tags" aria-label="프로젝트 태그">
              {caseStudy.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <div className="case-study-page__narrative">
          <section aria-labelledby="decision-title">
            <div className="case-study-page__section-label">
              <p>01 · Decision frame</p>
              <h2 id="decision-title">Decision</h2>
            </div>
            <div className="case-study-page__prose">
              <p>{caseStudy.decision}</p>
            </div>
          </section>

          <section aria-labelledby="context-title">
            <div className="case-study-page__section-label">
              <p>02 · Constraints</p>
              <h2 id="context-title">Context</h2>
            </div>
            <div className="case-study-page__prose">
              {context ? (
                <>
                  <h3>{context.title}</h3>
                  <p>{context.body}</p>
                </>
              ) : null}
            </div>
          </section>

          <section aria-labelledby="evidence-title">
            <div className="case-study-page__section-label">
              <p>03 · Source scope</p>
              <h2 id="evidence-title">Evidence</h2>
            </div>
            <div className="case-study-page__prose">
              {evidence ? (
                <>
                  <h3>{evidence.title}</h3>
                  <p>{evidence.body}</p>
                </>
              ) : null}
            </div>
          </section>

          <section aria-labelledby="insight-title">
            <div className="case-study-page__section-label">
              <p>04 · What changed</p>
              <h2 id="insight-title">Insight chain</h2>
            </div>
            <div className="case-study-page__prose">
              {insight ? (
                <>
                  <h3>{insight.title}</h3>
                  <p>{insight.body}</p>
                </>
              ) : null}
            </div>
          </section>

          <section aria-labelledby="options-title">
            <div className="case-study-page__section-label">
              <p>05 · Trade-offs</p>
              <h2 id="options-title">Options and criteria</h2>
            </div>
            <div className="case-study-page__prose">
              {options ? (
                <>
                  <h3>{options.title}</h3>
                  <p>{options.body}</p>
                </>
              ) : null}
            </div>
          </section>

          <section aria-labelledby="recommendation-title">
            <div className="case-study-page__section-label">
              <p>06 · Chosen direction</p>
              <h2 id="recommendation-title">Recommendation</h2>
            </div>
            <div className="case-study-page__prose">
              {recommendation ? <p>{recommendation.body}</p> : null}
            </div>
          </section>

          <section aria-labelledby="execution-title">
            <div className="case-study-page__section-label">
              <p>07 · Operating model</p>
              <h2 id="execution-title">Execution</h2>
            </div>
            <div className="case-study-page__prose">
              {execution ? (
                <>
                  <h3>{execution.title}</h3>
                  <p>{execution.body}</p>
                </>
              ) : null}
            </div>
          </section>

          <section aria-labelledby="limits-title">
            <div className="case-study-page__section-label">
              <p>08 · Evidence status</p>
              <h2 id="limits-title">Outcome and limits</h2>
            </div>
            <div className="case-study-page__prose">
              {limits ? (
                <>
                  <h3>{limits.title}</h3>
                  <p>{limits.body}</p>
                </>
              ) : null}
            </div>
          </section>

          <section aria-labelledby="contribution-title">
            <div className="case-study-page__section-label">
              <p>09 · Ownership</p>
              <h2 id="contribution-title">My contribution</h2>
            </div>
            <div className="case-study-page__prose">
              <p>{caseStudy.contribution}</p>
            </div>
          </section>
        </div>
      </div>

      <footer className="case-study-page__footer">
        <p>Next signal</p>
        <Link href="/#work">다른 프로젝트 살펴보기</Link>
      </footer>
    </main>
  );
}
