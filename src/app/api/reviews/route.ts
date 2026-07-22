import { NextResponse } from "next/server";
import { z } from "zod";

import { createReviewComment, getReviewComments } from "@/lib/review-board/repository";

const reviewSchema = z.object({
  authorName: z.string().trim().min(1).max(24),
  body: z.string().trim().min(2).max(1500),
  rating: z.number().int().min(1).max(5),
});

export async function GET() {
  return NextResponse.json(await getReviewComments());
}

export async function POST(request: Request) {
  const payload = reviewSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "이름, 별점, 댓글을 다시 확인해 주세요." }, { status: 400 });
  }
  try {
    return NextResponse.json(await createReviewComment(payload.data), { status: 201 });
  } catch {
    return NextResponse.json({ error: "댓글을 저장하지 못했습니다." }, { status: 500 });
  }
}
