import { ProjectGallery } from "@/components/portfolio/project-gallery";
import { SiteHeader } from "@/components/site-header";
import { getSelectedGalleryAssets } from "@/lib/asset-picker/repository";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const assets = await getSelectedGalleryAssets().catch(() => []);

  return (
    <div className="content-page">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <ProjectGallery assets={assets} />
      </main>
    </div>
  );
}
