import Link from "next/link";
import {
  ArrowLeftIcon,
  AwardIcon,
  BriefcaseIcon,
  FolderKanbanIcon,
  GraduationCapIcon,
  UsersIcon,
} from "lucide-react";

import { Reveal } from "@/components/portfolio/reveal";
import type { ResumeData, ResumeEntryKind } from "@/lib/portfolio/types";

type ResumePageProps = {
  data: ResumeData;
};

const entryKindMeta: Record<
  ResumeEntryKind,
  { label: string; Icon: typeof BriefcaseIcon }
> = {
  work: { label: "실무", Icon: BriefcaseIcon },
  project: { label: "프로젝트", Icon: FolderKanbanIcon },
  activity: { label: "대외활동", Icon: UsersIcon },
  award: { label: "수상", Icon: AwardIcon },
  education: { label: "교육", Icon: GraduationCapIcon },
};

export function ResumePage({ data }: ResumePageProps) {
  const experienceEntries = data.timeline.flatMap(({ entries }) => entries);
  const featuredProjects = experienceEntries.filter(
    (entry) => entry.kind === "project",
  );
  const awards = experienceEntries.filter((entry) => entry.kind === "award");

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

      <nav className="resume-page__section-tabs" aria-label="이력서 섹션 바로가기">
        <a href="#resume-summary">요약</a>
        <a href="#resume-experience">활동 · 프로젝트</a>
        <a href="#resume-learning">교육 · 수료</a>
        <a href="#resume-credentials">자격증</a>
      </nav>

      <section
        id="resume-summary"
        className="resume-page__summary-panel"
        aria-labelledby="resume-summary-heading"
      >
        <header className="resume-page__summary-heading">
          <p>At a glance</p>
          <h2 id="resume-summary-heading">요약</h2>
          <p>
            전략기획 관점에서 먼저 볼 수 있는 대표 프로젝트와 수상 내역입니다.
          </p>
        </header>
        <div className="resume-page__summary-grid">
          <section aria-labelledby="resume-summary-projects-heading">
            <div className="resume-page__summary-label">
              <span>01</span>
              <h3 id="resume-summary-projects-heading">대표 프로젝트</h3>
            </div>
            <ul>
              {featuredProjects.slice(0, 4).map((entry) => (
                <li key={entry.title}>
                  <p>{entry.period}</p>
                  <div>
                    <h4>{entry.title}</h4>
                    <span>{entry.role ?? entry.summary}</span>
                  </div>
                  {entry.caseStudySlug ? (
                    <Link
                      href={`/work/${entry.caseStudySlug}`}
                      aria-label={`${entry.title} 상세 보기`}
                    >
                      보기
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="resume-summary-awards-heading">
            <div className="resume-page__summary-label">
              <span>02</span>
              <h3 id="resume-summary-awards-heading">수상 내역</h3>
            </div>
            <ul>
              {awards.map((entry) => (
                <li key={entry.title}>
                  <p>{entry.period}</p>
                  <div>
                    <h4>{entry.title}</h4>
                    <span>{entry.summary}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <section
        id="resume-experience"
        className="resume-page__timeline"
        aria-labelledby="resume-experience-heading"
      >
        <header className="resume-page__timeline-heading">
          <p>Selected experience</p>
          <h2 id="resume-experience-heading">활동 · 프로젝트</h2>
          <p>
            역할, 프로젝트, 수상처럼 실제로 수행한 굵직한 이력만 연도별로
            정리했습니다.
          </p>
        </header>
        {data.timeline.map(({ year, entries }) => (
          <section
            className="resume-page__year"
            aria-labelledby={`resume-year-${year}`}
            key={year}
          >
            <h2 id={`resume-year-${year}`}>{year}</h2>
            <ul className="resume-page__year-list">
              {entries.map((entry, index) => {
                const { label, Icon } = entryKindMeta[entry.kind];

                return (
                  <li
                    className="resume-page__year-item"
                    key={`${entry.period}-${entry.title}`}
                  >
                    <Reveal
                      className="resume-page__entry-reveal"
                      delayMs={(index % 3) * 80}
                    >
                      <article className="resume-page__entry">
                        <div className="resume-page__entry-kind">
                          <Icon aria-hidden="true" />
                          <span>{label}</span>
                        </div>
                        <div className="resume-page__entry-copy">
                          <p className="resume-page__period">{entry.period}</p>
                          <h3>{entry.title}</h3>
                          {entry.organization ? (
                            <p className="resume-page__organization">
                              {entry.organization}
                            </p>
                          ) : null}
                          {entry.role ? (
                            <p className="resume-page__role">{entry.role}</p>
                          ) : null}
                          {entry.summary ? (
                            <p className="resume-page__summary">
                              {entry.summary}
                            </p>
                          ) : null}
                          {entry.evidenceNote ? (
                            <p className="resume-page__evidence-note">
                              {entry.evidenceNote}
                            </p>
                          ) : null}
                          {entry.caseStudySlug ? (
                            <Link
                              href={`/work/${entry.caseStudySlug}`}
                              aria-label={`프로젝트 보기: ${entry.title}`}
                            >
                              프로젝트 보기
                            </Link>
                          ) : null}
                        </div>
                      </article>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </section>

      <section
        id="resume-learning"
        className="resume-page__training"
        aria-labelledby="resume-training-heading"
      >
        <div className="resume-page__training-heading">
          <p>Continued learning</p>
          <h2 id="resume-training-heading">교육 및 수료</h2>
        </div>
        <ul className="resume-page__training-list">
          {data.training.map((entry) => (
            <li key={entry.title}>
              <p>{entry.period}</p>
              <div>
                <h3>{entry.title}</h3>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="resume-credentials"
        className="resume-page__credentials"
        aria-labelledby="resume-credentials-heading"
      >
        <div className="resume-page__credentials-heading">
          <p>Credentials</p>
          <h2 id="resume-credentials-heading">자격증</h2>
        </div>
        <ul className="resume-page__credentials-list">
          {data.credentials.map((entry) => (
            <li key={entry.title}>
              <p>{entry.period}</p>
              <div>
                <h3>{entry.title}</h3>
                <span>{entry.summary}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="resume-page__footer">
        <p>Evidence before claims.</p>
        <Link href="/#work">대표 프로젝트 보기</Link>
      </footer>
    </main>
  );
}
