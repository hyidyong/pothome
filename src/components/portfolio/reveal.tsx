"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { getMotionPolicy } from "@/components/portfolio/motion-policy";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

const MAX_REVEAL_DELAY_MS = 160;

type RevealStyle = CSSProperties & { "--reveal-delay": string };

export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const normalizedDelayMs = Math.min(
    MAX_REVEAL_DELAY_MS,
    Math.max(0, Math.round(delayMs)),
  );
  const style: RevealStyle | undefined = normalizedDelayMs
    ? { "--reveal-delay": `${normalizedDelayMs}ms` }
    : undefined;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const policy = getMotionPolicy({
      width: window.innerWidth,
      reducedMotion,
    });

    if (!policy.reveal || typeof window.IntersectionObserver !== "function") {
      return;
    }

    let revealed = false;
    element.dataset.revealState = "ready";

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (revealed || !entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        revealed = true;
        element.dataset.revealState = "visible";
        observer.disconnect();
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className={["reveal", className].filter(Boolean).join(" ")}
      data-reveal-delay-ms={normalizedDelayMs}
      data-reveal-state="visible"
      style={style}
    >
      {children}
    </div>
  );
}
