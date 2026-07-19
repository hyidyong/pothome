import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const repositoryHarness = vi.hoisted(() => ({
  getHomePageData: vi.fn().mockResolvedValue({
    profile: {
      headline: "복잡한 신호를, 실행 가능한 전략으로.",
      summary: "근거를 실행 가능한 전략으로 연결합니다.",
      focus: [
        { role: "전략기획", percentage: 65 },
        { role: "HR", percentage: 20 },
        { role: "PM", percentage: 15 },
      ],
    },
    cases: [],
  }),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/portfolio/repository", () => ({
  createPortfolioRepository: () => repositoryHarness,
}));
vi.mock("@/components/portfolio/decision-spine", () => ({
  DecisionSpine: () => <section aria-label="Decision Spine" />,
}));

import Home from "@/app/page";

it("renders the approved hero promise from the server repository", async () => {
  render(await Home());
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "복잡한 신호를, 실행 가능한 전략으로.",
    }),
  ).toBeInTheDocument();
  expect(repositoryHarness.getHomePageData).toHaveBeenCalledTimes(1);
});
