---
name: review-authentication
description: Existing review/ folder grades (9.56–9.74 everywhere) authenticated as untrusted bulk output; real material bugs found in docs.
metadata:
  type: project
---

# Content review authentication (2026-07-31)

User asked to authenticate existing reviews under `review/` (felt they were not solid),
with **no subagents** — primary agent only. Full write-up:
`review/AUTHENTICATION_REPORT.md`.

## Verdict
**REJECT** existing per-bible READMEs + `OVERALL_SUMMARY.md` + `final_review_agy.md`
as accuracy grades. Useful only as rough inventory.

## Hard evidence
- **210/210** topics scored Accuracy 10/10; worst topic 9.2/10 — impossible for real review
- **Phantom paths**: TypeScript 11/15 wrong; Web Vitals 10/10 wrong
- Score ranges per bible only **0.3–0.6**

## Real doc bugs the reviews missed (Accuracy gate ≤6)
1. Next.js still teaches `fetch` default `force-cache` — wrong for Next 15+  
   (`docs/nextjs/03-rendering-strategies/…`, `04-data-fetching/…`)
2. React `useState` batching sample self-contradictory if run as one handler  
   (`docs/react/01-core-hooks/01-use-state.md`)

## Gaps authenticated
- React syllabus §7 + JS §16: **still no docs** (see memory 016) — reviews correct
- Web Vitals §11–15: reviews said "completely missing" — **false**; merged into folders 08–10
- RTK Query optimistic `onQueryStarted`/`undo`: thin/missing — reviews directionally correct
- TS classes title says Decorators, body has none — reviews graded a phantom path instead

## Content health (honest, not review scores)
Strong draft corpus (~800–1000 w/file typical, pitfalls present). Not "verified accurate."
Do not hand to engineers as sealed reference until Next 15 fetch defaults + batching example fixed.

## Punch list already in content (stale review items)
- React 19 ref cleanup / forwardRef deprecation: **already in** `05-dom-and-refs/…`
- Vite `VITE_` security: **already in** env doc pitfalls

## Saved structure (same layout as prior review/)
All Grok reviews live under `review/grok/`:
- `OVERALL_SUMMARY.md`, `final_review.md`, `AUTHENTICATION_REPORT.md`, `README.md`
- Per-bible `review/grok/<bible>/README.md` for all 14 bibles
- Uses real paths; `[FULL]` vs `[PARTIAL]` tags; honest ~7.1–8.3 averages
- Prior non-grok `review/` pack left untouched for comparison
