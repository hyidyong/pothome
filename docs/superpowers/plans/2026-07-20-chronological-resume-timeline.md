# Chronological Resume Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic `/resume` capability summary with a public, evidence-bounded 2026–2022 chronological résumé backed by local Supabase.

**Architecture:** Extend `public.experience_entries` with explicit timeline metadata rather than encoding roles and years inside prose. The server repository normalizes two public groups—year-grouped chronology and undated training—then the Resume component renders them as an accessible responsive timeline with the existing one-time reveal behavior.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zod, local Supabase/Postgres, pgTAP, Vitest, Testing Library, CSS container/media queries, Lucide React.

## Global Constraints

- Use local Supabase as the only content source; do not use browser storage or a static JSON fallback.
- Never store or render contact details, address, photo, birth date, gender, contracts, raw research, or third-party personnel data.
- Keep unknown project execution dates explicit as `2026 · 문서화` and never imply delivery, revenue, client adoption, or legal advice.
- Keep the existing public-read-only RLS policy and add no public write path.
- Keep all title/body copy Korean-safe with `word-break: keep-all`; no horizontal overflow at 390px.
- Reuse `Reveal`; motion is transform/opacity-only, one-time, and immediately visible under reduced motion.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `supabase/migrations/20260720190000_chronological_resume_timeline.sql` | Adds explicit resume metadata and seeds only approved public chronology/training rows. |
| `supabase/tests/resume_timeline.test.sql` | Verifies schema constraints, public seed data, legacy-row removal, and anon read boundaries. |
| `src/lib/supabase/database.types.ts` | Regenerated local Supabase TypeScript definition for the new columns. |
| `src/lib/portfolio/types.ts` | Public normalized timeline and training data contracts. |
| `src/lib/portfolio/normalize.ts` | Zod validation, stable year grouping, and type-safe public output. |
| `src/lib/portfolio/repository.ts` | Selects only public timeline columns and sends them through the normalizer. |
| `tests/portfolio-normalize.test.ts` | Tests ordering, group separation, and invalid data rejection. |
| `tests/portfolio-repository.test.ts` | Tests the exact resume query shape and public ordering. |
| `src/components/portfolio/resume-page.tsx` | Semantic chronology, typed cards, training, education, and safe project links. |
| `src/app/globals.css` | Auto-layout timeline/card styling and responsive/reduced-motion behavior. |
| `tests/page-composition.test.tsx` | Locks the user-visible chronology, safe content, project labels, and links. |
| `EXPERIENCE_INVENTORY.md` | Adds a public chronological source-of-truth summary without private contact data. |

### Task 1: Persist approved public chronology in local Supabase

**Files:**
- Create: `supabase/migrations/20260720190000_chronological_resume_timeline.sql`
- Create: `supabase/tests/resume_timeline.test.sql`
- Modify: `EXPERIENCE_INVENTORY.md`

**Interfaces:**
- Produces database columns `section`, `display_year`, `entry_kind`, `organization`, `role`, `evidence_note`, and `case_study_slug` on `public.experience_entries`.
- Produces `section = 'timeline' | 'training'` public rows consumed by `normalizeResumeData()`.

- [ ] **Step 1: Write the failing database assertions**

Create `supabase/tests/resume_timeline.test.sql` with these checks before the migration exists:

```sql
begin;
select plan(11);

select has_column('public', 'experience_entries', 'section', 'resume section is stored');
select has_column('public', 'experience_entries', 'display_year', 'resume year is stored');
select has_column('public', 'experience_entries', 'entry_kind', 'resume kind is stored');
select has_column('public', 'experience_entries', 'organization', 'resume organization is stored');
select has_column('public', 'experience_entries', 'role', 'resume role is stored');
select has_column('public', 'experience_entries', 'evidence_note', 'resume evidence note is stored');
select results_eq(
  $$select array_agg(display_year order by display_year desc) from (select distinct display_year from public.experience_entries where section = 'timeline') years$$,
  array[2026::smallint, 2025::smallint, 2024::smallint, 2023::smallint, 2022::smallint],
  'public timeline contains 2026 through 2022 in descending order'
);
select ok(exists (select 1 from public.experience_entries where slug = 'ylc-hr-deputy-2026' and display_year = 2026), '2026 YLC HR activity is public');
select ok(exists (select 1 from public.experience_entries where slug = 'ban-ki-moon-climate-leader-2022' and display_year = 2022), '2022 climate leader activity is public');
select results_eq($$select count(*)::bigint from public.experience_entries where section = 'training' and published$$, array[8::bigint], 'eight undated training completions are public');
select is_empty($$select 1 from public.experience_entries where slug in ('strategy-research-decision-design', 'people-strategy-talent-systems', 'product-discovery-execution', 'legal-research-strategy-lens')$$, 'legacy generic resume rows are removed');
select * from finish();
rollback;
```

- [ ] **Step 2: Run the database test and verify it fails**

Run: `pnpm exec supabase test db --file supabase/tests/resume_timeline.test.sql`

Expected: FAIL because `section`, `display_year`, and `entry_kind` do not yet exist.

- [ ] **Step 3: Add the minimal schema and seed migration**

Create the timestamped migration with the following schema first:

```sql
alter table public.experience_entries
  add column section text not null default 'timeline',
  add column display_year smallint,
  add column entry_kind text,
  add column organization text,
  add column role text,
  add column evidence_note text,
  add column case_study_slug text references public.case_studies(slug) on delete set null,
  add constraint experience_entries_section_check check (section in ('timeline', 'training')),
  add constraint experience_entries_display_year_check check (display_year is null or display_year between 1900 and 2100),
  add constraint experience_entries_entry_kind_check check (entry_kind in ('work', 'project', 'activity', 'award', 'education', 'training')),
  add constraint experience_entries_section_shape_check check (
    (section = 'timeline' and display_year is not null and entry_kind <> 'training')
    or (section = 'training' and display_year is null and entry_kind = 'training')
  );

delete from public.experience_entries
where slug in (
  'strategy-research-decision-design',
  'people-strategy-talent-systems',
  'product-discovery-execution',
  'legal-research-strategy-lens'
);
```

Then insert/update the exact approved rows with `on conflict (slug) do update`, using these fixed classifications:

```text
2026 timeline: ai-solution-award-2026 (award), future-leaders-award-2026 (award), fki-hr-lead-2026 (activity), ylc-hr-deputy-2026 (activity), ai-prediction-regulation-2026 (project), global-technical-talent-2026 (project), re100-cf100-2026 (project), fitory-market-validation-2026 (project), pacemate-academic-os-2026 (project), vietnam-beauty-growth-2026 (project)
2025 timeline: ylc-completion-2025 (activity), ai-solution-team-lead-2025 (activity), daily-coin-2025-2026 (work)
2024 timeline: dandi-mobile-2024 (work), upgi-tteokbokki-2024 (work)
2023 timeline: dalseo-english-mentor-2022-2023 (activity), dalseo-coordinator-2022-2023 (activity), youth-leader-daegu-2022-2023 (activity)
2022 timeline: ban-ki-moon-climate-leader-2022 (education), keimyung-law-2022 (education)
training: human-ai-foundation, vibecoding-intermediate, ai-coding-course, dsac-data-scientist, adsp-preparation, digital-marketer-nia, change-and-learn-notion, international-law-college
```

For every project row, populate `evidence_note` with either `2026 · 문서화된 프로젝트` or `2026 · 문서화된 연구 초안` and set `case_study_slug` to the matching existing public case. Do not add phone numbers, contact names, dates of birth, photos, or any other resume metadata.

- [ ] **Step 4: Add the public-source inventory section**

Append a `## 7. 공개 이력 타임라인` section to `EXPERIENCE_INVENTORY.md` that records the 2026–2022 grouping, the eight undated training names, and the statement: `포트폴리오 프로젝트의 2026 표기는 공개 문서화 시점이며 실제 수행 연도를 주장하지 않는다.`

- [ ] **Step 5: Reset and validate the local database**

Run:

```powershell
pnpm exec supabase db reset --local
pnpm exec supabase test db
pnpm exec supabase gen types typescript --local | Set-Content -Encoding utf8 src/lib/supabase/database.types.ts
```

Expected: migrations apply, all pgTAP tests pass, and generated types include each new `experience_entries` column.

- [ ] **Step 6: Commit the database contract**

```powershell
git add supabase EXPERIENCE_INVENTORY.md src/lib/supabase/database.types.ts
git commit -m "feat: add chronological resume data"
```

### Task 2: Normalize and retrieve a structured public résumé

**Files:**
- Modify: `src/lib/portfolio/types.ts`
- Modify: `src/lib/portfolio/normalize.ts`
- Modify: `src/lib/portfolio/repository.ts`
- Modify: `tests/portfolio-normalize.test.ts`
- Modify: `tests/portfolio-repository.test.ts`

**Interfaces:**
- Consumes the Task 1 `experience_entries` fields.
- Produces `ResumeData = { timeline: ResumeYear[]; training: ResumeTrainingEntry[] }` for `ResumePage`.

- [ ] **Step 1: Write failing normalizer and repository tests**

Replace the generic `normalizeResumeData` fixture with rows using this exact shape:

```ts
{
  section: "timeline",
  display_year: 2026,
  entry_kind: "activity",
  title: "YLC 수료 및 인사팀 부팀장 활동",
  organization: "YLC",
  role: "인사팀 부팀장",
  period: "2026년 상반기",
  summary: "수료 후 인사팀 운영을 지원했습니다.",
  evidence_note: null,
  case_study_slug: null,
  sort_order: 4,
}
```

Assert that `normalizeResumeData()` returns `[2026, 2025]` in descending order, keeps entries in ascending `sort_order` inside each year, isolates `section: "training"` from the timeline, and throws when a timeline row has `display_year: null` or a training row has a year. Add repository expectations for the exact select aliases:

```ts
"section, year:display_year, kind:entry_kind, title, organization, role, period:period_label, summary, evidence_note, case_study_slug, sort_order:display_order"
```

- [ ] **Step 2: Run the targeted tests and verify they fail**

Run: `pnpm test -- tests/portfolio-normalize.test.ts tests/portfolio-repository.test.ts`

Expected: FAIL because the current model only accepts title, period, summary, and sort order.

- [ ] **Step 3: Implement the typed contracts and Zod transformation**

In `types.ts`, replace the old `ResumeEntry`/`ResumeData` with:

```ts
export type ResumeEntryKind = "work" | "project" | "activity" | "award" | "education";
export type ResumeEntry = {
  title: string;
  organization: string | null;
  role: string | null;
  period: string;
  kind: ResumeEntryKind;
  summary: string;
  evidenceNote: string | null;
  caseStudySlug: string | null;
};
export type ResumeYear = { year: number; entries: ResumeEntry[] };
export type ResumeTrainingEntry = { title: string };
export type ResumeData = { timeline: ResumeYear[]; training: ResumeTrainingEntry[] };
```

In `normalize.ts`, validate `section`, `display_year`, `entry_kind`, optional text fields, and sort order with Zod. Sort all parsed rows by `sort_order`, map `training` rows to `{ title }`, group only `timeline` rows in a `Map<number, ResumeEntry[]>`, then return `timeline` sorted `(right.year - left.year)`.

In `repository.ts`, select the aliases from Step 1, filter `.eq("published", true)`, and order by `display_year` descending followed by `display_order` ascending before calling `normalizeResumeData()`.

- [ ] **Step 4: Run the targeted tests and verify they pass**

Run: `pnpm test -- tests/portfolio-normalize.test.ts tests/portfolio-repository.test.ts`

Expected: PASS with no generic capability rows in any fixture.

- [ ] **Step 5: Commit the public data adapter**

```powershell
git add src/lib/portfolio/types.ts src/lib/portfolio/normalize.ts src/lib/portfolio/repository.ts tests/portfolio-normalize.test.ts tests/portfolio-repository.test.ts
git commit -m "feat: model resume timeline data"
```

### Task 3: Render an accessible, responsive résumé timeline

**Files:**
- Modify: `src/components/portfolio/resume-page.tsx`
- Modify: `src/app/globals.css`
- Modify: `tests/page-composition.test.tsx`

**Interfaces:**
- Consumes `ResumeData.timeline` and `ResumeData.training` from Task 2.
- Produces semantic regions named `연도별 공개 이력` and `교육 및 수료`, one `<article>` per activity, and optional `/work/[slug]` project links.

- [ ] **Step 1: Write the failing page-composition test**

Update `resumeData` to have a 2026 activity, a 2025 work entry, a 2022 education entry, one 2026 documented project with `caseStudySlug: "ai-prediction-regulation"`, and two training values. Assert:

```ts
expect(screen.getByRole("region", { name: "연도별 공개 이력" })).toBeInTheDocument();
expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toContain("2026");
expect(screen.getByText("YLC 수료 및 인사팀 부팀장 활동")).toBeInTheDocument();
expect(screen.getByText("2026 · 문서화된 연구 초안")).toBeInTheDocument();
expect(screen.getByRole("link", { name: "프로젝트 보기: AI Prediction Regulation" })).toHaveAttribute("href", "/work/ai-prediction-regulation");
expect(screen.getByRole("region", { name: "교육 및 수료" })).toHaveTextContent("Human AI Foundation");
expect(container).not.toHaveTextContent("Strategy Research & Decision Design");
```

Also retain the existing no-email, no-phone, no-postal-code assertions and assert every timeline article has one `resume-page__entry` descendant inside a `Reveal` wrapper.

- [ ] **Step 2: Run the component test and verify it fails**

Run: `pnpm test -- tests/page-composition.test.tsx`

Expected: FAIL because `ResumePage` still renders one flat generic list and has no timeline/training regions.

- [ ] **Step 3: Implement the semantic timeline markup**

Rewrite `ResumePage` to iterate over `data.timeline`. Each year uses `<section className="resume-page__year" aria-labelledby={\`resume-year-${year}\`}>`, an `<h2>` containing the year, and a list of `Reveal`-wrapped `<article className="resume-page__entry">` cards. Render the kind as visible text (`실무`, `프로젝트`, `대외활동`, `수상`, `교육`) next to a Lucide icon.

Render `organization`, `role`, `summary`, and `evidenceNote` only when non-null. When `caseStudySlug` is present, render exactly:

```tsx
<Link href={`/work/${entry.caseStudySlug}`} aria-label={`프로젝트 보기: ${entry.title}`}>
  프로젝트 보기
</Link>
```

Render `data.training` under `<section className="resume-page__training" aria-labelledby="resume-training-heading">` as a semantic list. Keep the existing home and representative-project footer links.

- [ ] **Step 4: Implement auto-layout and reduced-motion-safe styles**

Replace the old flat `.resume-page__entries` rules with these layout constraints:

```css
.resume-page__timeline { padding-inline: var(--gutter); }
.resume-page__year { display: grid; grid-template-columns: minmax(120px, .34fr) minmax(0, 1.66fr); gap: clamp(24px, 6vw, 96px); padding-block: clamp(56px, 8vw, 112px); border-bottom: 1px solid var(--line); }
.resume-page__year > h2 { color: var(--signal); font-family: "Instrument Serif", Georgia, serif; font-size: clamp(3rem, 7vw, 7.5rem); line-height: .82; }
.resume-page__year-list { display: grid; gap: 14px; min-width: 0; }
.resume-page__entry { grid-template-columns: auto minmax(0, 1fr); gap: 16px; padding: clamp(20px, 3vw, 32px); border: 1px solid var(--line); border-radius: 20px; background: rgba(255, 255, 255, .02); }
@media (max-width: 900px) { .resume-page__year { grid-template-columns: minmax(0, 1fr); } }
```

Add card and training styles with `min-width: 0`, `text-wrap: balance` for titles, `word-break: keep-all` for Korean copy, and 44px minimum link targets. Do not add a scroll pin, fade-out, local storage, or horizontal carousel.

- [ ] **Step 5: Run the component test and verify it passes**

Run: `pnpm test -- tests/page-composition.test.tsx`

Expected: PASS; page has chronological years, safe project labels, training, and no private-data patterns.

- [ ] **Step 6: Commit the résumé interface**

```powershell
git add src/components/portfolio/resume-page.tsx src/app/globals.css tests/page-composition.test.tsx
git commit -m "feat: render chronological resume timeline"
```

### Task 4: Run end-to-end local QA and record the result

**Files:**
- Modify only if verification discovers a defect: files from Tasks 1–3.

**Interfaces:**
- Consumes the completed database, repository, and Resume page.
- Produces a locally verifiable `/resume` with no deployment configuration changes.

- [ ] **Step 1: Run the full automated suite**

Run:

```powershell
pnpm exec supabase db reset --local
pnpm exec supabase test db
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: every command exits 0. If a migration regenerates types differently, regenerate via `pnpm exec supabase gen types typescript --local | Set-Content -Encoding utf8 src/lib/supabase/database.types.ts`, re-run typecheck, and commit only that generated diff.

- [ ] **Step 2: Verify the local public API denies writes and exposes only public resume rows**

Run a local anon GET against `experience_entries` and verify all returned rows have `published: true`; then issue an anon POST and verify it is rejected by RLS. Do not print or copy any secrets to terminal output.

- [ ] **Step 3: Manually inspect `/resume` at desktop, mobile, and reduced motion**

Use `http://127.0.0.1:3000/resume` at 1280px and 390px, then emulate `prefers-reduced-motion: reduce`. Confirm years descend 2026 to 2022; cards do not overlap, clip, or create horizontal scroll; project dates read as documentation labels; training appears after the chronology; and no generic four-entry copy or private contact details are visible.

- [ ] **Step 4: Commit any verification fixes**

```powershell
git status --short
git add supabase/migrations/20260720190000_chronological_resume_timeline.sql supabase/tests/resume_timeline.test.sql src/lib/supabase/database.types.ts src/lib/portfolio/types.ts src/lib/portfolio/normalize.ts src/lib/portfolio/repository.ts src/components/portfolio/resume-page.tsx src/app/globals.css tests/portfolio-normalize.test.ts tests/portfolio-repository.test.ts tests/page-composition.test.tsx EXPERIENCE_INVENTORY.md
git commit -m "fix: verify chronological resume timeline"
```

Run the `git add` and commit only when QA changed one or more of the listed files; otherwise leave the worktree clean.
