import Link from "next/link";
import {
  ArrowLeftIcon,
  AwardIcon,
  BadgeCheckIcon,
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

      <section className="resume-page__timeline" aria-label="연도별 공개 이력">
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
        className="resume-page__training"
        aria-labelledby="resume-training-heading"
      >
        <div className="resume-page__training-heading">
          <p>Continued learning</p>
          <h2 id="resume-training-heading">교육 및 수료</h2>
        </div>
        <ul className="resume-page__training-list">
          {data.training.map((entry) => (
            <li key={entry.title}>{entry.title}</li>
          ))}
        </ul>
      </section>

      {data.credentials.length > 0 ? (
        <section
          className="resume-page__training resume-page__credentials"
          aria-labelledby="resume-credentials-heading"
        >
          <div className="resume-page__training-heading">
            <p>Credentials</p>
            <h2 id="resume-credentials-heading">자격 및 면허</h2>
          </div>
          <ul className="resume-page__training-list">
            {data.credentials.map((entry) => (
              <li key={`${entry.period}-${entry.title}`}>
                <BadgeCheckIcon aria-hidden="true" />
                <div>
                  <strong>{entry.title}</strong>
                  <span>{entry.period}</span>
                  <p>{entry.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="resume-page__footer">
        <p>Evidence before claims.</p>
        <Link href="/#work">대표 프로젝트 보기</Link>
      </footer>
    </main>
  );
}
