"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

const decisionSteps = [
  {
    title: "Frame the decision",
    description:
      "조사의 주제가 아니라 실제로 내려야 하는 결정을 한 문장으로 고정합니다.",
  },
  {
    title: "Gather evidence",
    description:
      "시장·규제·조직·사용자 근거의 출처와 한계를 분리해 수집합니다.",
  },
  {
    title: "Compare options",
    description:
      "각 선택지를 같은 평가 기준에 올리고 트레이드오프를 드러냅니다.",
  },
  {
    title: "Design the move",
    description: "권고안을 로드맵·운영 모델·다음 검증 지표로 연결합니다.",
  },
] as const;

const activeStep = { opacity: 1, y: 0, scale: 1 } as const;
const inactiveStep = { opacity: 0.36, y: 24, scale: 0.985 } as const;
const previousStep = { opacity: 0.36, y: -12, scale: 0.985 } as const;

export function DecisionSpine() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = containerRef.current;
      if (!section) {
        return;
      }

      const steps = Array.from(
        section.querySelectorAll<HTMLElement>(".decision-spine__step"),
      );
      const indicator = section.querySelector<HTMLElement>(
        ".decision-spine__indicator-progress",
      );
      const [frameStep, evidenceStep, optionsStep, moveStep] = steps;

      if (
        steps.length !== decisionSteps.length ||
        !frameStep ||
        !evidenceStep ||
        !optionsStep ||
        !moveStep ||
        !indicator
      ) {
        return;
      }

      let mounted = true;
      const media = gsap.matchMedia();

      media.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, isMobile, reduceMotion } = context.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
            reduceMotion: boolean;
          };

          if (!isDesktop || isMobile || reduceMotion) {
            delete section.dataset.motionState;
            gsap.set(steps, { clearProps: "opacity,transform" });
            gsap.set(indicator, { clearProps: "transform" });
            return;
          }

          section.dataset.motionState = "enhanced";
          gsap.set(steps, inactiveStep);
          gsap.set(frameStep, activeStep);
          gsap.set(indicator, { scaleY: 0.25 });

          const timeline = gsap.timeline({
            defaults: { duration: 1, ease: "none" },
            scrollTrigger: {
              trigger: section,
              pin: section,
              start: "top top",
              end: "+=140%",
              scrub: 0.65,
            },
          });

          timeline
            .addLabel("frame", 0)
            .to(frameStep, activeStep, "frame")
            .addLabel("evidence", 1)
            .to(frameStep, previousStep, "evidence")
            .to(evidenceStep, activeStep, "evidence")
            .to(indicator, { scaleY: 0.5 }, "evidence")
            .addLabel("options", 2)
            .to(evidenceStep, previousStep, "options")
            .to(optionsStep, activeStep, "options")
            .to(indicator, { scaleY: 0.75 }, "options")
            .addLabel("move", 3)
            .to(optionsStep, previousStep, "move")
            .to(moveStep, activeStep, "move")
            .to(indicator, { scaleY: 1 }, "move");

          return () => {
            delete section.dataset.motionState;
          };
        },
      );

      void document.fonts.ready.then(() => {
        if (mounted) {
          ScrollTrigger.refresh();
        }
      });

      return () => {
        mounted = false;
        delete section.dataset.motionState;
        media.revert();
      };
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      id="decision-spine"
      className="decision-spine"
      aria-labelledby="decision-spine-heading"
    >
      <div className="decision-spine__intro">
        <p className="decision-spine__index">02 · Signature motion</p>
        <h2 id="decision-spine-heading">
          Decision <em>Spine.</em>
        </h2>
        <p>
          스크롤할수록 규칙·시장·사용자 신호가 하나의 선택과 실행안으로
          수렴합니다. 이전 단계는 잦아들고 현재 판단만 선명해집니다.
        </p>
        <div className="decision-spine__indicator" aria-hidden="true">
          <span className="decision-spine__indicator-progress" />
        </div>
      </div>

      <ol className="decision-spine__steps">
        {decisionSteps.map((step, index) => (
          <li className="decision-spine__step" key={step.title}>
            <article>
              <span className="decision-spine__number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
