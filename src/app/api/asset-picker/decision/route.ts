import { NextResponse } from "next/server";
import { z } from "zod";

import { updatePickerDecision } from "@/lib/asset-picker/repository";
import { rejectNonLocalAssetPickerRequest } from "@/lib/asset-picker/local-only";

const payloadSchema = z.object({
  assetId: z.string().uuid(),
  decision: z.enum(["undecided", "selected", "rejected"]),
});

export async function POST(request: Request) {
  const rejected = rejectNonLocalAssetPickerRequest(request);
  if (rejected) return rejected;
  const payload = payloadSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid decision payload." }, { status: 400 });
  }

  try {
    await updatePickerDecision(payload.data.assetId, payload.data.decision);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Catalog update failed." }, { status: 500 });
  }
}
