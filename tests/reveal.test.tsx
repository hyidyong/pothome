import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Reveal } from "@/components/portfolio/reveal";

const originalIntersectionObserver = window.IntersectionObserver;
const originalMatchMedia = window.matchMedia;

type ObserverHarness = {
  callback: IntersectionObserverCallback | null;
  disconnect: ReturnType<typeof vi.fn>;
  observe: ReturnType<typeof vi.fn>;
  options: IntersectionObserverInit | undefined;
};

function installMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)" && reducedMotion,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function installIntersectionObserver(): ObserverHarness {
  const harness: ObserverHarness = {
    callback: null,
    disconnect: vi.fn(),
    observe: vi.fn(),
    options: undefined,
  };

  class TestIntersectionObserver {
    readonly root = null;
    readonly rootMargin = "0px";
    readonly thresholds = [0.2];
    readonly disconnect = harness.disconnect;
    readonly observe = harness.observe;
    readonly unobserve = vi.fn();

    constructor(
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    ) {
      harness.callback = callback;
      harness.options = options;
    }

    takeRecords() {
      return [];
    }
  }

  Object.defineProperty(window, "IntersectionObserver", {
    configurable: true,
    value: TestIntersectionObserver,
  });

  return harness;
}

function getRevealElement() {
  return screen.getByText("Observed content");
}

beforeEach(() => {
  installMatchMedia(false);
});

afterEach(() => {
  Object.defineProperty(window, "IntersectionObserver", {
    configurable: true,
    value: originalIntersectionObserver,
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: originalMatchMedia,
  });
});

describe("Reveal progressive enhancement", () => {
  it("keeps content visible and skips observation for reduced motion", () => {
    const harness = installIntersectionObserver();
    installMatchMedia(true);

    render(<Reveal>Observed content</Reveal>);

    expect(getRevealElement()).toHaveAttribute("data-reveal-state", "visible");
    expect(harness.callback).toBeNull();
    expect(harness.observe).not.toHaveBeenCalled();
  });

  it("keeps content visible when IntersectionObserver is unavailable", () => {
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: undefined,
    });

    render(<Reveal>Observed content</Reveal>);

    expect(getRevealElement()).toHaveAttribute("data-reveal-state", "visible");
  });

  it("reveals once at the threshold, disconnects, and never hides again", () => {
    const harness = installIntersectionObserver();

    const { unmount } = render(<Reveal>Observed content</Reveal>);
    const element = getRevealElement();

    expect(element).toHaveAttribute("data-reveal-state", "ready");
    expect(harness.observe).toHaveBeenCalledWith(element);
    expect(harness.options).toEqual({
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px",
    });

    act(() => {
      harness.callback?.(
        [
          {
            isIntersecting: false,
            target: element,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });
    expect(element).toHaveAttribute("data-reveal-state", "ready");
    expect(harness.disconnect).not.toHaveBeenCalled();

    act(() => {
      harness.callback?.(
        [
          {
            isIntersecting: true,
            target: element,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });
    expect(element).toHaveAttribute("data-reveal-state", "visible");
    expect(harness.disconnect).toHaveBeenCalledTimes(1);

    act(() => {
      harness.callback?.(
        [
          {
            isIntersecting: false,
            target: element,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });
    expect(element).toHaveAttribute("data-reveal-state", "visible");

    unmount();
    expect(harness.disconnect).toHaveBeenCalledTimes(2);
  });

  it("disconnects during cleanup before an intersection", () => {
    const harness = installIntersectionObserver();
    const { unmount } = render(<Reveal>Observed content</Reveal>);

    expect(getRevealElement()).toHaveAttribute("data-reveal-state", "ready");
    unmount();

    expect(harness.disconnect).toHaveBeenCalledTimes(1);
  });
});
