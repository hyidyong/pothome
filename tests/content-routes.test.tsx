import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/portfolio/hero-section";

describe("content navigation and meaningful hero metrics", () => {
  it("exposes dedicated Gallery and PR Room routes in desktop navigation", () => {
    render(<SiteHeader />);
    const navigation = screen.getByRole("navigation", { name: "주요 탐색" });

    expect(within(navigation).getByRole("link", { name: "Gallery" })).toHaveAttribute(
      "href",
      "/gallery",
    );
    expect(within(navigation).getByRole("link", { name: "PR Room" })).toHaveAttribute(
      "href",
      "/press",
    );
    expect(screen.getByRole("link", { name: "홈: 손희정 전략기획 포트폴리오" })).toBeInTheDocument();
  });

  it("introduces Son Heejeong with a dedicated, descriptive profile image", () => {
    render(<HeroSection profile={{ headline: "전략으로 연결합니다.", summary: "", focus: [] }} />);
    expect(screen.getByText("손희정")).toBeInTheDocument();
    expect(screen.getByText("SON HEEJEONG · STRATEGY PLANNER")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "전략기획자 손희정 프로필 사진" })).toHaveAttribute(
      "src",
      expect.stringContaining("son-heejeong-profile.png"),
    );
  });

  it("replaces unexplained role percentages with dated, verifiable context", () => {
    render(
      <HeroSection
        profile={{
          headline: "복잡한 신호를, 실행 가능한 전략으로.",
          summary: "근거를 선택지와 실행안으로 연결합니다.",
          focus: [],
        }}
      />,
    );

    const metrics = screen.getByRole("list", { name: "활동 기준 지표" });
    expect(within(metrics).getByText("2022–2026")).toBeInTheDocument();
    expect(within(metrics).getByText("3건")).toBeInTheDocument();
    expect(within(metrics).getByText("6회")).toBeInTheDocument();
    expect(within(metrics).queryByText("65%")).not.toBeInTheDocument();
  });
});
