import type { PressRelease } from "@/lib/press-room/repository";

type PrRoomProps = { releases: PressRelease[] };

function thumbnailSource(assetId: string) {
  return `/api/asset-picker/image/${assetId}`;
}

export function PrRoom({ releases }: PrRoomProps) {
  return (
    <section className="pr-room" aria-labelledby="pr-room-heading">
      <header className="pr-room__header">
        <p>PR ROOM</p>
        <div>
          <h1 id="pr-room-heading">PR Room</h1>
          <p>언론사와 핵심 메시지가 먼저 보이는 보도자료 아카이브입니다. 대표 이미지는 맥락을 보완할 때만 사용합니다.</p>
        </div>
      </header>
      {releases.length ? (
        <div className="pr-room__list">
          {releases.map((release) => {
            const content = (
              <>
                {release.thumbnailAssetId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="pr-room__thumbnail" src={thumbnailSource(release.thumbnailAssetId)} alt="" />
                ) : null}
                <div className="pr-room__meta"><strong>{release.publisher}</strong><time dateTime={release.publishedOn}>{release.publishedOn}</time></div>
                <h2>{release.headline}</h2>
                <p>{release.summary}</p>
                <span aria-hidden="true">Read release →</span>
              </>
            );
            return release.externalUrl ? (
              <a className="pr-room__card" key={release.id} href={release.externalUrl} target="_blank" rel="noreferrer">{content}</a>
            ) : <article className="pr-room__card" key={release.id}>{content}</article>;
          })}
        </div>
      ) : (
        <div className="pr-room__empty">
          <strong>공개된 보도자료가 아직 없습니다.</strong>
          <p>관리자 화면에서 언론사, 헤드라인, 요약과 대표 이미지를 추가하면 이곳에 표시됩니다.</p>
        </div>
      )}
    </section>
  );
}
