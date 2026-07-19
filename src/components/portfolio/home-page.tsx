import { DecisionSpine } from "@/components/portfolio/decision-spine";
import { EvidenceRail } from "@/components/portfolio/evidence-rail";
import { HeroSection } from "@/components/portfolio/hero-section";
import { LawLensSection } from "@/components/portfolio/law-lens-section";
import { Reveal } from "@/components/portfolio/reveal";
import { SelectedWork } from "@/components/portfolio/selected-work";
import { SiteFooter } from "@/components/portfolio/site-footer";
import { SupportingWork } from "@/components/portfolio/supporting-work";
import { SiteHeader } from "@/components/site-header";
import type { HomePageData } from "@/lib/portfolio/types";

type HomePageProps = {
  data: HomePageData;
};

export function HomePage({ data }: HomePageProps) {
  return (
    <div className="home-page">
      <SiteHeader />
      <main>
        <HeroSection profile={data.profile} />
        <Reveal>
          <EvidenceRail />
        </Reveal>
        <Reveal>
          <SelectedWork cases={data.cases} />
        </Reveal>
        <DecisionSpine />
        <Reveal>
          <LawLensSection />
        </Reveal>
        <Reveal>
          <SupportingWork cases={data.cases} />
        </Reveal>
      </main>
      <Reveal>
        <SiteFooter />
      </Reveal>
    </div>
  );
}
