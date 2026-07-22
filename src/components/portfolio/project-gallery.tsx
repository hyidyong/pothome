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

type GalleryGroup = {
  id: string;
  title: string;
  description: string | null;
  label: string;
  sourceGroup: string;
  assets: GalleryAsset[];
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
  return asset.staticImageUrl ?? `/api/asset-picker/image/${asset.id}`;
}

function normalizedGroup(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function collectionId(
  asset: GalleryAsset,
  sourceGroupCounts: Map<string, number>,
  titleCounts: Map<string, number>,
) {
  if (asset.title.includes("단디모바일 업무 인수인계 자료")) return "dandi-mobile-handover";
  if (asset.sourceGroup === "피토리") return "fitory-product-record";
  const sourceGroup = normalizedGroup(asset.sourceGroup);
  const isNamedCollection =
    sourceGroup !== "" &&
    sourceGroup !== "관리자 업로드" &&
    sourceGroup !== "admin upload" &&
    (sourceGroupCounts.get(sourceGroup) ?? 0) > 1;
  if (isNamedCollection) return `source:${sourceGroup}`;

  const titleKey = `${asset.category}:${normalizedGroup(asset.title)}`;
  if ((titleCounts.get(titleKey) ?? 0) > 1) return `title:${titleKey}`;
  return asset.id;
}

function collectionTitle(asset: GalleryAsset) {
  if (asset.title.includes("단디모바일 업무 인수인계 자료")) return "단디모바일 업무 인수인계 자료";
  if (asset.sourceGroup === "피토리") return "피토리 제품 화면 기록";
  return asset.title;
}

function groupAssets(assets: GalleryAsset[]) {
  const sourceGroupCounts = new Map<string, number>();
  const titleCounts = new Map<string, number>();
  for (const asset of assets) {
    const sourceGroup = normalizedGroup(asset.sourceGroup);
    if (sourceGroup) {
      sourceGroupCounts.set(sourceGroup, (sourceGroupCounts.get(sourceGroup) ?? 0) + 1);
    }
    const titleKey = `${asset.category}:${normalizedGroup(asset.title)}`;
    titleCounts.set(titleKey, (titleCounts.get(titleKey) ?? 0) + 1);
  }

  const groups = new Map<string, GalleryGroup>();
  for (const asset of assets) {
    const id = collectionId(asset, sourceGroupCounts, titleCounts);
    const group = groups.get(id);
    if (group) group.assets.push(asset);
    else groups.set(id, { id, title: collectionTitle(asset), description: asset.description, label: asset.label, sourceGroup: asset.sourceGroup, assets: [asset] });
  }
  return [...groups.values()];
}

function GalleryCard({
  group,
  onOpen,
  onHover,
}: {
  group: GalleryGroup;
  onOpen: (group: GalleryGroup, element: HTMLButtonElement) => void;
  onHover: (element: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      type="button"
      className="project-gallery__card"
      data-gallery-card
      onClick={(event) => onOpen(group, event.currentTarget)}
      onPointerEnter={(event) => onHover(event.currentTarget)}
      onPointerLeave={() => onHover(null)}
      aria-label={`${group.label}: ${group.title} 상세 보기`}
    >
      {/* The route streams the local file only when it has been selected in the DB. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageSource(group.assets[0]!)} alt="" />
      <span className="project-gallery__card-shade" aria-hidden="true" />
      <span className="project-gallery__card-copy">
        <small>{group.label}{group.assets.length > 1 ? ` · ${group.assets.length}장` : ""}</small>
        <strong>{group.title}</strong>
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
  const [activeGroup, setActiveGroup] = useState<GalleryGroup | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<GalleryAssetCategory>("result");
  const activeTab = galleryTabs.find((tab) => tab.value === activeCategory)!;
  const visibleAssets = assets.filter(
    (asset) => asset.category === activeCategory,
  );
  const visibleGroups = groupAssets(visibleAssets);
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

  const openGroup = (group: GalleryGroup, element: HTMLButtonElement) => {
    sourceCardRef.current = element;
    setActiveGroup(group);
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
    setActiveGroup(null);
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
            {visibleGroups.map((group) => (
              <GalleryCard
                group={group}
                key={group.id}
                onOpen={openGroup}
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

      {activeGroup ? (
        <div
          className="project-gallery__dialog-backdrop"
          role="presentation"
          onMouseDown={closeAsset}
        >
          <div
            className="project-gallery__dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${activeGroup.label} 상세 보기`}
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
              {activeGroup.assets.map((asset, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={asset.id} src={imageSource(asset)} alt={`${activeGroup.title} ${index + 1}번 이미지`} />
              ))}
            </div>
            <div className="project-gallery__dialog-copy">
              <p>{activeGroup.label} · {activeGroup.assets.length}장</p>
              <h2>{activeGroup.title}</h2>
              <span>{activeGroup.sourceGroup}</span>
              <p className="project-gallery__description">
                {activeGroup.description ??
                  "관리자 화면에서 이 사진의 맥락과 역할을 추가할 수 있습니다."}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
