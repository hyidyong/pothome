"use client";

/* eslint-disable @next/next/no-img-element -- images are private local-file streams, not deployable assets. */

import { useMemo, useState } from "react";

import type { AssetDecision, AssetPickerAsset } from "@/lib/asset-picker/repository";

type AssetPickerProps = {
  assets: AssetPickerAsset[];
  page?: number;
  total?: number;
};

const decisionLabel: Record<AssetDecision, string> = {
  undecided: "검토",
  selected: "선택됨",
  rejected: "제외됨",
};

export function AssetPicker({ assets: initialAssets, page = 1, total }: AssetPickerProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [group, setGroup] = useState("전체");
  const groups = useMemo(
    () => ["전체", ...new Set(assets.map((asset) => asset.sourceGroup))],
    [assets],
  );
  const visibleAssets = assets.filter(
    (asset) => group === "전체" || asset.sourceGroup === group,
  );

  function setDecision(assetId: string, decision: AssetDecision) {
    setAssets((current) =>
      current.map((asset) =>
        asset.id === assetId ? { ...asset, decision } : asset,
      ),
    );
    void fetch("/api/asset-picker/decision", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assetId, decision }),
    });
  }

  return (
    <main className="asset-picker" aria-label="이미지 셀렉터">
      <header className="asset-picker__header">
        <p>PRIVATE ASSET CATALOG</p>
        <h1>현장 갤러리 이미지 셀렉터</h1>
        <span>{total ?? assets.length}개 후보</span>
      </header>
      <nav className="asset-picker__filters" aria-label="이미지 출처 필터">
        {groups.map((item) => (
          <button
            type="button"
            aria-pressed={group === item}
            key={item}
            onClick={() => setGroup(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <section className="asset-picker__grid" aria-label="이미지 후보 목록">
        {visibleAssets.map((asset) => (
          <article className="asset-picker__card" key={asset.id}>
            <img
              alt={`${asset.sourceGroup}의 ${asset.fileName}`}
              loading="lazy"
              src={`/api/asset-picker/image/${asset.id}`}
            />
            <div>
              <p>{asset.sourceGroup}</p>
              <h2>{asset.fileName}</h2>
              <small>{Math.max(1, Math.round(asset.byteSize / 1024))} KB · {decisionLabel[asset.decision]}</small>
            </div>
            <footer>
              <button type="button" onClick={() => setDecision(asset.id, "selected")}>선택</button>
              <button type="button" onClick={() => setDecision(asset.id, "rejected")}>제외</button>
            </footer>
          </article>
        ))}
      </section>
      {total && total > initialAssets.length ? (
        <nav className="asset-picker__pagination" aria-label="이미지 페이지">
          <button type="button" disabled={page === 1} onClick={() => { window.location.search = `?page=${page - 1}`; }}>이전</button>
          <span>{page} / {Math.ceil(total / initialAssets.length)}</span>
          <button type="button" disabled={page * initialAssets.length >= total} onClick={() => { window.location.search = `?page=${page + 1}`; }}>다음</button>
        </nav>
      ) : null}
    </main>
  );
}
