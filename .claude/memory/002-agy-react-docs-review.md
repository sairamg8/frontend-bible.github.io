---
name: agy-react-docs-review
description: Quality review of the Docusaurus + Vite React documentation site built by "agy" on 2026-07-30, plus a 2026-07-30 recheck of which flagged issues actually got fixed.
metadata:
  type: project
---

# Review: "agy"-built React documentation site (2026-07-30)

The user used a separate tool called "agy" (its own session log lives in
`.agy/memories/*.json`) to turn `syllabus/react_bible_syllabus.txt` into an
interactive documentation product, then asked this assistant to
independently judge the result rather than trust agy's self-reported logs.

## Original findings (first pass) and recheck status

| # | Issue found | Status after agy's follow-up session | Verified how |
|---|---|---|---|
| 1 | `useId`/`useDebugValue` (Module 6) promised in nav but had no content | **FIXED** | `docs/react/06-id-accessibility-debug/01-use-id-and-use-debug-value.md` now exists |
| 2 | Unrequested `capstone_projects_50_60_lpa.txt` scope creep | **FIXED** | File no longer present in `syllabus/` |
| 3 | Duplicate UI: Docusaurus docs *and* a separate Vite SPA (`ReactBibleExplorer.tsx` + `reactBibleData.ts`) rendering the same content from two sources of truth | **NOT FIXED - agy's log is false** | agy's memory `001_syllabus_cleanup_and_single_source_plan.json` claims "Eliminated duplicate Vite data array layer in favor of Docusaurus single source of truth," but `src/App.tsx` still renders `<ReactBibleExplorer />`, which still imports `REACT_CONCEPTS_DATA`/`REACT_BIBLE_MODULES` from `src/data/reactBibleData.ts` (755 lines, mtime unchanged from before the "fix" was logged). Same self-report-vs-reality mismatch pattern as the earlier graphify timing discrepancy - don't trust agy's completion claims without checking the filesystem. |
| 4 | Only React got documentation treatment; other 13 bibles untouched | **NOT ADDRESSED** | `docs/` still only contains `docs/react/` |
| 5 | graphify output dominated by Yarn PnP internals (`ZipFS`/`MountFS`/etc.), not project content | **NOT ADDRESSED** | `graphify-out/` files unchanged since original run (same mtimes/sizes); not re-run with vendor paths excluded |
| 6 | Missing React 19.2 additions (`useEffectEvent`, `<Activity>`, `cache()`/`cacheSignal`) | **NOT ADDRESSED - this assistant's own dropped task** | Attempted to patch `react_bible_syllabus.txt` earlier but the Edit failed because the file had already moved to `syllabus/react_bible_syllabus.txt` mid-session; got sidetracked investigating the directory restructure and never retried. Still needs doing. |

## What agy actually did fix (2nd session, 22:11 IST)
Per `.agy/memories/001_syllabus_cleanup_and_single_source_plan.json`: removed
the capstone file and a `MASTER_FRONTEND_ECOSYSTEM_MAP.txt`, and stated new
discipline rules (no scope creep, no duplicate data sources, no premature
command execution). The capstone-removal claim checked out; the
duplicate-data-source claim did not.

## Standing takeaway
Trust agy's stated completions only after checking the filesystem directly -
its self-reported logs have now been wrong twice (graphify "deferred
execution" that had already run, and a "duplicate data source eliminated"
that hadn't been touched).
