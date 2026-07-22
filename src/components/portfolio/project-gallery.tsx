"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";

import { getGalleryMotionPolicy } from "@/components/portfolio/gallery-motion";
import type {
  GalleryAsset,
  GalleryAssetCategory,
} from "@/lib/asset-picker/repository";

type ProjectGalleryProps = {
  assets: GalleryAsset[];
  headingLevel?: 1 | 2;
};

const galleryTabs: ReadonlyArray<{
  value: GalleryAssetCategory;
  label: string;
  eyebrow: string;
  description: string;
}> = [
  {
    value: "result",
    label: "프로젝트 결과물",
    eyebrow: "PROJECT OUTPUT",
    description: "문제 정의부터 화면·문서·프로토타입까지, 실제 결과물을 모았습니다.",
  },
  {
    value: "field",
    label: "현장 활동",
    eyebrow: "FIELD ACTIVITY",
    description: "사람·운영·협업의 맥락이 보이는 현장 기록입니다.",
  },
  {
    value: "credential",
    label: "수료 · 상장",
    eyebrow: "CERTIFICATES & AWARDS",
    description: "수료증과 상장을 비롯해 공개 가능한 증빙을 정리했습니다.",
  },
];

if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

function imageSource(asset: GalleryAsset) {
  return `/api/asset-picker/image/${asset.id}`;
}

function GalleryCard({
  asset,
  onOpen,
  onHover,
}: {
  asset: GalleryAsset;
  onOpen: (asset: GalleryAsset, element: HTMLButtonElement) => void;
  onHover: (element: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      type="button"
      className="project-gallery__card"
      data-gallery-card
      onClick={(event) => onOpen(asset, event.currentTarget)}
      onPointerEnter={(event) => onHover(event.currentTarget)}
      onPointerLeave={() => onHover(null)}
      aria-label={`${asset.label}: ${asset.title} 상세 보기`}
    >
      {/* The route streams the local file only when it has been selected in the DB. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageSource(asset)} alt="" />
      <span className="project-gallery__card-shade" aria-hidden="true" />
      <span className="project-gallery__card-copy">
        <small>{asset.label}</small>
        <strong>{asset.title}</strong>
      </span>
    </button>
  );
}

export function ProjectGallery({
  assets,
  headingLevel = 1,
}: ProjectGalleryProps) {
  const rootRef = useRef<HTMLElement>(null);
  const sourceCardRef = useRef<HTMLButtonElement | null>(null);
  const [activeAsset, setActiveAsset] = useState<GalleryAsset | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<GalleryAssetCategory>("result");
  const activeTab = galleryTabs.find((tab) => tab.value === activeCategory)!;
  const visibleAssets = assets.filter(
    (asset) => asset.category === activeCategory,
  );
  const Heading = `h${headingLevel}` as "h1" | "h2";

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || typeof window.matchMedia !== "function") return;
      const cards = Array.from(
        root.querySelectorAll<HTMLElement>("[data-gallery-card]"),
      );
      const media = gsap.matchMedia();

      media.add(
        {
          isDesktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conditions = context.conditions as {
            isDesktop: boolean;
            reduceMotion: boolean;
          };
          const policy = getGalleryMotionPolicy({
            width: window.innerWidth,
            reducedMotion: conditions.reduceMotion,
          });
          if (!conditions.isDesktop || !policy.fan || cards.length === 0) return;

          gsap.set(cards, {
            autoAlpha: 0,
            y: 28,
            rotation: (index: number) => (index % 2 ? 1.2 : -1.2),
            transformOrigin: "50% 100%",
          });
          gsap.timeline({
            defaults: { duration: 0.78, ease: "power3.out" },
            scrollTrigger: {
              trigger: root,
              start: "top 72%",
              toggleActions: "play none none reverse",
            },
          }).to(cards, {
            autoAlpha: 1,
            y: 0,
            rotation: 0,
            stagger: { each: 0.07, from: "center" },
            overwrite: "auto",
          });
          requestAnimationFrame(() => ScrollTrigger.refresh());
        },
      );

      return () => media.revert();
    },
    {
      scope: rootRef,
      dependencies: [assets.length, activeCategory],
      revertOnUpdate: true,
    },
  );

  const openAsset = (asset: GalleryAsset, element: HTMLButtonElement) => {
    sourceCardRef.current = element;
    setActiveAsset(asset);
  };

  const hoverCard = (activeElement: HTMLButtonElement | null) => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return;
    const policy = getGalleryMotionPolicy({
      width: window.innerWidth,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    if (!policy.hover) return;
    const cards = Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-gallery-card]"),
    );
    const activeIndex = activeElement ? cards.indexOf(activeElement) : -1;
    gsap.to(cards, {
      x: (index: number) =>
        activeIndex < 0 ? 0 : index < activeIndex ? -12 : index > activeIndex ? 12 : 0,
      y: (index: number) => (index === activeIndex ? -14 : 0),
      scale: (index: number) => (index === activeIndex ? 1.025 : 1),
      rotation: (index: number) => (index === activeIndex ? 0.6 : 0),
      duration: activeIndex < 0 ? 0.5 : 0.42,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const closeAsset = () => {
    setActiveAsset(null);
    requestAnimationFrame(() => sourceCardRef.current?.focus());
  };

  const onOverlayKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") closeAsset();
  };

  return (
    <section
      id="gallery"
      className="project-gallery"
      ref={rootRef}
      aria-labelledby="project-gallery-heading"
    >
      <header className="project-gallery__header">
        <p>PROJECT GALLERY</p>
        <div>
          <Heading id="project-gallery-heading">프로젝트 갤러리</Heading>
          <p>
            결과물, 현장 활동, 수료·상장을 분리해 필요한 기록만 빠르게
            살펴볼 수 있습니다.
          </p>
        </div>
      </header>

      <div className="project-gallery__tabs" role="tablist" aria-label="갤러리 분류">
        {galleryTabs.map((tab) => (
          <button
            type="button"
            key={tab.value}
            id={`gallery-tab-${tab.value}`}
            role="tab"
            aria-controls={`gallery-panel-${tab.value}`}
            aria-selected={activeCategory === tab.value}
            onClick={() => setActiveCategory(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section
        className="project-gallery__panel"
        id={`gallery-panel-${activeCategory}`}
        role="tabpanel"
        aria-labelledby={`gallery-tab-${activeCategory}`}
      >
        <div className="project-gallery__panel-intro">
          <p>{activeTab.eyebrow}</p>
          <h2>{activeTab.label}</h2>
          <span>{activeTab.description}</span>
        </div>
        {visibleAssets.length > 0 ? (
          <div className="project-gallery__grid">
            {visibleAssets.map((asset) => (
              <GalleryCard
                asset={asset}
                key={asset.id}
                onOpen={openAsset}
                onHover={hoverCard}
              />
            ))}
          </div>
        ) : (
          <p className="project-gallery__empty">
            관리자 페이지에서 사진을 추가하고 이 분류를 지정하면 여기에 표시됩니다.
          </p>
        )}
      </section>

      {activeAsset ? (
        <div
          className="project-gallery__dialog-backdrop"
          role="presentation"
          onMouseDown={closeAsset}
        >
          <div
            className="project-gallery__dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${activeAsset.label} 상세 보기`}
            tabIndex={-1}
            onKeyDown={onOverlayKeyDown}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="project-gallery__close"
              type="button"
              onClick={closeAsset}
              aria-label="상세 보기 닫기"
            >
              <X size={20} aria-hidden="true" />
            </button>
            <div className="project-gallery__image-scroll">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSource(activeAsset)} alt={`${activeAsset.title} 원본`} />
            </div>
            <div className="project-gallery__dialog-copy">
              <p>{activeAsset.label}</p>
              <h2>{activeAsset.title}</h2>
              <span>{activeAsset.sourceGroup}</span>
              <p className="project-gallery__description">
                {activeAsset.description ??
                  "관리자 화면에서 이 사진의 맥락과 역할을 추가할 수 있습니다."}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
