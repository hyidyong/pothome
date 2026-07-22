import { NextResponse } from "next/server";
import { z } from "zod";

import { likeReviewComment } from "@/lib/review-board/repository";

const payloadSchema = z.object({ visitorId: z.string().uuid() });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const payload = payloadSchema.safeParse(await request.json());
  if (!z.string().uuid().safeParse(id).success || !payload.success) {
    return NextResponse.json({ error: "공감 요청을 확인할 수 없습니다." }, { status: 400 });
  }
  try {
    return NextResponse.json({ likeCount: await likeReviewComment(id, payload.data.visitorId) });
  } catch {
    return NextResponse.json({ error: "공감을 저장하지 못했습니다." }, { status: 500 });
  }
}
