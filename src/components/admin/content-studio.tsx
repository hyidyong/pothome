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
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error ?? "저장하지 못했습니다.");
  }
  return response;
}

export function ContentStudio({ assets, releases }: ContentStudioProps) {
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);

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

  const uploadGallery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) {
      setNotice("업로드할 이미지 파일을 선택해 주세요.");
      return;
    }
    setUploading(true);
    try {
      await request("/api/admin/gallery/upload", { method: "POST", body: form });
      setNotice("이미지를 갤러리에 추가했습니다. 새로고침하면 바로 표시됩니다.");
      event.currentTarget.reset();
      window.setTimeout(() => window.location.reload(), 350);
    } catch {
      setNotice("이미지 업로드에 실패했습니다. 파일 형식과 용량을 확인해 주세요.");
    } finally {
      setUploading(false);
    }
  };

  const moveGallery = async (asset: GalleryAsset, category: GalleryAssetCategory) => {
    if (asset.category === category) return;
    try {
      await request(`/api/admin/gallery/${asset.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ category, title: asset.title, description: asset.description }),
      });
      setNotice(`“${asset.title}”의 분류를 옮겼습니다.`);
      window.setTimeout(() => window.location.reload(), 350);
    } catch {
      setNotice("분류를 옮기지 못했습니다. 다시 시도해 주세요.");
    }
  };

  const createPress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      let thumbnailAssetId = form.get("thumbnailAssetId") || null;
      const thumbnailFile = form.get("thumbnailFile");
      if (thumbnailFile instanceof File && thumbnailFile.size) {
        const thumbnailForm = new FormData();
        thumbnailForm.set("file", thumbnailFile);
        thumbnailForm.set("title", String(form.get("headline") || "보도자료 썸네일"));
        const thumbnailResponse = await request("/api/admin/press/thumbnail", { method: "POST", body: thumbnailForm });
        thumbnailAssetId = (await thumbnailResponse.json() as { id: string }).id;
      }
      await request("/api/admin/press", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          publisher: form.get("publisher"), headline: form.get("headline"), summary: form.get("summary"),
          publishedOn: form.get("publishedOn"), thumbnailAssetId,
          externalUrl: form.get("externalUrl") || null,
        }),
      });
      event.currentTarget.reset();
      setNotice("보도자료를 추가했습니다. 새로고침하면 PR Room에 표시됩니다.");
      window.setTimeout(() => window.location.reload(), 350);
    } catch (error) { setNotice(error instanceof Error ? error.message : "보도자료를 추가하지 못했습니다."); }
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
    <section aria-labelledby="studio-gallery"><div className="content-studio__section-heading"><div><p>GALLERY</p><h2 id="studio-gallery">프로젝트 갤러리</h2></div><Link href="/asset-picker">기존 사진 선택</Link></div>
      <form className="content-studio__upload-form" onSubmit={uploadGallery} encType="multipart/form-data">
        <div><p>NEW UPLOAD</p><h3>새 사진 업로드</h3><span>JPG, PNG, WebP, GIF · 최대 10MB · 이 컴퓨터의 로컬 환경에만 저장됩니다.</span></div>
        <label>이미지 파일<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required /></label>
        <label>제목<input name="title" maxLength={120} required placeholder="예: AI Solution Challenge 최우수상" /></label>
        <label>분류<select name="category" defaultValue="result">{categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></label>
        <label className="content-studio__wide">설명<textarea name="description" maxLength={600} rows={3} placeholder="사진에 대한 간단한 설명" /></label>
        <button type="submit" disabled={uploading}>{uploading ? "업로드 중…" : "갤러리에 업로드"}</button>
      </form>
      <p className="content-studio__help">사진 추가에서 선택한 사진은 여기에서 제목·설명·분류를 붙여 공개합니다. 숨기기는 원본 파일을 삭제하지 않습니다.</p>
      <div className="content-studio__gallery-list">{assets.map((asset) => <form className="content-studio__asset" key={asset.id} onSubmit={(event) => updateGallery(event, asset)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/asset-picker/image/${asset.id}`} alt="" />
        <div><label>제목<input name="title" defaultValue={asset.title} maxLength={120} required /></label><label>분류<select name="category" defaultValue={asset.category}>{categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></label><label>설명<textarea name="description" defaultValue={asset.description ?? ""} maxLength={600} rows={3} /></label><div className="content-studio__move" role="group" aria-label={`${asset.title} 분류 이동`}><span>빠른 이동</span>{categories.map((category) => <button type="button" key={category.value} disabled={asset.category === category.value} onClick={() => moveGallery(asset, category.value)}>{category.label}</button>)}</div><div className="content-studio__actions"><button type="submit">설명 저장</button><button type="button" onClick={() => removeGallery(asset)}>갤러리에서 숨기기</button></div></div>
      </form>)}</div>
    </section>
    <section aria-labelledby="studio-press"><div className="content-studio__section-heading"><div><p>PR ROOM</p><h2 id="studio-press">보도자료</h2></div></div>
      <form className="content-studio__press-form" onSubmit={createPress} encType="multipart/form-data">
        <label>언론사/매체<input name="publisher" maxLength={80} required /></label><label>발행일<input name="publishedOn" type="date" required /></label><label className="content-studio__wide">헤드라인<input name="headline" maxLength={200} required /></label><label className="content-studio__wide">요약<textarea name="summary" maxLength={700} rows={4} required /></label><label>기존 대표 이미지<select name="thumbnailAssetId" defaultValue=""><option value="">이미지 없음</option>{assets.map((asset) => <option value={asset.id} key={asset.id}>{asset.title}</option>)}</select></label><label>새 대표 이미지<input name="thumbnailFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label><label>기사 링크<input name="externalUrl" type="url" placeholder="https://" /></label><p className="content-studio__press-help">새 이미지를 선택하면 기존 이미지 선택보다 우선해 보도자료 전용 썸네일로 저장합니다.</p><button type="submit">보도자료 추가</button>
      </form>
      <div className="content-studio__press-list">{releases.map((release) => <article key={release.id}><div><strong>{release.publisher}</strong><span>{release.publishedOn}</span><h3>{release.headline}</h3></div><button type="button" onClick={() => removePress(release)}>삭제</button></article>)}</div>
    </section>
  </main>;
}
