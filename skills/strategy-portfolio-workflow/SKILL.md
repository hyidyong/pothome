---
name: strategy-portfolio-workflow
description: Use when building or revising a strategy portfolio from mixed-source evidence where public claims, sensitive material, responsive motion, or deployable content architecture require strict verification.
---

# Strategy Portfolio Workflow

## Core principle

Publish a claim only when its source, population, status, approval, and limit remain traceable. Treat a polished portfolio as a verified decision artifact, not a claim amplifier.

## Workflow

1. **Audit evidence.** Build a ledger of claims, populations, denominators, source paths, validity states, and limits. When claims conflict, read [references/evidence-rules.md](references/evidence-rules.md) completely and block publication until resolved.
2. **Exclude sensitive material.** Create a path-only review queue. Keep identity, contracts, applications, raw research rows, personnel records, contact details, and credentials out of public content and databases.
3. **Approve claims.** Select only approved public aggregates. Keep different populations separate, omit raw invalid counts, and prefer metrics that explain scope without implying outcomes. Gate all contact methods on explicit approval.
4. **Write the narrative.** Structure each case as decision → constraints → evidence → insight → options → recommendation → execution → outcome status → limits. Correct domain-mismatched copy before publication.
5. **Design responsive motion.** Use auto-layout, visible server-rendered content, one-time reveals, and motion that explains decisions. Provide a static reduced-motion mode. Verify narrow mobile width, 200% zoom, keyboard access, and no horizontal overflow.
6. **Persist safely.** Use migrations, row-level security, explicit public read grants, and server-only environment access. Keep deployable content in Supabase; do not substitute tracked runtime JSON or browser storage.
7. **Verify before claiming completion.** Run content guards, tests, lint, type checks, secret scans, and production builds. Inspect the rendered site in a browser at desktop, the narrowest supported mobile viewport, 200% zoom, and reduced motion. Report only checks actually run.

## Quick reference

| Question                            | Required answer                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Can two samples be combined?        | Only when they share one defined population and aggregation is approved; otherwise show them separately. |
| Can a raw count explain exclusions? | Keep it internal unless separately approved for publication.                                             |
| Does an output prove impact?        | No. Label output, proposal, research, adoption, and outcome states distinctly.                           |
| Can contact be added?               | Only after the owner approves the method and public value.                                               |
| Is the build complete?              | Only with current automated and browser evidence.                                                        |

## Common mistakes

- Turning separate samples into one impressive total.
- Publishing raw rows instead of the valid sample.
- Choosing a vivid but unapproved headline metric.
- Recasting a proposal or prototype as adoption or business impact.
- Shipping mismatched domain copy because the numbers are correct.
- Using local files or browser storage as a deployable content source.
- Treating desktop tests as proof of responsive or reduced-motion behavior.
