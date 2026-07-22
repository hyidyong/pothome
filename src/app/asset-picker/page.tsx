import { AssetPicker } from "@/components/asset-picker/asset-picker";
import { getSelectedGalleryAssets } from "@/lib/asset-picker/repository";
import { isLocalAssetPickerHost } from "@/lib/asset-picker/local-only";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AssetPickerPage() {
  if (!isLocalAssetPickerHost((await headers()).get("host"))) {
    notFound();
  }
  const galleryAssets = await getSelectedGalleryAssets();
  const assets = galleryAssets.map((asset) => ({
    id: asset.id,
    fileName: asset.fileName,
    sourceGroup: asset.sourceGroup,
    mimeType: asset.mimeType,
    byteSize: 0,
    decision: "selected" as const,
  }));
  return <AssetPicker assets={assets} total={assets.length} />;
}
