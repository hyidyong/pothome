import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AssetPicker } from "@/components/asset-picker/asset-picker";

const assets = [
  {
    id: "8f33cce8-1b5d-4e50-bfaa-6eacb5d9c905",
    fileName: "현장-브리핑.jpg",
    sourceGroup: "청년창업위원회 활동",
    mimeType: "image/jpeg",
    byteSize: 328_000,
    decision: "undecided" as const,
  },
  {
    id: "3d7f1a0e-9b99-4359-9e36-3d73b4fc9178",
    fileName: "전략-워크숍.png",
    sourceGroup: "REWORK",
    mimeType: "image/png",
    byteSize: 720_000,
    decision: "selected" as const,
  },
];

describe("AssetPicker", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });

  it("shows database-backed image candidates without exposing their local paths", () => {
    render(<AssetPicker assets={assets} />);

    expect(screen.getByText("2개 후보")).toBeInTheDocument();
    expect(screen.getAllByText("청년창업위원회 활동")).toHaveLength(2);
    expect(screen.queryByText(/C:\\Users\\/)).not.toBeInTheDocument();
  });

  it("persists a selection through the decision endpoint", async () => {
    render(<AssetPicker assets={assets} />);

    fireEvent.click(screen.getAllByRole("button", { name: "선택" })[0]!);

    expect(fetch).toHaveBeenCalledWith("/api/asset-picker/decision", {
      body: JSON.stringify({
        assetId: assets[0]!.id,
        decision: "selected",
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
  });
});
