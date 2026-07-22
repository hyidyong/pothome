import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getGalleryMotionPolicy } from "@/components/portfolio/gallery-motion";
import { PrRoom } from "@/components/portfolio/pr-room";
import { ProjectGallery } from "@/components/portfolio/project-gallery";
import type { GalleryAsset } from "@/lib/asset-picker/repository";
import type { PressRelease } from "@/lib/press-room/repository";

const assets = [
  { id: "ea222cac-a481-4e04-a55b-ca740ede4680", fileName: "field.jpg", sourceGroup: "현장", mimeType: "image/jpeg", category: "field", label: "현장 기록", title: "워크숍 현장", description: "참여자 논의 장면" },
  { id: "37b1a405-9c14-427c-99cb-bcd8d0efa53b", fileName: "strategy.png", sourceGroup: "REWORK", mimeType: "image/png", category: "strategy", label: "전략 증빙", title: "리서치 보드", description: null },
  { id: "0ce9ad01-2a59-4054-b4e3-21acdcaed056", fileName: "product.png", sourceGroup: "Fitory", mimeType: "image/png", category: "product", label: "제품 실행", title: "프로토타입", description: null },
] satisfies GalleryAsset[];

const releases = [
  { id: "8e9e53f7-5540-4bcc-9de8-66e4602e0ffb", publisher: "한겨레", headline: "전략 기획 프로젝트의 새로운 기록", summary: "검증된 근거를 바탕으로 실행안을 정리했습니다.", publishedOn: "2026-07-20", thumbnailAssetId: null, externalUrl: null },
] satisfies PressRelease[];

describe("ProjectGallery", () => {
  it("uses uniform cards, category tabs, and a quiet detail reader", () => {
    render(<ProjectGallery assets={assets} />);
    const field = screen.getByRole("region", { name: "현장 갤러리" });
    fireEvent.click(within(field).getByRole("button", { name: /현장 기록: 워크숍 현장/ }));
    const dialog = screen.getByRole("dialog", { name: "현장 기록 상세 보기" });
    expect(within(dialog).getByRole("heading", { name: "워크숍 현장" })).toBeInTheDocument();
    expect(within(dialog).getByText("참여자 논의 장면")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "상세 보기 닫기" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("PrRoom", () => {
  it("renders database-backed typography-first release cards and an honest empty state", () => {
    const { rerender } = render(<PrRoom releases={releases} />);
    const region = screen.getByRole("region", { name: "PR Room" });
    expect(within(region).getByText("한겨레")).toBeInTheDocument();
    expect(within(region).getByRole("heading", { level: 2, name: releases[0].headline })).toBeInTheDocument();
    rerender(<PrRoom releases={[]} />);
    expect(screen.getByText("공개된 보도자료가 아직 없습니다.")).toBeInTheDocument();
  });
});

describe("gallery motion policy", () => {
  it("keeps 390px and reduced-motion users static while retaining click detail", () => {
    expect(getGalleryMotionPolicy({ width: 390, reducedMotion: false })).toEqual({ fan: false, hover: false, flip: false });
    expect(getGalleryMotionPolicy({ width: 1280, reducedMotion: true })).toEqual({ fan: false, hover: false, flip: false });
    expect(getGalleryMotionPolicy({ width: 1280, reducedMotion: false })).toEqual({ fan: true, hover: true, flip: true });
  });
});
