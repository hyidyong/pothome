import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import type { ResumeData } from "@/lib/portfolio/types";

type ResumePageProps = {
  data: ResumeData;
};

export function ResumePage({ data }: ResumePageProps) {
  return (
    <main className="resume-page">
      <nav className="resume-page__nav" aria-label="이력서 경로">
        <Link href="/" aria-label="포트폴리오 홈으로 돌아가기">
          <ArrowLeftIcon aria-hidden="true" />
          <span>Portfolio</span>
        </Link>
      </nav>

      <header className="resume-page__hero">
        <p>Strategy Planning · HR · PM</p>
        <h1>공개 이력</h1>
        <p>
          공개 가능한 역할과 프로젝트 범위만으로 구성한 전략기획 중심의
          이력입니다.
        </p>
      </header>

      <section className="resume-page__entries" aria-label="공개 경험">
        {data.entries.map((entry) => (
          <article
            className="resume-page__entry"
            key={`${entry.period}-${entry.title}`}
          >
            <p className="resume-page__period">{entry.period}</p>
            <div className="resume-page__entry-copy">
              <h2>{entry.title}</h2>
              {entry.organization ? <p>{entry.organization}</p> : null}
              <p>{entry.summary}</p>
            </div>
          </article>
        ))}
      </section>

      <footer className="resume-page__footer">
        <p>Evidence before claims.</p>
        <Link href="/#work">대표 프로젝트 보기</Link>
      </footer>
    </main>
  );
}
