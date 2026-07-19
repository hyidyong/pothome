// @vitest-environment node

import { describe, expect, it } from "vitest";

import { getMotionPolicy } from "@/components/portfolio/motion-policy";

describe("getMotionPolicy", () => {
  it("lets reduced motion disable every motion behavior", () => {
    expect(getMotionPolicy({ width: 1280, reducedMotion: true })).toEqual({
      reveal: false,
      pinDecisionSpine: false,
      scrubDecisionSpine: false,
    });

    expect(getMotionPolicy({ width: 390, reducedMotion: true })).toEqual({
      reveal: false,
      pinDecisionSpine: false,
      scrubDecisionSpine: false,
    });
  });

  it("keeps mobile content static and disables the spine sequence", () => {
    expect(getMotionPolicy({ width: 390, reducedMotion: false })).toEqual({
      reveal: false,
      pinDecisionSpine: false,
      scrubDecisionSpine: false,
    });
  });

  it("enables the full sequence on desktop", () => {
    expect(getMotionPolicy({ width: 1280, reducedMotion: false })).toEqual({
      reveal: true,
      pinDecisionSpine: true,
      scrubDecisionSpine: true,
    });
  });

  it("switches the spine policy at the exact 767/768 boundary", () => {
    expect(getMotionPolicy({ width: 767, reducedMotion: false })).toEqual({
      reveal: false,
      pinDecisionSpine: false,
      scrubDecisionSpine: false,
    });
    expect(getMotionPolicy({ width: 768, reducedMotion: false })).toEqual({
      reveal: true,
      pinDecisionSpine: true,
      scrubDecisionSpine: true,
    });
  });
});
