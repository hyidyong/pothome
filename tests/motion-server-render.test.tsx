// @vitest-environment node

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DecisionSpine } from "@/components/portfolio/decision-spine";
import { Reveal } from "@/components/portfolio/reveal";

describe("motion server rendering", () => {
  it("renders Reveal content visibly before client enhancement", () => {
    const markup = renderToStaticMarkup(
      <Reveal className="server-contract">Server-visible content</Reveal>,
    );

    expect(markup).toContain('class="reveal server-contract"');
    expect(markup).toContain('data-reveal-state="visible"');
    expect(markup).toContain("Server-visible content");
    expect(markup).not.toContain("aria-hidden");
    expect(markup).not.toContain("style=");
  });

  it("keeps every Decision Spine step in semantic server markup", () => {
    const markup = renderToStaticMarkup(<DecisionSpine />);

    expect(markup).toContain('<section id="decision-spine"');
    expect(markup).toContain('aria-labelledby="decision-spine-heading"');
    expect(markup).toContain('<h2 id="decision-spine-heading"');
    expect(markup.match(/<article/g)).toHaveLength(4);
    expect(markup).toContain("Frame the decision");
    expect(markup).toContain("Gather evidence");
    expect(markup).toContain("Compare options");
    expect(markup).toContain("Design the move");
    expect(markup).toContain(
      "조사의 주제가 아니라 실제로 내려야 하는 결정을 한 문장으로 고정합니다.",
    );
    expect(markup).toContain(
      "시장·규제·조직·사용자 근거의 출처와 한계를 분리해 수집합니다.",
    );
    expect(markup).toContain(
      "각 선택지를 같은 평가 기준에 올리고 트레이드오프를 드러냅니다.",
    );
    expect(markup).toContain(
      "권고안을 로드맵·운영 모델·다음 검증 지표로 연결합니다.",
    );
  });
});
