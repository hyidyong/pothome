import { readFile, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import { getPickerAssetPath } from "@/lib/asset-picker/repository";
import { rejectNonLocalAssetPickerRequest } from "@/lib/asset-picker/local-only";

const desktopRoot = resolve(process.env.USERPROFILE ?? "", "OneDrive", "Desktop");
const extractedRoot = resolve(process.cwd(), "tmp", "asset-picker-extracted");
const uploadRoot = resolve(process.cwd(), "tmp", "asset-picker-uploads");

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const rejected = rejectNonLocalAssetPickerRequest(request);
  if (rejected) return rejected;
  const { id } = await params;
  const asset = await getPickerAssetPath(id);
  if (!asset) {
    return new Response(null, { status: 404 });
  }

  const filePath = resolve(asset.file_path);
  const isAllowedPath = [desktopRoot, extractedRoot, uploadRoot].some((root) => {
    const candidate = relative(root, filePath);
    return !candidate.startsWith("..") && !isAbsolute(candidate);
  });
  if (!isAbsolute(filePath) || !isAllowedPath) {
    return new Response(null, { status: 403 });
  }

  try {
    const metadata = await stat(filePath);
    if (!metadata.isFile()) return new Response(null, { status: 404 });
    return new Response(await readFile(filePath), {
      headers: {
        "cache-control": "private, max-age=3600",
        "content-length": String(metadata.size),
        "content-type": asset.mime_type,
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
