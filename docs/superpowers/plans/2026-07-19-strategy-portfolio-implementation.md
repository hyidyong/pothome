# Strategy Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deployment-ready, strategy-planning-first portfolio with the approved B1.2 Signal Noir UI, verified evidence, GSAP scroll storytelling, and Supabase-backed public content.

**Architecture:** Next.js App Router renders public content with React Server Components and one server-side Supabase repository. Client JavaScript is limited to accessible navigation and two motion primitives; only Decision Spine uses GSAP ScrollTrigger. Local Supabase migrations are the reproducible development source and are pushed unchanged to hosted Supabase for deployment.

**Tech Stack:** Next.js 16.2.10, React 19.2.7, TypeScript 7.0.2, Tailwind CSS 4.3.3, shadcn 4.13.1, GSAP 3.15.0, `@gsap/react` 2.1.2, Supabase JS 2.110.7, Supabase CLI 2.109.1, Zod 4.4.3, Vitest 4.1.10, Testing Library 16.3.2.

## Global Constraints

- The approved design source is `docs/superpowers/specs/2026-07-19-strategy-portfolio-design.md` and `.superpowers/brainstorm/173-1784464204/content/homepage-strategy-motion-v2.html`.
- Preserve the Hero copy exactly: `복잡한 신호를, 실행 가능한 전략으로.`
- Publish only verified values: `21 + 38`, `57`, `118`, and the case-specific values listed in the design spec.
- Never present `21 + 38` as a summed participant count and never publish raw-row `40` as the final valid sample.
- Do not use browser `localStorage`, runtime JSON files, Realtime, Auth, or a CMS in the initial version.
- Do not store identity documents, contracts, signatures, applications, contact details, raw survey/interview rows, personnel data, `.env`, tokens, or secret keys in the repository or Supabase.
- Korean UI uses Pretendard Variable; Instrument Serif is limited to English display copy and large numbers.
- Body text is at least 16px, interactive targets are at least 44×44px, and all layouts must remain horizontal-scroll-free at 390px and 200% zoom.
- General cards reveal once. Only Decision Spine may fade out completed steps, and all sticky/scrub behavior is disabled on mobile and under `prefers-reduced-motion`.
- Use `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` only on the server. Never use `service_role` or a `NEXT_PUBLIC_` secret.
- Pin exact dependency versions and commit `pnpm-lock.yaml`.

---

## File Structure

```text
work-home/
├─ package.json                         # scripts and exact dependency versions
├─ pnpm-lock.yaml                       # reproducible dependency graph
├─ next.config.ts                       # image and production configuration
├─ tsconfig.json                        # strict TypeScript aliases
├─ eslint.config.mjs                    # Next.js ESLint flat config
├─ postcss.config.mjs                   # Tailwind PostCSS plugin
├─ vitest.config.ts                     # jsdom tests
├─ vitest.setup.ts                      # jest-dom matchers and cleanup
├─ components.json                      # shadcn registry configuration
├─ .env.example                         # non-secret variable names only
├─ public/images/                       # optimized generated portfolio media
├─ src/app/
│  ├─ globals.css                       # design tokens, typography, auto-layout
│  ├─ layout.tsx                        # fonts, metadata, global shell
│  ├─ page.tsx                          # cached homepage data composition
│  ├─ work/[slug]/page.tsx              # case-study route
│  └─ resume/page.tsx                   # public-safe resume route
├─ src/components/
│  ├─ ui/                               # shadcn Button, Sheet, Separator
│  ├─ site-header.tsx                   # desktop and mobile navigation
│  └─ portfolio/
│     ├─ hero-section.tsx
│     ├─ evidence-rail.tsx
│     ├─ case-study-card.tsx
│     ├─ selected-work.tsx
│     ├─ reveal.tsx
│     ├─ decision-spine.tsx
│     ├─ law-lens-section.tsx
│     ├─ supporting-work.tsx
│     ├─ site-footer.tsx
│     ├─ home-page.tsx
│     ├─ case-study-page.tsx
│     └─ resume-page.tsx
├─ src/lib/
│  ├─ env.ts                             # server environment validation
│  ├─ supabase/server.ts                 # server-only Supabase client
│  ├─ supabase/database.types.ts         # generated database types
│  └─ portfolio/
│     ├─ types.ts                        # public domain model
│     ├─ normalize.ts                    # database-to-domain validation
│     └─ repository.ts                   # typed Supabase reads
├─ supabase/
│  ├─ config.toml
│  ├─ migrations/
│  │  ├─ *_initial_portfolio_schema.sql
│  │  └─ *_initial_public_content.sql
│  └─ tests/portfolio_rls.test.sql
├─ tests/
│  ├─ smoke.test.tsx
│  ├─ portfolio-normalize.test.ts
│  ├─ portfolio-components.test.tsx
│  ├─ motion-policy.test.ts
│  └─ page-composition.test.tsx
├─ scripts/check-public-content.mjs      # sensitive-pattern and forbidden-number guard
├─ EXPERIENCE_INVENTORY.md               # safe experience summaries
├─ SENSITIVE_REVIEW.txt                  # paths and exclusion reasons only
├─ TODO.md                               # user-only deployment and disclosure actions
└─ skills/strategy-portfolio-workflow/   # reusable Codex workflow skill source
```

---

### Task 1: Project Foundation and Test Harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `eslint.config.mjs`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Test: `tests/smoke.test.tsx`

**Interfaces:**
- Consumes: approved design copy and global constraints.
- Produces: a strict Next.js project with `@/*` imports and runnable `test`, `lint`, `typecheck`, and `build` scripts.

- [ ] **Step 1: Create the package and tool configuration**

Create `package.json` with exact versions:

```json
{
  "name": "strategy-portfolio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@gsap/react": "2.1.2",
    "@supabase/supabase-js": "2.110.7",
    "gsap": "3.15.0",
    "lucide-react": "1.25.0",
    "next": "16.2.10",
    "react": "19.2.7",
    "react-dom": "19.2.7",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "16.3.2",
    "@types/node": "26.1.1",
    "@types/react": "19.2.17",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "6.0.3",
    "eslint": "10.7.0",
    "eslint-config-next": "16.2.10",
    "jsdom": "29.1.1",
    "prettier": "3.9.5",
    "prettier-plugin-tailwindcss": "0.8.1",
    "shadcn": "4.13.1",
    "supabase": "2.109.1",
    "tailwindcss": "4.3.3",
    "typescript": "7.0.2",
    "vite": "8.1.5",
    "vitest": "4.1.10"
  }
}
```

Create `tsconfig.json` with `strict: true`, `noUncheckedIndexedAccess: true`, `jsx: preserve`, and alias `@/* -> ./src/*`. Configure `vitest.config.ts` for jsdom and `vitest.setup.ts`; import `@testing-library/jest-dom/vitest` and call Testing Library cleanup after each test.

- [ ] **Step 2: Install dependencies and initialize shadcn**

Run:

```powershell
pnpm install --frozen-lockfile=false
pnpm exec shadcn init --defaults --base-color neutral --css-variables
pnpm exec shadcn add button sheet separator
```

Expected: `pnpm-lock.yaml`, `components.json`, and `src/components/ui/*` exist with no interactive prompt.

- [ ] **Step 3: Write the failing smoke test**

```tsx
// tests/smoke.test.tsx
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

it("renders the approved hero promise", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "복잡한 신호를, 실행 가능한 전략으로.",
    }),
  ).toBeInTheDocument();
});
```

- [ ] **Step 4: Run the smoke test and observe the expected failure**

Run: `pnpm test -- tests/smoke.test.tsx`

Expected: FAIL because `src/app/page.tsx` does not yet render the approved heading.

- [ ] **Step 5: Implement the minimal app shell**

```tsx
// src/app/page.tsx
export default function Home() {
  return (
    <main>
      <h1>복잡한 신호를, 실행 가능한 전략으로.</h1>
    </main>
  );
}
```

`src/app/layout.tsx` must set Korean metadata, `lang="ko"`, and import `globals.css`. `globals.css` must define the approved color variables and set `overflow-x: clip`, Pretendard fallbacks, `word-break: keep-all`, and a visible `:focus-visible` outline.

- [ ] **Step 6: Verify the foundation**

Run:

```powershell
pnpm test -- tests/smoke.test.tsx
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit 0; build emits `/`.

- [ ] **Step 7: Commit the foundation**

```powershell
git add package.json pnpm-lock.yaml tsconfig.json next.config.ts eslint.config.mjs postcss.config.mjs vitest.config.ts vitest.setup.ts components.json .gitignore .env.example src tests/smoke.test.tsx
git commit -m "chore: establish portfolio app foundation"
```

---

### Task 2: Supabase Schema, Public Content, and RLS

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/*_initial_portfolio_schema.sql`
- Create: `supabase/migrations/*_initial_public_content.sql`
- Test: `supabase/tests/portfolio_rls.test.sql`
- Create: `src/lib/supabase/database.types.ts`

**Interfaces:**
- Consumes: verified metrics and status labels from the design spec.
- Produces: public read-only tables and generated `Database` types for Task 3.

- [ ] **Step 1: Initialize local Supabase**

Run:

```powershell
pnpm exec supabase init
pnpm exec supabase start
pnpm exec supabase migration new initial_portfolio_schema
pnpm exec supabase migration new initial_public_content
```

Expected: local API and database start; two timestamped migration files exist.

- [ ] **Step 2: Write a failing RLS contract test**

Create `supabase/tests/portfolio_rls.test.sql`:

```sql
begin;
select plan(12);

select has_table('public', 'site_profile');
select has_table('public', 'case_studies');
select has_table('public', 'case_study_metrics');
select has_table('public', 'case_study_sections');
select has_table('public', 'experience_entries');
select has_table('public', 'tags');
select has_table('public', 'case_study_tags');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.case_studies'::regclass),
  'case_studies has RLS enabled'
);
select ok(has_table_privilege('anon', 'public.case_studies', 'select'), 'anon can select');
select ok(not has_table_privilege('anon', 'public.case_studies', 'insert'), 'anon cannot insert');
select results_eq(
  $$select count(*)::bigint from public.case_studies where status = 'published'$$,
  array[6::bigint],
  'six published cases are seeded'
);
select results_eq(
  $$select count(*)::bigint from public.case_study_metrics where verified is true$$,
  array[18::bigint],
  'only eighteen approved metrics are seeded'
);

select * from finish();
rollback;
```

- [ ] **Step 3: Run the database test and observe the expected failure**

Run: `pnpm exec supabase test db`

Expected: FAIL because the tables do not exist.

- [ ] **Step 4: Implement the schema migration**

The schema migration must create the seven tables, identity bigint primary keys, unique slugs, timestamptz columns, FK indexes, `status in ('draft','published','archived')`, and a partial index on published case ordering. Enable RLS on all seven tables. Grant `SELECT` to `anon` and `authenticated`; revoke write privileges. Add parent-aware SELECT policies such as:

```sql
create policy "published cases are public"
on public.case_studies for select to anon, authenticated
using (status = 'published');

create policy "metrics of published cases are public"
on public.case_study_metrics for select to anon, authenticated
using (
  verified is true and exists (
    select 1 from public.case_studies c
    where c.id = case_study_metrics.case_study_id
      and c.status = 'published'
  )
);
```

Repeat the parent-publication rule for sections and join rows. `site_profile` and `experience_entries` require `published is true`. Do not add insert, update, or delete policies.

- [ ] **Step 5: Seed only the approved public content**

The content migration must insert:

- one strategy-first site profile;
- six published cases in the approved order;
- eighteen verified metrics, three per case;
- sections with `challenge`, `evidence`, `insight`, `recommendation`, `execution`, and `limits` kinds;
- public resume entries without addresses, phone numbers, emails, organization-confidential details, or raw respondent data;
- Strategy, People, Product, Legal, Research tags and their joins.

Every numeric metric uses separate `value_text`, `label`, and `source_status` fields. The foreign-talent metric rows must be `21 기업 응답`, `38 유효 후보자 응답`, and `13개국`; they must not contain a summed 59.

- [ ] **Step 6: Reset, test, lint, and generate types**

Run:

```powershell
pnpm exec supabase db reset --local
pnpm exec supabase test db
pnpm exec supabase db lint --local
pnpm exec supabase gen types typescript --local | Set-Content -Encoding utf8 src/lib/supabase/database.types.ts
```

Expected: 12 pgTAP assertions pass; lint reports no schema errors; generated types contain all seven tables.

- [ ] **Step 7: Commit the database contract**

```powershell
git add supabase src/lib/supabase/database.types.ts
git commit -m "feat: add public portfolio database contract"
```

---

### Task 3: Server Environment and Portfolio Repository

**Files:**
- Create: `src/lib/env.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/portfolio/types.ts`
- Create: `src/lib/portfolio/normalize.ts`
- Create: `src/lib/portfolio/repository.ts`
- Test: `tests/portfolio-normalize.test.ts`

**Interfaces:**
- Consumes: `Database` from Task 2.
- Produces: `PortfolioRepository`, `HomePageData`, `CaseStudyDetail`, `ResumeData`, and `createPortfolioRepository()`.

- [ ] **Step 1: Write failing normalization tests**

```ts
// tests/portfolio-normalize.test.ts
import { describe, expect, it } from "vitest";
import { normalizeHomeData } from "@/lib/portfolio/normalize";

describe("normalizeHomeData", () => {
  it("rejects a homepage without a published profile", () => {
    expect(() => normalizeHomeData({ profile: null, cases: [] })).toThrow(
      "Published site profile is required",
    );
  });

  it("keeps only verified metrics and preserves 21 and 38 separately", () => {
    const result = normalizeHomeData({
      profile: { headline: "복잡한 신호를, 실행 가능한 전략으로.", summary: "근거에서 실행까지" },
      cases: [{
        slug: "global-technical-talent",
        title: "Global Technical Talent Strategy",
        summary: "양면 채용 퍼널",
        role: "Strategy · People",
        sort_order: 1,
        metrics: [
          { value_text: "21", label: "기업 응답", source_status: "measured", verified: true, sort_order: 1 },
          { value_text: "38", label: "유효 후보자 응답", source_status: "measured", verified: true, sort_order: 2 },
          { value_text: "59", label: "합산", source_status: "derived", verified: false, sort_order: 3 }
        ],
        tags: []
      }]
    });
    expect(result.cases[0]?.metrics.map((metric) => metric.value)).toEqual(["21", "38"]);
  });
});
```

- [ ] **Step 2: Run the tests and observe the expected failure**

Run: `pnpm test -- tests/portfolio-normalize.test.ts`

Expected: FAIL because the normalization module does not exist.

- [ ] **Step 3: Define the domain types and validator**

`types.ts` must export:

```ts
export type PublicMetric = {
  value: string;
  label: string;
  sourceStatus: "measured" | "documented" | "external" | "proposal" | "research";
};

export type CaseStudySummary = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  metrics: PublicMetric[];
  tags: string[];
};

export type HomePageData = {
  profile: { headline: string; summary: string };
  cases: CaseStudySummary[];
};

export type CaseStudySection = {
  kind: "challenge" | "evidence" | "insight" | "recommendation" | "execution" | "limits";
  title: string;
  body: string;
};

export type CaseStudyDetail = CaseStudySummary & {
  decision: string;
  contribution: string;
  sections: CaseStudySection[];
};

export type ResumeEntry = {
  title: string;
  organization: string;
  period: string;
  summary: string;
};

export type ResumeData = { entries: ResumeEntry[] };
```

`normalizeHomeData()` must validate required fields with Zod, filter `verified !== true`, sort cases and metrics by `sort_order`, and throw the exact missing-profile message used by the test.

- [ ] **Step 4: Implement the server-only client and repository**

`env.ts` parses only `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. `server.ts` begins with `import "server-only"` and creates a Supabase client with disabled session persistence. `repository.ts` exports:

```ts
export interface PortfolioRepository {
  getHomePageData(): Promise<HomePageData>;
  getCaseStudy(slug: string): Promise<CaseStudyDetail | null>;
  getPublishedSlugs(): Promise<string[]>;
  getResumeData(): Promise<ResumeData>;
}

export function createPortfolioRepository(): PortfolioRepository;
```

The homepage query selects published cases, verified metrics, and tag names in one nested request. It selects explicit columns rather than `*` and throws Supabase errors with operation context.

- [ ] **Step 5: Verify the repository layer**

Run:

```powershell
pnpm test -- tests/portfolio-normalize.test.ts
pnpm typecheck
pnpm lint
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit the data layer**

```powershell
git add src/lib tests/portfolio-normalize.test.ts .env.example
git commit -m "feat: add typed portfolio repository"
```

---

### Task 4: Accessible B1.2 Component System

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/site-header.tsx`
- Create: `src/components/portfolio/hero-section.tsx`
- Create: `src/components/portfolio/evidence-rail.tsx`
- Create: `src/components/portfolio/case-study-card.tsx`
- Create: `src/components/portfolio/selected-work.tsx`
- Create: `src/components/portfolio/law-lens-section.tsx`
- Create: `src/components/portfolio/supporting-work.tsx`
- Create: `src/components/portfolio/site-footer.tsx`
- Test: `tests/portfolio-components.test.tsx`

**Interfaces:**
- Consumes: `HomePageData` and `CaseStudySummary` from Task 3.
- Produces: semantic presentational components with no database access and no animation dependency.

- [ ] **Step 1: Write failing accessibility and evidence tests**

```tsx
// tests/portfolio-components.test.tsx
import { render, screen, within } from "@testing-library/react";
import { EvidenceRail } from "@/components/portfolio/evidence-rail";
import { SiteHeader } from "@/components/site-header";

it("renders the approved evidence without an invented total", () => {
  render(<EvidenceRail />);
  const region = screen.getByRole("region", { name: "대표 검증 수치" });
  expect(within(region).getByText("21 + 38")).toBeInTheDocument();
  expect(within(region).queryByText("59")).not.toBeInTheDocument();
  expect(within(region).getByText("57")).toBeInTheDocument();
  expect(within(region).getByText("118")).toBeInTheDocument();
});

it("provides keyboard-reachable navigation", () => {
  render(<SiteHeader />);
  expect(screen.getByRole("navigation", { name: "주요 탐색" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Resume" })).toHaveAttribute("href", "/resume");
});
```

- [ ] **Step 2: Run the component tests and observe the expected failure**

Run: `pnpm test -- tests/portfolio-components.test.tsx`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement tokens and responsive auto-layout**

`globals.css` must implement the approved variables, fluid gutters, `auto-fit/minmax` grids, container queries, Korean wrapping, 1100/900/640px transitions, 44px targets, branded selection, focus-visible styling, and reduced-motion static fallbacks. Use `overflow-x: clip` only as defense; all grid children still require `min-width: 0`.

- [ ] **Step 4: Implement semantic components**

Components accept typed props and render semantic `nav`, `section`, `article`, headings, links, and source-status text. `CaseStudyCard` is a single link to `/work/${slug}` with accessible name `프로젝트 열기: ${title}`. The Hero image container reserves its aspect ratio and uses descriptive alt text. The desktop Header shows Work, Decision Spine, About, and Resume; mobile uses the shadcn Sheet with the same destinations.

- [ ] **Step 5: Verify component behavior**

Run:

```powershell
pnpm test -- tests/portfolio-components.test.tsx
pnpm lint
pnpm typecheck
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit the component system**

```powershell
git add src/app/globals.css src/components tests/portfolio-components.test.tsx
git commit -m "feat: build accessible signal noir components"
```

---

### Task 5: Reveal and Decision Spine Motion

**Files:**
- Create: `src/components/portfolio/motion-policy.ts`
- Create: `src/components/portfolio/reveal.tsx`
- Create: `src/components/portfolio/decision-spine.tsx`
- Test: `tests/motion-policy.test.ts`

**Interfaces:**
- Consumes: section content from the approved spec.
- Produces: `Reveal` for one-time card entry and `DecisionSpine` for the single GSAP scroll sequence.

- [ ] **Step 1: Write the failing motion-policy tests**

```ts
// tests/motion-policy.test.ts
import { describe, expect, it } from "vitest";
import { getMotionPolicy } from "@/components/portfolio/motion-policy";

describe("getMotionPolicy", () => {
  it("disables sticky scrub for reduced motion", () => {
    expect(getMotionPolicy({ width: 1280, reducedMotion: true })).toEqual({
      reveal: false,
      pinDecisionSpine: false,
      scrubDecisionSpine: false,
    });
  });

  it("disables sticky scrub on mobile but keeps one-time reveal", () => {
    expect(getMotionPolicy({ width: 390, reducedMotion: false })).toEqual({
      reveal: true,
      pinDecisionSpine: false,
      scrubDecisionSpine: false,
    });
  });

  it("enables the full sequence on desktop", () => {
    expect(getMotionPolicy({ width: 1280, reducedMotion: false })).toEqual({
      reveal: true,
      pinDecisionSpine: true,
      scrubDecisionSpine: true,
    });
  });
});
```

- [ ] **Step 2: Run the motion test and observe the expected failure**

Run: `pnpm test -- tests/motion-policy.test.ts`

Expected: FAIL because `getMotionPolicy` does not exist.

- [ ] **Step 3: Implement the pure policy**

```ts
export function getMotionPolicy(input: { width: number; reducedMotion: boolean }) {
  if (input.reducedMotion) {
    return { reveal: false, pinDecisionSpine: false, scrubDecisionSpine: false } as const;
  }
  if (input.width < 768) {
    return { reveal: true, pinDecisionSpine: false, scrubDecisionSpine: false } as const;
  }
  return { reveal: true, pinDecisionSpine: true, scrubDecisionSpine: true } as const;
}
```

- [ ] **Step 4: Implement `Reveal` with progressive enhancement**

The server-rendered element begins visible. After hydration, `IntersectionObserver` adds a motion-ready class, then reveals the element once at 20% intersection using `opacity` and `transform`. Disconnect the observer after reveal. Reduced motion bypasses the observer and leaves content visible.

- [ ] **Step 5: Implement `DecisionSpine` with official GSAP React cleanup**

Register ScrollTrigger once. Use `useGSAP({ scope })`, `gsap.matchMedia()`, and a single top-level timeline with `scrollTrigger`. Desktop uses `start: "top top"`, `end: "+=140%"`, `scrub: 0.65`, and pins the outer section while animating child steps. Mobile and reduced-motion media queries set every step to `opacity: 1` and `transform: none`. Revert the matchMedia context on cleanup and call `ScrollTrigger.refresh()` after `document.fonts.ready`.

- [ ] **Step 6: Verify motion policy and build safety**

Run:

```powershell
pnpm test -- tests/motion-policy.test.ts
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit 0; server rendering does not reference `window` outside client components.

- [ ] **Step 7: Commit the motion system**

```powershell
git add src/components/portfolio tests/motion-policy.test.ts
git commit -m "feat: add purposeful portfolio motion"
```

---

### Task 6: Compose Homepage, Case Studies, and Resume

**Files:**
- Create: `src/components/portfolio/home-page.tsx`
- Create: `src/components/portfolio/case-study-page.tsx`
- Create: `src/components/portfolio/resume-page.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/work/[slug]/page.tsx`
- Create: `src/app/resume/page.tsx`
- Test: `tests/page-composition.test.tsx`

**Interfaces:**
- Consumes: repository methods from Task 3 and visual components from Tasks 4–5.
- Produces: `/`, `/work/[slug]`, and `/resume` with `revalidate = 3600`.

- [ ] **Step 1: Write failing page-composition tests**

Test pure presentational page components with explicit fixture data. Assert the exact H1, all three evidence values, six case links, the six required case-detail section headings, and no email/phone/address pattern in the Resume rendering.

```tsx
expect(screen.getByRole("heading", { level: 1, name: "복잡한 신호를, 실행 가능한 전략으로." })).toBeInTheDocument();
expect(screen.getAllByRole("link", { name: /프로젝트 열기:/ })).toHaveLength(6);
expect(screen.queryByText(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the test and observe the expected failure**

Run: `pnpm test -- tests/page-composition.test.tsx`

Expected: FAIL because the page composition components do not exist.

- [ ] **Step 3: Implement the pure page compositions**

`HomePage` composes Header, Hero, Evidence Rail, three lead cards, Decision Spine, Law Lens, three supporting cards, and Footer in the approved order. `CaseStudyPage` renders Executive snapshot, Decision, Context, Evidence, Insight chain, Options, Recommendation, Execution, Outcome and limits, and My contribution. `ResumePage` renders only published experience entries.

- [ ] **Step 4: Wire server routes**

Each route exports `revalidate = 3600`. `/work/[slug]` uses `generateStaticParams()` from `getPublishedSlugs()` and calls `notFound()` for missing or draft cases. `/resume` and `/` call the same repository instance. Add descriptive metadata without inventing outcomes.

- [ ] **Step 5: Verify route composition**

Run:

```powershell
pnpm test -- tests/page-composition.test.tsx
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit 0; build emits `/`, `/resume`, and six `/work/*` paths when local Supabase is running.

- [ ] **Step 6: Commit the routes**

```powershell
git add src/app src/components/portfolio tests/page-composition.test.tsx
git commit -m "feat: compose portfolio routes"
```

---

### Task 7: Safe Content Inventory, Review List, User Actions, and Reusable Skill

**Files:**
- Create: `scripts/check-public-content.mjs`
- Create: `EXPERIENCE_INVENTORY.md`
- Create: `SENSITIVE_REVIEW.txt`
- Create: `TODO.md`
- Create: `skills/strategy-portfolio-workflow/SKILL.md`
- Create: `skills/strategy-portfolio-workflow/references/evidence-rules.md`

**Interfaces:**
- Consumes: audited desktop file paths and verified evidence already approved in the design spec.
- Produces: safe public documentation, a path-only sensitive review queue, and a reusable workflow skill.

- [ ] **Step 1: Write the public-content guard**

Create a Node script that scans `src`, `public`, `supabase/migrations`, and `EXPERIENCE_INVENTORY.md`; rejects email, Korean mobile-number, resident-registration-number, `service_role`, private-key markers, raw sample `40 voices`, and `07 cases`; and allows only explicit test fixtures under `tests`.

Run: `node scripts/check-public-content.mjs`

Expected before documents exist: FAIL with a clear missing-file message.

- [ ] **Step 2: Build `EXPERIENCE_INVENTORY.md` from verified evidence**

Document the six public cases with title, role, duration, team, decision, evidence scope, recommendation, outcome status, limits, and safe source-path references. Do not copy raw responses, names, contact details, IDs, contract text, or application text.

- [ ] **Step 3: Build `SENSITIVE_REVIEW.txt` as a path-only queue**

Each line uses:

```text
[EXCLUDE|REVIEW] absolute-path | category | reason
```

Allowed categories are `identity`, `contract`, `application`, `raw-research`, `personnel`, `credential`, and `uncertain`. The file must not contain extracted content.

- [ ] **Step 4: Build `TODO.md` with user-only actions**

Include: approve public contact method; review the sensitive path queue; approve the generated `/resume` contents; choose hosted Supabase organization and Seoul-near region; authenticate Supabase CLI; set hosted environment variables; approve any Storage upload; verify final public metrics; and trigger Vercel deployment.

- [ ] **Step 5: Create and validate the reusable skill**

Use the installed `skill-creator` and `superpowers:writing-skills` instructions. The skill must route future portfolio work through evidence audit → sensitive exclusion → approved metric selection → strategy-first narrative → responsive/motion checks → Supabase migration → browser verification. It must not contain personal paths, names, credentials, or the user's source material.

- [ ] **Step 6: Run the safety guard**

Run:

```powershell
node scripts/check-public-content.mjs
pnpm test
```

Expected: content guard reports `PASS`; all tests pass.

- [ ] **Step 7: Commit the documentation and skill source**

```powershell
git add scripts EXPERIENCE_INVENTORY.md SENSITIVE_REVIEW.txt TODO.md skills
git commit -m "docs: add safe portfolio evidence workflow"
```

---

### Task 8: Images, Browser QA, Accessibility, Performance, and Hosted Readiness

**Files:**
- Create: `public/images/hero-strategy-signal-f48ea2a6.avif`
- Create: `public/images/hero-strategy-signal-f48ea2a6.webp`
- Modify: `src/components/portfolio/hero-section.tsx`
- Modify: `next.config.ts`
- Modify: `TODO.md`
- Create: `docs/qa/2026-07-19-fidelity-ledger.md`
- Create: `docs/qa/accepted-b1-2.png`
- Create: `docs/qa/rendered-homepage.png`

**Interfaces:**
- Consumes: completed app and approved B1.2 concept.
- Produces: optimized media, verified responsive implementation, and hosted Supabase handoff instructions.

- [ ] **Step 1: Optimize and fingerprint the approved Hero asset**

Convert `.superpowers/brainstorm/173-1784464204/content/hero-strategy-signal.png` to AVIF and WebP. Preserve the 1672×941 ratio, set desktop focal point to 78% 50% and mobile to 74% 50%, and keep each delivered Hero asset under 300KB. Do not modify the source PNG.

- [ ] **Step 2: Configure and verify `next/image`**

Use `fill`, `priority`, descriptive alt, and `sizes="(max-width: 900px) 100vw, 48vw"`. Reserve the container ratio before loading and avoid a color wash over the image.

- [ ] **Step 3: Run the complete automated verification**

Run:

```powershell
pnpm exec supabase db reset --local
pnpm exec supabase test db
pnpm exec supabase db lint --local
node scripts/check-public-content.mjs
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 4: Run browser verification at required viewports**

Start `pnpm dev`. Use the in-app Browser to inspect 1280×720, 900×900, and 390×844. Verify no horizontal overflow, natural Korean line breaks, correct card stacking, exact proof metrics, keyboard navigation, and successful navigation to one lead case and `/resume`.

- [ ] **Step 5: Verify motion and reduced motion**

On desktop, confirm general cards reveal once and Decision Spine pins/scrubs without moving critical text in parallax. Under reduced motion and at 390px, confirm all content is immediately visible, Decision Spine is a static vertical list, and no sticky spacer remains.

- [ ] **Step 6: Compare concept and implementation with `view_image`**

Capture the visual companion as `docs/qa/accepted-b1-2.png` and the implementation at the same width as `docs/qa/rendered-homepage.png`. Use `view_image` on both files. Record at least five checks in `docs/qa/2026-07-19-fidelity-ledger.md`: copy, first-viewport composition, typography, palette, Hero crop, grid/container model, motion, and mobile behavior. Fix every non-intentional mismatch before continuing.

- [ ] **Step 7: Verify hosted Supabase readiness without creating a project automatically**

After the user completes the Supabase login/project actions in `TODO.md`, run:

```powershell
if (-not $env:PORTFOLIO_SUPABASE_PROJECT_REF) { throw 'Set PORTFOLIO_SUPABASE_PROJECT_REF to the user-approved project reference.' }
pnpm exec supabase link --project-ref $env:PORTFOLIO_SUPABASE_PROJECT_REF
pnpm exec supabase db push --dry-run
pnpm exec supabase db push
pnpm exec supabase migration list
pnpm exec supabase gen types typescript --linked | Set-Content -Encoding utf8 src/lib/supabase/database.types.ts
```

Do not guess the project reference or create a paid/external resource without the user's explicit hosted-project approval.

- [ ] **Step 8: Commit the verified release candidate**

```powershell
git add public src next.config.ts TODO.md docs/qa pnpm-lock.yaml
git commit -m "feat: verify strategy portfolio release candidate"
```

---

## Final Completion Check

- [ ] `git status --short` contains no unintended files.
- [ ] `pnpm test`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.
- [ ] Supabase pgTAP and database lint pass.
- [ ] Public-content guard passes.
- [ ] Homepage, one lead case, and Resume work in the browser.
- [ ] 1280px, 900px, 390px, 200% zoom, keyboard, and reduced-motion checks pass.
- [ ] Accepted concept and browser screenshot were compared with `view_image` and the fidelity ledger has no unresolved material mismatch.
- [ ] `TODO.md` clearly separates remaining user-owned hosted Supabase, disclosure, contact, and deployment actions.
