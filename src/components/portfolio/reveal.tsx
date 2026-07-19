"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { getMotionPolicy } from "@/components/portfolio/motion-policy";

type RevealProps = {
  children: ReactNode;
  className?: string;
};

export function Reveal({ children, className }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

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
      data-reveal-state="visible"
    >
      {children}
    </div>
  );
}
