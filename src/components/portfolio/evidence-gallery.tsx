"use client";

import { useState } from "react";
import Link from "next/link";

import type { HomePageData } from "@/lib/portfolio/types";

type EvidenceGalleryProps = {
  cases: HomePageData["cases"];
};

type GalleryCategory = "projects" | "field" | "credentials";

type GalleryItem = {
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  tone: "project" | "field" | "credential";
};

const categories: Array<{ id: GalleryCategory; label: string }> = [
  { id: "projects", label: "프로젝트 결과물" },
  { id: "field", label: "현장 활동" },
  { id: "credentials", label: "수료 · 상장" },
];

const fieldItems: GalleryItem[] = [
  {
    eyebrow: "2026 · HR 운영",
    title: "YLC 인사팀 부팀장 활동",
    description: "사람과 운영 사이의 협력 프로세스를 현장에서 설계했습니다.",
    tone: "field",
  },
  {
    eyebrow: "2026 · FKI 학술 동아리",
    title: "우수 운영진상",
    description: "팀 운영과 구성원 경험을 개선한 활동 기록입니다.",
    tone: "field",
  },
  {
    eyebrow: "상시 · 매장 운영",
    title: "데일리코인노래방 매장 스태프",
    description: "고객 접점에서 문제를 발견하고 운영 흐름을 익혔습니다.",
    tone: "field",
  },
];

const credentialItems: GalleryItem[] = [
  {
    eyebrow: "2026 · 수상",
    title: "AI Solution Challenge Program 우수상",
    description: "팀장으로 참여한 단기 집중 과정의 결과물입니다.",
    tone: "credential",
  },
  {
    eyebrow: "2026 · 수료",
    title: "첨단산업 인재양성 AI 부트캠프",
    description: "Human AI Foundation 과정을 수료했습니다.",
    tone: "credential",
  },
  {
    eyebrow: "2026 상반기 · 수료",
    title: "YLC 수료 및 인사팀 부팀장 활동",
    description: "수료와 실제 운영 역할을 함께 기록했습니다.",
    tone: "credential",
  },
  {
    eyebrow: "2025 · 수료",
    title: "반기문 재단 기후리더양성과정 1기",
    description: "기후·사회 이슈를 전략적 질문으로 확장한 교육입니다.",
    tone: "credential",
  },
];

function projectItems(cases: HomePageData["cases"]): GalleryItem[] {
  return cases.slice(0, 6).map((caseStudy) => ({
    eyebrow: caseStudy.role,
    title: caseStudy.title,
    description: caseStudy.summary,
    href: `/work/${caseStudy.slug}`,
    tone: "project",
  }));
}

export function EvidenceGallery({ cases }: EvidenceGalleryProps) {
  const [activeCategory, setActiveCategory] =
    useState<GalleryCategory>("projects");
  const items =
    activeCategory === "projects"
      ? projectItems(cases)
      : activeCategory === "field"
        ? fieldItems
        : credentialItems;

  return (
    <section
      id="gallery"
      className="portfolio-section evidence-gallery"
      aria-labelledby="evidence-gallery-title"
    >
      <header className="portfolio-section__header evidence-gallery__header">
        <p>02 · Evidence Gallery</p>
        <h2 id="evidence-gallery-title">
          결과물과 현장의 장면을
          <br />
          같은 시선으로 정리합니다.
        </h2>
      </header>

      <div className="evidence-gallery__tabs" role="tablist" aria-label="갤러리 분류">
        {categories.map((category) => (
          <button
            key={category.id}
            id={`gallery-tab-${category.id}`}
            role="tab"
            type="button"
            aria-selected={activeCategory === category.id}
            aria-controls={`gallery-panel-${category.id}`}
            tabIndex={activeCategory === category.id ? 0 : -1}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div
        id={`gallery-panel-${activeCategory}`}
        className="evidence-gallery__grid"
        role="tabpanel"
        aria-labelledby={`gallery-tab-${activeCategory}`}
        tabIndex={0}
      >
        {items.map((item, index) => {
          const content = (
            <>
              <div className={`evidence-gallery__visual evidence-gallery__visual--${item.tone}`}>
                <span>{item.eyebrow}</span>
                <strong>{item.title}</strong>
                <small>{String(index + 1).padStart(2, "0")}</small>
              </div>
              <div className="evidence-gallery__copy">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </>
          );

          return item.href ? (
            <Link
              className="evidence-gallery__item"
              href={item.href}
              key={`${item.title}-${index}`}
              aria-label={`${item.title} 프로젝트 상세 보기`}
            >
              {content}
            </Link>
          ) : (
            <article className="evidence-gallery__item" key={`${item.title}-${index}`}>
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
