import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

it("renders the approved hero promise", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "복잡한 신호를, 실행 가능한 전략으로.",
    }),
  ).toBeInTheDocument();
});
