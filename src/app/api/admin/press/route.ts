import { NextResponse } from "next/server";
import { z } from "zod";

import { createPressRelease } from "@/lib/press-room/repository";
import { rejectNonLocalAssetPickerRequest } from "@/lib/asset-picker/local-only";

const releaseSchema = z.object({
  publisher: z.string().trim().min(1).max(80),
  headline: z.string().trim().min(1).max(180),
  summary: z.string().trim().min(1).max(500),
  publishedOn: z.string().date(),
  thumbnailAssetId: z.string().uuid().nullable(),
  externalUrl: z.string().url().nullable(),
});

export async function POST(request: Request) {
  const rejected = rejectNonLocalAssetPickerRequest(request);
  if (rejected) return rejected;
  const payload = releaseSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid press release." }, { status: 400 });
  }
  try {
    await createPressRelease(payload.data);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Press release creation failed." }, { status: 500 });
  }
}
