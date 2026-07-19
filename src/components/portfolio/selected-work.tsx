import { CaseStudyCard } from "@/components/portfolio/case-study-card";
import type { HomePageData } from "@/lib/portfolio/types";

type SelectedWorkProps = {
  cases: HomePageData["cases"];
};

export function SelectedWork({ cases }: SelectedWorkProps) {
  const leadCases = cases.slice(0, 3);

  return (
    <section
      id="work"
      className="portfolio-section selected-work"
      aria-labelledby="selected-work-title"
    >
      <header className="portfolio-section__header">
        <p>01 · Selected Work</p>
        <h2 id="selected-work-title">
          조사량이 아니라, 판단의 깊이를 보여줍니다.
        </h2>
      </header>
      <div className="selected-work__grid">
        {leadCases.map((caseStudy) => (
          <CaseStudyCard
            key={caseStudy.slug}
            caseStudy={caseStudy}
            presentation="lead"
          />
        ))}
      </div>
    </section>
  );
}
