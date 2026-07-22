import { AssetPicker } from "@/components/asset-picker/asset-picker";
import { getPickerAssetCount, getPickerAssets } from "@/lib/asset-picker/repository";
import { isLocalAssetPickerHost } from "@/lib/asset-picker/local-only";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const pageSize = 48;

export default async function AssetPickerPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (!isLocalAssetPickerHost((await headers()).get("host"))) {
    notFound();
  }
  const requestedPage = Number((await searchParams).page ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [assets, total] = await Promise.all([
    getPickerAssets({ limit: pageSize, offset: (page - 1) * pageSize }),
    getPickerAssetCount(),
  ]);
  return <AssetPicker assets={assets} page={page} total={total} />;
}
