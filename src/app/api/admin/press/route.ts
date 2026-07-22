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
    return NextResponse.json({ error: "발행처, 제목, 요약, 발행일을 모두 확인해 주세요. 기사 링크는 https:// 형식이어야 합니다." }, { status: 400 });
  }
  try {
    await createPressRelease(payload.data);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json({ error: `보도자료 저장에 실패했습니다: ${message}` }, { status: 500 });
  }
}
