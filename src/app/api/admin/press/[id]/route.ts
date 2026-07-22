import { NextResponse } from "next/server";
import { z } from "zod";

import { rejectNonLocalAssetPickerRequest } from "@/lib/asset-picker/local-only";
import { deletePressRelease } from "@/lib/press-room/repository";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const rejected = rejectNonLocalAssetPickerRequest(request);
  if (rejected) return rejected;
  const params = paramsSchema.safeParse(await context.params);
  if (!params.success) return new NextResponse(null, { status: 400 });
  await deletePressRelease(params.data.id);
  return new NextResponse(null, { status: 204 });
}
