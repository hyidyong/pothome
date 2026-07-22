"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import type { GalleryAsset, GalleryAssetCategory } from "@/lib/asset-picker/repository";
import type { PressRelease } from "@/lib/press-room/repository";

type ContentStudioProps = { assets: GalleryAsset[]; releases: PressRelease[] };

const categories: Array<{ value: GalleryAssetCategory; label: string }> = [
  { value: "result", label: "프로젝트 결과물" },
  { value: "field", label: "현장 활동" },
  { value: "credential", label: "수료 · 상장" },
];

async function request(path: string, options: RequestInit) {
  const response = await fetch(path, options);
  if (!response.ok) throw new Error("저장하지 못했습니다.");
}

export function ContentStudio({ assets, releases }: ContentStudioProps) {
  const [notice, setNotice] = useState("");

  const updateGallery = async (event: FormEvent<HTMLFormElement>, asset: GalleryAsset) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await request(`/api/admin/gallery/${asset.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          category: form.get("category"),
          title: form.get("title"),
          description: form.get("description") || null,
        }),
      });
      setNotice("사진 설명을 저장했습니다. 새로고침하면 갤러리에 반영됩니다.");
    } catch { setNotice("사진 설명을 저장하지 못했습니다."); }
  };

  const removeGallery = async (asset: GalleryAsset) => {
    try {
      await request(`/api/admin/gallery/${asset.id}`, { method: "DELETE" });
      setNotice("갤러리에서 숨겼습니다. 원본 파일은 그대로 보존됩니다.");
    } catch { setNotice("사진을 숨기지 못했습니다."); }
  };

  const createPress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await request("/api/admin/press", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          publisher: form.get("publisher"), headline: form.get("headline"), summary: form.get("summary"),
          publishedOn: form.get("publishedOn"), thumbnailAssetId: form.get("thumbnailAssetId") || null,
          externalUrl: form.get("externalUrl") || null,
        }),
      });
      event.currentTarget.reset();
      setNotice("보도자료를 추가했습니다. 새로고침하면 PR Room에 표시됩니다.");
    } catch { setNotice("보도자료를 추가하지 못했습니다."); }
  };

  const removePress = async (release: PressRelease) => {
    try {
      await request(`/api/admin/press/${release.id}`, { method: "DELETE" });
      setNotice("보도자료를 삭제했습니다.");
    } catch { setNotice("보도자료를 삭제하지 못했습니다."); }
  };

  return <main className="content-studio" id="main-content" tabIndex={-1}>
    <header className="content-studio__header"><p>LOCAL CONTENT STUDIO</p><h1>관리자 편집</h1><span>이 화면의 저장 API는 localhost에서만 작동합니다.</span></header>
    {notice ? <p className="content-studio__notice" role="status">{notice}</p> : null}
    <section aria-labelledby="studio-gallery"><div className="content-studio__section-heading"><div><p>GALLERY</p><h2 id="studio-gallery">프로젝트 갤러리</h2></div><Link href="/asset-picker">사진 추가</Link></div>
      <p className="content-studio__help">사진 추가에서 선택한 사진은 여기에서 제목·설명·분류를 붙여 공개합니다. 숨기기는 원본 파일을 삭제하지 않습니다.</p>
      <div className="content-studio__gallery-list">{assets.map((asset) => <form className="content-studio__asset" key={asset.id} onSubmit={(event) => updateGallery(event, asset)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/asset-picker/image/${asset.id}`} alt="" />
        <div><label>제목<input name="title" defaultValue={asset.title} maxLength={120} required /></label><label>분류<select name="category" defaultValue={asset.category}>{categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></label><label>설명<textarea name="description" defaultValue={asset.description ?? ""} maxLength={600} rows={3} /></label><div className="content-studio__actions"><button type="submit">설명 저장</button><button type="button" onClick={() => removeGallery(asset)}>갤러리에서 숨기기</button></div></div>
      </form>)}</div>
    </section>
    <section aria-labelledby="studio-press"><div className="content-studio__section-heading"><div><p>PR ROOM</p><h2 id="studio-press">보도자료</h2></div></div>
      <form className="content-studio__press-form" onSubmit={createPress}>
        <label>언론사/매체<input name="publisher" maxLength={80} required /></label><label>발행일<input name="publishedOn" type="date" required /></label><label className="content-studio__wide">헤드라인<input name="headline" maxLength={200} required /></label><label className="content-studio__wide">요약<textarea name="summary" maxLength={700} rows={4} required /></label><label>대표 이미지<select name="thumbnailAssetId" defaultValue=""><option value="">이미지 없음</option>{assets.map((asset) => <option value={asset.id} key={asset.id}>{asset.title}</option>)}</select></label><label>기사 링크<input name="externalUrl" type="url" placeholder="https://" /></label><button type="submit">보도자료 추가</button>
      </form>
      <div className="content-studio__press-list">{releases.map((release) => <article key={release.id}><div><strong>{release.publisher}</strong><span>{release.publishedOn}</span><h3>{release.headline}</h3></div><button type="button" onClick={() => removePress(release)}>삭제</button></article>)}</div>
    </section>
  </main>;
}
