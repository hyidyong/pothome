import { mkdir, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { extname, resolve } from "node:path";

import { NextResponse } from "next/server";

import { createUploadedGalleryAsset } from "@/lib/asset-picker/repository";
import { rejectNonLocalAssetPickerRequest } from "@/lib/asset-picker/local-only";

const uploadRoot = resolve(process.cwd(), "tmp", "asset-picker-uploads");
const maxUploadBytes = 10 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionFor(file: File) {
  const extension = extname(file.name).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(extension)) return extension;
  return { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" }[file.type] ?? "";
}

export async function POST(request: Request) {
  const rejected = rejectNonLocalAssetPickerRequest(request);
  if (rejected) return rejected;

  const form = await request.formData();
  const file = form.get("file");
  const titleValue = form.get("title");
  const title = typeof titleValue === "string" ? titleValue.trim() : "";
  if (!(file instanceof File) || !title || !allowedMimeTypes.has(file.type) || file.size === 0 || file.size > maxUploadBytes) {
    return NextResponse.json({ error: "JPG, PNG, WebP, GIF 형식의 10MB 이하 이미지를 선택해 주세요." }, { status: 400 });
  }

  const storedName = `${randomUUID()}${extensionFor(file)}`;
  const filePath = resolve(uploadRoot, storedName);
  await mkdir(uploadRoot, { recursive: true });
  try {
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()), { flag: "wx" });
    const id = await createUploadedGalleryAsset({
      filePath,
      fileName: file.name || storedName,
      mimeType: file.type,
      byteSize: file.size,
      category: "result",
      title,
      description: null,
      decision: "rejected",
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    await unlink(filePath).catch(() => undefined);
    return NextResponse.json({ error: "보도자료 썸네일 업로드에 실패했습니다." }, { status: 500 });
  }
}
