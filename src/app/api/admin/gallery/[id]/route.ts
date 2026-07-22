import { NextResponse } from "next/server";
import { z } from "zod";

import {
  updateGalleryMetadata,
  updatePickerDecision,
} from "@/lib/asset-picker/repository";
import { rejectNonLocalAssetPickerRequest } from "@/lib/asset-picker/local-only";

const metadataSchema = z.object({
  category: z.enum(["field", "result", "credential"]),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(600).nullable(),
});

const paramsSchema = z.object({ id: z.string().uuid() });

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rejected = rejectNonLocalAssetPickerRequest(request);
  if (rejected) return rejected;

  const parsedParams = paramsSchema.safeParse(await params);
  const payload = metadataSchema.safeParse(await request.json());
  if (!parsedParams.success || !payload.success) {
    return NextResponse.json({ error: "Invalid gallery payload." }, { status: 400 });
  }

  try {
    await updateGalleryMetadata(parsedParams.data.id, {
      ...payload.data,
      description: payload.data.description || null,
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Gallery update failed." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rejected = rejectNonLocalAssetPickerRequest(request);
  if (rejected) return rejected;
  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid asset id." }, { status: 400 });
  }

  try {
    // Keep the original local file untouched; this only removes it from publication.
    await updatePickerDecision(parsedParams.data.id, "rejected");
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Gallery removal failed." }, { status: 500 });
  }
}
