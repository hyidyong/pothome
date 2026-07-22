"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";
import { X } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";

import { getGalleryMotionPolicy } from "@/components/portfolio/gallery-motion";
import type { GalleryAsset, GalleryAssetCategory } from "@/lib/asset-picker/repository";

type ProjectGalleryProps = { assets: GalleryAsset[] };
type EvidenceTab = Exclude<GalleryAssetCategory, "field">;

const evidenceTabs: ReadonlyArray<{ value: EvidenceTab; label: string }> = [
  { value: "strategy", label: "전략" },
  { value: "execution", label: "실행" },
  { value: "product", label: "제품" },
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

export function ProjectGallery({ assets }: ProjectGalleryProps) {
  const rootRef = useRef<HTMLElement>(null);
  const sourceCardRef = useRef<HTMLButtonElement | null>(null);
  const [activeAsset, setActiveAsset] = useState<GalleryAsset | null>(null);
  const [activeTab, setActiveTab] = useState<EvidenceTab>("strategy");
  const fieldAssets = assets.filter((asset) => asset.category === "field");
  const evidenceAssets = assets.filter((asset) => asset.category !== "field");
  const tabAssets = evidenceAssets.filter((asset) => asset.category === activeTab);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || typeof window.matchMedia !== "function") return;
      const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-gallery-card]"));
      const media = gsap.matchMedia();

      media.add(
        {
          isDesktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conditions = context.conditions as { isDesktop: boolean; reduceMotion: boolean };
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
          const reveal = gsap.timeline({
            defaults: { duration: 0.78, ease: "power3.out" },
            scrollTrigger: {
              trigger: root,
              start: "top 72%",
              toggleActions: "play none none reverse",
            },
          });
          reveal.to(cards, {
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
    { scope: rootRef, dependencies: [assets.length], revertOnUpdate: true },
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
    const cards = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-gallery-card]"));
    const activeIndex = activeElement ? cards.indexOf(activeElement) : -1;
    gsap.to(cards, {
      x: (index: number) => (activeIndex < 0 ? 0 : index < activeIndex ? -12 : index > activeIndex ? 12 : 0),
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

  const shelfAssets = fieldAssets.length ? fieldAssets : assets.slice(0, 6);

  return (
    <section className="project-gallery" ref={rootRef} aria-labelledby="project-gallery-heading">
      <header className="project-gallery__header">
        <p>PROJECT GALLERY</p>
        <div>
          <h1 id="project-gallery-heading">프로젝트 갤러리</h1>
          <p>현장과 실행의 기록을 같은 비율의 카드로 정리했습니다. 카드를 선택하면 원본을 편하게 확인할 수 있습니다.</p>
        </div>
      </header>

      <section className="project-gallery__panel" aria-label="현장 갤러리">
        <div className="project-gallery__panel-intro">
          <p>FIELD GALLERY</p>
          <h2>현장 갤러리</h2>
          <span>책장처럼 나열된 기록입니다. 데스크톱에서는 살짝 꺼내어 보듯 반응합니다.</span>
        </div>
        <div className="project-gallery__fan" data-gallery-fan>
          {shelfAssets.map((asset) => <GalleryCard asset={asset} key={asset.id} onOpen={openAsset} onHover={hoverCard} />)}
        </div>
      </section>

      <section className="project-gallery__panel project-gallery__panel--evidence" aria-label="증빙 자료">
        <div className="project-gallery__panel-intro">
          <p>DOCUMENTED WORK</p>
          <h2>증빙 자료</h2>
          <div className="project-gallery__tabs" role="tablist" aria-label="증빙 자료 분류">
            {evidenceTabs.map((tab) => (
              <button type="button" key={tab.value} role="tab" aria-selected={activeTab === tab.value} onClick={() => setActiveTab(tab.value)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="project-gallery__grid" role="tabpanel" aria-label={`${evidenceTabs.find((tab) => tab.value === activeTab)?.label ?? "증빙"} 자료`}>
          {(tabAssets.length ? tabAssets : evidenceAssets).map((asset) => <GalleryCard asset={asset} key={asset.id} onOpen={openAsset} onHover={hoverCard} />)}
        </div>
      </section>

      {activeAsset ? (
        <div className="project-gallery__dialog-backdrop" role="presentation" onMouseDown={closeAsset}>
          <div className="project-gallery__dialog" role="dialog" aria-modal="true" aria-label={`${activeAsset.label} 상세 보기`} tabIndex={-1} onKeyDown={onOverlayKeyDown} onMouseDown={(event) => event.stopPropagation()}>
            <button className="project-gallery__close" type="button" onClick={closeAsset} aria-label="상세 보기 닫기"><X size={20} aria-hidden="true" /></button>
            <div className="project-gallery__image-scroll">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSource(activeAsset)} alt={`${activeAsset.title} 원본`} />
            </div>
            <div className="project-gallery__dialog-copy">
              <p>{activeAsset.label}</p>
              <h2>{activeAsset.title}</h2>
              <span>{activeAsset.sourceGroup}</span>
              <p className="project-gallery__description">{activeAsset.description ?? "관리자 화면에서 이 사진의 맥락과 역할을 추가할 수 있습니다."}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
