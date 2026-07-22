import Image from "next/image";

import type { HomePageData } from "@/lib/portfolio/types";

type HeroSectionProps = {
  profile: HomePageData["profile"];
};

const proofMetrics = [
  { value: "2022–2026", label: "대외·공공 활동 기록" },
  { value: "3건", label: "수상 기록 · 2026" },
  { value: "6회", label: "AI·데이터 교육 수료 · 2026.05–07" },
] as const;

const heroHeadline = "데이터로 판단하고, 실행력으로 증명합니다.";

export function HeroSection({ profile }: HeroSectionProps) {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-section__copy">
        <div className="hero-section__message">
          <h1 id="hero-title">{heroHeadline}</h1>
          <p>{profile.summary}</p>
        </div>

        <div className="hero-section__role-block">
          <ul aria-label="활동 기준 지표" className="hero-section__role-mix">
            {proofMetrics.map((metric) => (
              <li key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </li>
            ))}
          </ul>
          <p>법학 전공의 구조적 사고를 쟁점, 근거, 실행안으로 연결합니다.</p>
        </div>
      </div>

      <div className="hero-section__visual">
        <div className="hero-section__profile" aria-label="전략기획자 손희정 소개">
          <Image
            className="hero-section__profile-image"
            src="/images/son-heejeong-profile.png"
            alt="전략기획자 손희정 프로필 사진"
            width={384}
            height={512}
            sizes="(max-width: 900px) 42vw, 24vw"
          />
          <div className="hero-section__profile-copy">
            <strong>손희정</strong>
            <span>SON HEEJEONG · STRATEGY PLANNER</span>
          </div>
        </div>
      </div>
    </section>
  );
}
