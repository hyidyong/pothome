import { ContentStudio } from "@/components/admin/content-studio";
import { SiteHeader } from "@/components/site-header";
import { getSelectedGalleryAssets } from "@/lib/asset-picker/repository";
import { getPressReleases } from "@/lib/press-room/repository";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [assets, releases] = await Promise.all([
    getSelectedGalleryAssets().catch(() => []),
    getPressReleases().catch(() => []),
  ]);
  return <div className="content-page"><SiteHeader /><ContentStudio assets={assets} releases={releases} /></div>;
}
