import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

describe("release Hero media", () => {
  it("uses Son Heejeong's portrait as the only hero visual", () => {
    const component = readFileSync(
      join(workspaceRoot, "src", "components", "portfolio", "hero-section.tsx"),
      "utf8",
    );
    const styles = readFileSync(
      join(workspaceRoot, "src", "app", "globals.css"),
      "utf8",
    );

    expect(() => statSync(join(workspaceRoot, "public", "images", "son-heejeong-profile.png"))).not.toThrow();
    expect(component).toContain('src="/images/son-heejeong-profile.png"');
    expect(component).not.toContain("hero-strategy-signal-f48ea2a6");
    expect(styles).toMatch(/\.hero-section__visual\s*\{[\s\S]*?background:\s*#0a0d0c/);
    expect(styles).toMatch(/\.hero-section__profile\s*\{[\s\S]*?border:\s*0/);
    expect(styles).toMatch(/\.hero-section__profile-image\s*\{[\s\S]*?box-shadow/);
    expect(styles).not.toMatch(/\.hero-section__profile-image\s*\{[\s\S]*?grayscale/);
  });
});
