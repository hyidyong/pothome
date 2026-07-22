import { DecisionSpine } from "@/components/portfolio/decision-spine";
import { EvidenceRail } from "@/components/portfolio/evidence-rail";
import { HeroSection } from "@/components/portfolio/hero-section";
import { LawLensSection } from "@/components/portfolio/law-lens-section";
import { Reveal } from "@/components/portfolio/reveal";
import { ProjectGallery } from "@/components/portfolio/project-gallery";
import { SelectedWork } from "@/components/portfolio/selected-work";
import { SiteFooter } from "@/components/portfolio/site-footer";
import { SupportingWork } from "@/components/portfolio/supporting-work";
import { SiteHeader } from "@/components/site-header";
import type { HomePageData } from "@/lib/portfolio/types";
import type { GalleryAsset } from "@/lib/asset-picker/repository";

type HomePageProps = {
  data: HomePageData;
  galleryAssets: GalleryAsset[];
};

export function HomePage({ data, galleryAssets }: HomePageProps) {
  return (
    <div className="home-page">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <HeroSection profile={data.profile} />
        <Reveal>
          <EvidenceRail />
        </Reveal>
        <SelectedWork cases={data.cases} />
        <ProjectGallery assets={galleryAssets} headingLevel={2} />
        <DecisionSpine />
        <Reveal>
          <LawLensSection />
        </Reveal>
        <SupportingWork cases={data.cases} />
      </main>
      <Reveal>
        <SiteFooter />
      </Reveal>
    </div>
  );
}
