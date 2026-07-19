import Image, { type StaticImageData } from "next/image";

import type { HomePageData } from "@/lib/portfolio/types";

const defaultImageAlt =
  "문서, 시장 지도와 의사결정 노드가 하나의 실행 방향으로 수렴하는 추상 전략 이미지";

type HeroSectionProps = {
  profile: HomePageData["profile"];
  imageSrc?: string | StaticImageData;
  imageAlt?: string;
};

export function HeroSection({
  profile,
  imageSrc = "/images/hero-strategy-signal-f48ea2a6.avif",
  imageAlt = defaultImageAlt,
}: HeroSectionProps) {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-section__copy">
        <div className="hero-section__message">
          <h1 id="hero-title">{profile.headline}</h1>
          <p>{profile.summary}</p>
        </div>

        <div className="hero-section__role-block">
          <strong>Strategy Planning · HR · PM</strong>
          <span>
            법학 전공의 구조적 사고를 쟁점, 근거, 실행안으로 연결합니다.
          </span>
        </div>
      </div>

      <div className="hero-section__visual">
        <Image
          className="hero-section__image"
          src={imageSrc}
          alt={imageAlt}
          fill
          preload
          sizes="(max-width: 900px) 100vw, 48vw"
        />
      </div>
    </section>
  );
}
