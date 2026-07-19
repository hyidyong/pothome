import { act, render, screen, within } from "@testing-library/react";
import type { RefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const gsapHarness = vi.hoisted(() => {
  const timeline = {
    addLabel: vi.fn(),
    to: vi.fn(),
  };

  return {
    activeConditions: {
      isDesktop: true,
      isMobile: false,
      reduceMotion: false,
    },
    conditions: null as Record<string, string> | null,
    matchMediaRevert: vi.fn(),
    refresh: vi.fn(),
    registerPlugin: vi.fn(),
    scope: null as RefObject<HTMLElement | null> | null,
    set: vi.fn(),
    timeline,
    timelineConfig: null as Record<string, unknown> | null,
  };
});

vi.mock("@gsap/react", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    useGSAP(
      callback: () => void | (() => void),
      config: { scope: RefObject<HTMLElement | null> },
    ) {
      gsapHarness.scope = config.scope;
      React.useEffect(() => callback(), [callback]);
    },
  };
});

vi.mock("gsap", () => {
  const timeline = gsapHarness.timeline;
  timeline.addLabel.mockImplementation(() => timeline);
  timeline.to.mockImplementation(() => timeline);

  return {
    gsap: {
      matchMedia: vi.fn(() => ({
        add: vi.fn(
          (
            conditions: Record<string, string>,
            callback: (context: {
              conditions: typeof gsapHarness.activeConditions;
            }) => void,
          ) => {
            gsapHarness.conditions = conditions;
            callback({ conditions: gsapHarness.activeConditions });
          },
        ),
        revert: gsapHarness.matchMediaRevert,
      })),
      registerPlugin: gsapHarness.registerPlugin,
      set: gsapHarness.set,
      timeline: vi.fn((config: Record<string, unknown>) => {
        gsapHarness.timelineConfig = config;
        return timeline;
      }),
    },
  };
});

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    refresh: gsapHarness.refresh,
  },
}));

import { DecisionSpine } from "@/components/portfolio/decision-spine";

const originalFonts = document.fonts;

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

beforeEach(() => {
  gsapHarness.activeConditions = {
    isDesktop: true,
    isMobile: false,
    reduceMotion: false,
  };
  gsapHarness.conditions = null;
  gsapHarness.scope = null;
  gsapHarness.timelineConfig = null;
  gsapHarness.matchMediaRevert.mockClear();
  gsapHarness.refresh.mockClear();
  gsapHarness.registerPlugin.mockClear();
  gsapHarness.set.mockClear();
  gsapHarness.timeline.addLabel.mockClear();
  gsapHarness.timeline.to.mockClear();
});

afterEach(() => {
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: originalFonts,
  });
});

describe("DecisionSpine GSAP contract", () => {
  it("creates one scoped desktop timeline with the exact scroll policy", () => {
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: new Promise(() => undefined) },
    });

    const { unmount } = render(<DecisionSpine />);
    const section = screen.getByRole("region", { name: "Decision Spine." });

    expect(gsapHarness.scope?.current).toBe(section);
    expect(gsapHarness.conditions).toEqual({
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    });
    expect(section).toHaveAttribute("data-motion-state", "enhanced");
    expect(gsapHarness.timelineConfig).toEqual({
      defaults: { duration: 1, ease: "none" },
      scrollTrigger: {
        trigger: section,
        pin: section,
        start: "top top",
        end: "+=140%",
        scrub: 0.65,
      },
    });
    expect(gsapHarness.timeline.addLabel).toHaveBeenCalledTimes(4);

    const childTweenVars = gsapHarness.timeline.to.mock.calls.map(
      ([, vars]) => vars as Record<string, unknown>,
    );
    expect(childTweenVars.length).toBeGreaterThan(0);
    expect(
      childTweenVars.every(
        (vars) =>
          !("scrollTrigger" in vars) &&
          Object.keys(vars).every((key) =>
            ["opacity", "y", "scale", "scaleY"].includes(key),
          ),
      ),
    ).toBe(true);

    unmount();
    expect(gsapHarness.matchMediaRevert).toHaveBeenCalledTimes(1);
    expect(section).not.toHaveAttribute("data-motion-state");
  });

  it.each([
    {
      mode: "mobile",
      conditions: {
        isDesktop: false,
        isMobile: true,
        reduceMotion: false,
      },
    },
    {
      mode: "reduced motion",
      conditions: {
        isDesktop: true,
        isMobile: false,
        reduceMotion: true,
      },
    },
  ])("keeps a static visible list for $mode", ({ conditions }) => {
    gsapHarness.activeConditions = conditions;
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: new Promise(() => undefined) },
    });

    render(<DecisionSpine />);

    const section = screen.getByRole("region", { name: "Decision Spine." });
    expect(section).not.toHaveAttribute("data-motion-state");
    expect(gsapHarness.timelineConfig).toBeNull();
    expect(within(section).getAllByRole("article")).toHaveLength(4);
  });

  it("refreshes after fonts settle only while still mounted", async () => {
    const mountedFonts = deferred<FontFaceSet>();
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: mountedFonts.promise },
    });
    const mounted = render(<DecisionSpine />);

    await act(async () => {
      mountedFonts.resolve({} as FontFaceSet);
      await mountedFonts.promise;
    });
    expect(gsapHarness.refresh).toHaveBeenCalledTimes(1);
    mounted.unmount();

    gsapHarness.refresh.mockClear();
    const unmountedFonts = deferred<FontFaceSet>();
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: unmountedFonts.promise },
    });
    const unmounted = render(<DecisionSpine />);
    unmounted.unmount();

    await act(async () => {
      unmountedFonts.resolve({} as FontFaceSet);
      await unmountedFonts.promise;
    });
    expect(gsapHarness.refresh).not.toHaveBeenCalled();
  });
});
