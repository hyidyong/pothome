import { CaseStudyCard } from "@/components/portfolio/case-study-card";
import type { HomePageData } from "@/lib/portfolio/types";

type SupportingWorkProps = {
  cases: HomePageData["cases"];
};

export function SupportingWork({ cases }: SupportingWorkProps) {
  const supportCases = cases.slice(3, 6);

  if (supportCases.length === 0) {
    return null;
  }

  return (
    <section
      className="portfolio-section supporting-work"
      aria-labelledby="supporting-work-title"
    >
      <header className="portfolio-section__header">
        <p>04 · Additional Evidence</p>
        <h2 id="supporting-work-title">
          전략을 중심으로, 사람과 제품까지 연결합니다.
        </h2>
      </header>
      <div className="supporting-work__grid">
        {supportCases.map((caseStudy) => (
          <CaseStudyCard
            key={caseStudy.slug}
            caseStudy={caseStudy}
            presentation="support"
          />
        ))}
      </div>
    </section>
  );
}
