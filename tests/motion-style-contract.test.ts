import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, it } from "vitest";

const globalCss = readFileSync(
  join(process.cwd(), "src/app/globals.css"),
  "utf8",
);

function getCssRule(selector: RegExp): string {
  const match = globalCss.match(selector);
  expect(
    match,
    `Missing consumed motion rule: ${selector.source}`,
  ).not.toBeNull();
  return match?.[1] ?? "";
}

it("keeps Reveal visible by default and limits its ready transition to transform and opacity", () => {
  const baseRule = getCssRule(/\.reveal\s*\{([^}]*)\}/m);
  const readyRule = getCssRule(
    /\.reveal\[data-reveal-state="ready"\]\s*\{([^}]*)\}/m,
  );
  const visibleRule = getCssRule(
    /\.reveal\[data-reveal-state="visible"\]\s*\{([^}]*)\}/m,
  );

  expect(baseRule).toContain("opacity: 1");
  expect(baseRule).toContain("transform: none");
  expect(readyRule).toContain("opacity: 0");
  expect(readyRule).toContain("translate3d(0, 36px, 0) scale(0.985)");
  expect(visibleRule).toContain("opacity 0.72s cubic-bezier(0.16, 1, 0.3, 1)");
  expect(`${baseRule}${readyRule}${visibleRule}`).not.toMatch(
    /(?:filter|blur|width|height|top|left)\s*:/,
  );
});

it("forces Reveal and the Decision Spine to static visible states for reduced motion", () => {
  const reducedMotion = globalCss.match(
    /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/m,
  )?.[1];

  expect(reducedMotion).toContain('.reveal[data-reveal-state="ready"]');
  expect(reducedMotion).toContain(".decision-spine__step");
  expect(reducedMotion).toContain("opacity: 1 !important");
  expect(reducedMotion).toContain("transform: none !important");
});

it("switches the Decision Spine to a normal single-column list at 767px", () => {
  const mobile = globalCss.match(
    /@media \(max-width: 767px\)\s*\{([\s\S]*?)\n\}/m,
  )?.[1];

  expect(mobile).toContain(".decision-spine");
  expect(mobile).toContain("grid-template-columns: minmax(0, 1fr)");
  expect(mobile).toContain("min-height: auto");
  expect(mobile).toContain(".decision-spine__step");
  expect(mobile).toContain("opacity: 1 !important");
  expect(mobile).toContain("transform: none !important");
});
