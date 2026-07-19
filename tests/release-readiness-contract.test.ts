import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function readPngWidth(path: string) {
  const buffer = readFileSync(path);
  expect(buffer.subarray(0, 8)).toEqual(
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  );
  return buffer.readUInt32BE(16);
}

describe("release readiness handoff", () => {
  it("preserves ten user-owned actions, including the completed privacy review", () => {
    const todo = readFileSync(join(workspaceRoot, "TODO.md"), "utf8");
    const allActions = todo.match(/^- \[[ x]\] .+$/gm) ?? [];
    const completedActions = todo.match(/^- \[x\] .+$/gm) ?? [];
    const uncheckedActions = todo.match(/^- \[ \] .+$/gm) ?? [];

    expect(allActions).toHaveLength(10);
    expect(completedActions).toHaveLength(1);
    expect(uncheckedActions).toHaveLength(9);
    expect(todo).toContain(
      "- [x] `SENSITIVE_REVIEW.txt`의 제외·검토 대기열을 직접 검토한다.",
    );
    expect(todo).toContain("민감자료 선별 결정 반영 완료");
    expect(todo).toContain("로컬 릴리스 후보 검증 상태");
    expect(todo).toContain("호스팅 Supabase 프로젝트 생성·연결은 보류");
    expect(todo).toContain("Vercel 배포는 보류");
    expect(todo).not.toMatch(/sb_(?:publishable|secret)_/);
  });

  it("records the resolved sensitive-material decision without opening excluded content", () => {
    const queue = readFileSync(
      join(workspaceRoot, "SENSITIVE_REVIEW.txt"),
      "utf8",
    );

    expect(queue).not.toContain("[REVIEW]");
    expect(queue).toMatch(
      /^\[EXCLUDE\].*Fitory_합류제안서\.pdf \| contract \|/m,
    );
    expect(queue).toMatch(/^\[EXCLUDE\].*KakaoTalk_Longtxt_.* \| identity \|/m);
    expect(queue).toMatch(/^\[EXCLUDE\].*학교 과제 모음 zip \| uncertain \|/m);
    expect(queue).toMatch(
      /^\[EXCLUDE\].*AMOREPACIFIC_.*_last\.zip \| uncertain \|/m,
    );
    expect(queue).toMatch(/^\[EXCLUDE\].*\\~\$.*\.pptx \| uncertain \|/m);
    expect(queue).not.toContain("피토리 화면 로직.pdf");
    expect(queue).not.toContain("Fitory — 잠든 옷장에 이자가 쌓인다.html");
    expect(queue).not.toContain("YLC 사유서 자동 생성 폼");
    expect(queue).not.toMatch(
      /^.*AMOREPACIFIC_Vietnam_Strategy_Portfolio_51p\.zip.*$/m,
    );
  });

  it("keeps every sensitive queue row path-only, categorized, and resolvable", () => {
    const queue = readFileSync(
      join(workspaceRoot, "SENSITIVE_REVIEW.txt"),
      "utf8",
    );
    const allowedCategories = new Set([
      "identity",
      "contract",
      "application",
      "raw-research",
      "personnel",
      "credential",
      "uncertain",
    ]);

    for (const [index, line] of queue.trim().split(/\r?\n/).entries()) {
      const match =
        /^\[(EXCLUDE|REVIEW)\] ([A-Z]:\\.+) \| ([a-z-]+) \| (.+)$/.exec(line);

      if (!match) {
        throw new Error(`invalid queue grammar at line ${index + 1}`);
      }

      const path = match[2];
      const category = match[3];
      const reason = match[4];
      if (!path || !category || !reason) {
        throw new Error(`incomplete queue fields at line ${index + 1}`);
      }

      expect(allowedCategories.has(category)).toBe(true);
      expect(reason.trim().length).toBeGreaterThan(0);
      expect(existsSync(path), `missing queue path at line ${index + 1}`).toBe(
        true,
      );
    }
  });

  it("keeps comparable 1280px concept and implementation captures", () => {
    const accepted = join(workspaceRoot, "docs", "qa", "accepted-b1-2.png");
    const rendered = join(workspaceRoot, "docs", "qa", "rendered-homepage.png");

    expect(existsSync(accepted)).toBe(true);
    expect(existsSync(rendered)).toBe(true);
    expect(readPngWidth(accepted)).toBe(1280);
    expect(readPngWidth(rendered)).toBe(1280);
  });

  it("documents the required fidelity and browser evidence", () => {
    const ledger = readFileSync(
      join(workspaceRoot, "docs", "qa", "2026-07-19-fidelity-ledger.md"),
      "utf8",
    );

    for (const evidence of [
      "카피",
      "첫 화면 구성",
      "타이포그래피",
      "팔레트",
      "Hero 크롭",
      "그리드·컨테이너",
      "모션",
      "모바일",
      "200% 확대",
      "키보드",
      "reduced-motion",
    ]) {
      expect(ledger).toContain(evidence);
    }

    expect(ledger).toContain("미해결 중대 불일치: 없음");
    expect(ledger).not.toMatch(/sb_(?:publishable|secret)_/);
  });
});
