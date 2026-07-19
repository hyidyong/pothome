import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const skillPath = resolve(
  process.cwd(),
  "skills/strategy-portfolio-workflow/SKILL.md",
);

describe("strategy portfolio workflow skill portability", () => {
  it("derives the narrow mobile verification viewport from the task", () => {
    const skill = readFileSync(skillPath, "utf8");

    expect(skill).not.toMatch(/\b390px\b/i);
    expect(skill).toContain("the narrowest supported mobile viewport");
  });
});
