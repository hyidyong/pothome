import { PrRoom } from "@/components/portfolio/pr-room";
import { SiteHeader } from "@/components/site-header";
import { getPressReleases } from "@/lib/press-room/repository";

export const dynamic = "force-dynamic";

export default async function PressPage() {
  const releases = await getPressReleases().catch(() => []);
  return (
    <div className="content-page">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <PrRoom releases={releases} />
      </main>
    </div>
  );
}
