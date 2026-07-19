import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";

import { SiteFooter } from "@/components/portfolio/site-footer";

const globalCss = readFileSync(
  join(process.cwd(), "src/app/globals.css"),
  "utf8",
);
const workspaceConfig = readFileSync(
  join(process.cwd(), "pnpm-workspace.yaml"),
  "utf8",
);
const packageManifest = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf8"),
) as { dependencies: Record<string, string> };

function getCssRule(selector: RegExp): string {
  const match = globalCss.match(selector);
  expect(match, `Missing consumed CSS rule: ${selector.source}`).not.toBeNull();
  return match?.[1] ?? "";
}

function getHexVariable(rule: string, name: string): string {
  const match = rule.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"));
  expect(match, `Missing hexadecimal CSS variable --${name}`).not.toBeNull();
  return match?.[1] ?? "#000000";
}

function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const channels = [1, 3, 5].map((offset) =>
      Number.parseInt(hex.slice(offset, offset + 2), 16),
    );
    const linear = channels.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
  };

  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

it("keeps the footer CTA a semantic, target-sized link with a scoped contrast class", () => {
  render(<SiteFooter />);

  const cta = screen.getByRole("link", { name: "대표 프로젝트 보기" });
  expect(cta.tagName).toBe("A");
  expect(cta).toHaveClass("site-footer__cta", "h-12", "min-w-12");
  expect(cta).not.toHaveAttribute("role", "button");
});

it("uses scoped semantic footer tokens for resting, hover, and focus contrast", () => {
  const rootRule = getCssRule(/:root\s*\{([^}]*)\}/m);
  const footerRule = getCssRule(/\.site-footer\s*\{([^}]*)\}/m);
  const ctaRule = getCssRule(/\.site-footer__cta\s*\{([^}]*)\}/m);
  const interactiveRule = getCssRule(
    /\.site-footer__cta:hover,\s*\.site-footer__cta:focus-visible\s*\{([^}]*)\}/m,
  );

  expect(footerRule).toContain("--footer-foreground:");
  expect(footerRule).toContain("--footer-action-background:");
  expect(footerRule).toContain("--footer-action-hover:");
  expect(ctaRule).toContain("color: var(--footer-foreground)");
  expect(ctaRule).toContain("background: var(--footer-action-background)");
  expect(interactiveRule).toContain("color: var(--footer-foreground)");
  expect(interactiveRule).toContain("background: var(--footer-action-hover)");

  const footerForeground = getHexVariable(footerRule, "footer-foreground");
  const footerBackground = getHexVariable(rootRule, "signal");
  const actionHover = getHexVariable(footerRule, "footer-action-hover");
  expect(
    contrastRatio(footerForeground, footerBackground),
  ).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(footerForeground, actionHover)).toBeGreaterThanOrEqual(
    4.5,
  );
});

it("gives all actual header text links centered 44 by 44 minimum targets", () => {
  const targetRule = getCssRule(
    /\.site-header__wordmark,\s*\.site-header__desktop-nav > a,\s*\.site-header__sheet-nav > a\s*\{([^}]*)\}/m,
  );

  expect(targetRule).toContain("min-width: 44px");
  expect(targetRule).toContain("min-height: 44px");
  expect(targetRule).toContain("justify-content: center");
});

it("keeps every narrative portfolio copy style at one rem or larger", () => {
  const narrativeRules = [
    getCssRule(/\.hero-section__role-block span\s*\{([^}]*)\}/m),
    getCssRule(/\.evidence-rail__item > p:last-child\s*\{([^}]*)\}/m),
    getCssRule(/\.case-study-card__copy > p\s*\{([^}]*)\}/m),
    getCssRule(/\.law-lens__note p\s*\{([^}]*)\}/m),
  ];

  expect(
    narrativeRules.map((rule) => rule.includes("font-size: 1rem")),
  ).toEqual([true, true, true, true]);
});

it("keeps workspace policy limited to justified native build entries", () => {
  expect(workspaceConfig).toContain("allowBuilds:");
  expect(workspaceConfig).toContain("sharp: true");
  expect(workspaceConfig).toContain("unrs-resolver: true");
  expect(workspaceConfig).not.toContain("minimumReleaseAgeExclude");
});

it("pins Instrument Serif to the mature approved release", () => {
  expect(packageManifest.dependencies["@fontsource/instrument-serif"]).toBe(
    "5.2.8",
  );
});
