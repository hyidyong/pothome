import type { PressRelease } from "@/lib/press-room/repository";

type PrRoomProps = { releases: PressRelease[] };

function thumbnailSource(assetId: string) {
  return `/api/asset-picker/image/${assetId}`;
}

const fallbackThumbnails: Record<string, { src: string; alt: string }> = {
  "https://www.realfoods.co.kr/article/10684688": {
    src: "/images/pr/terminal-espresso-future-leaders.png",
    alt: "2026 퓨처리더스 캠프 후속 네트워킹 현장",
  },
  "https://news.nate.com/view/20260629n18422": {
    src: "/images/pr/vision-pruner-camp.png",
    alt: "2026 비전프러너 캠프 현장",
  },
  "https://www.etoday.co.kr/news/view/2550490": {
    src: "/images/pr/future-leaders-camp.png",
    alt: "2026 퓨처리더스 캠프 현장",
  },
};

export function PrRoom({ releases }: PrRoomProps) {
  const orderedReleases = [...releases].sort(
    (left, right) => right.publishedOn.localeCompare(left.publishedOn),
  );
  return (
    <section className="pr-room" aria-labelledby="pr-room-heading">
      <header className="pr-room__header">
        <p>PR ROOM</p>
        <div>
          <h1 id="pr-room-heading">보도자료<br />아카이브.</h1>
          <p>활동과 프로젝트가 외부 기사로 소개된 기록입니다. 최신 기사부터 시간순으로 정리했습니다.</p>
        </div>
      </header>
      {orderedReleases.length ? (
        <div className="pr-room__list">
          {orderedReleases.map((release, index) => {
            const fallbackThumbnail = release.externalUrl
              ? fallbackThumbnails[release.externalUrl]
              : undefined;
            const content = (
              <>
                <div className="pr-room__image-wrap">
                  <span className="pr-room__number">{String(index + 1).padStart(2, "0")}</span>
                  {release.thumbnailAssetId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="pr-room__thumbnail" src={thumbnailSource(release.thumbnailAssetId)} alt="" />
                  ) : fallbackThumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="pr-room__thumbnail" src={fallbackThumbnail.src} alt={fallbackThumbnail.alt} />
                  ) : <div className="pr-room__thumbnail pr-room__thumbnail--empty" />}
                </div>
                <div className="pr-room__content">
                  <div className="pr-room__meta"><strong>{release.publisher}</strong><time dateTime={release.publishedOn}>{release.publishedOn}</time></div>
                  <h2>{release.headline}</h2>
                  <p>{release.summary}</p>
                  <span className="pr-room__read">기사 보기 <b aria-hidden="true">↗</b></span>
                </div>
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
