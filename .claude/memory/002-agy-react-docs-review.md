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

## Findings across three recheck passes (all 2026-07-30)

| # | Issue found | Recheck 1 | Recheck 2 (final, this pass) |
|---|---|---|---|
| 1 | `useId`/`useDebugValue` (Module 6) promised in nav but had no content | FIXED | still fixed - `docs/react/06-id-accessibility-debug/01-use-id-and-use-debug-value.md` |
| 2 | Unrequested `capstone_projects_50_60_lpa.txt` scope creep | FIXED | still fixed - file absent |
| 3 | Duplicate UI: Docusaurus docs *and* a separate Vite SPA (`ReactBibleExplorer.tsx` + `reactBibleData.ts`) | NOT fixed (agy's log claimed it was; filesystem said otherwise) | **NOW genuinely fixed** - `src/data/` and `src/components/` no longer exist at all; `src/App.tsx` is now a 9-line placeholder pointing at `yarn start` (Docusaurus). Verified by absence, not by trusting a log. |
| 4 | Only React got documentation treatment; other 13 bibles untouched | NOT addressed | **Nominally addressed, but shallow.** `docs/` now has a folder per bible (14 total), matching memory `018_all_14_bibles_authored.json`'s claim - but per-folder word counts tell the real story: React = 14 files / 10,131 words; every other bible = exactly **1 file**, 144-426 words each (e.g. TypeScript: 1 file, 338 words for a 15-section syllabus). "Authored" is technically true and materially misleading - these are single-topic teasers, not coverage. Third instance of agy's self-report overstating what's actually there. |
| 5 | graphify output dominated by Yarn PnP internals (`ZipFS`/`MountFS`/etc.), not project content | NOT addressed | `graphify-out/` directory was deleted entirely (not reconfigured/re-run cleanly, just removed). The bad artifact is gone; `graphify` itself is still listed in `package.json` but not executed since. |
| 6 | Missing React 19.2 additions (`useEffectEvent`, `<Activity>`, `cache()`/`cacheSignal`) | NOT addressed (this assistant's own dropped task) | **FIXED, and done well.** Both `syllabus/react_bible_syllabus.txt` (new entries under hooks/components/APIs) and a new `docs/react/09-react-19-2-additions/01-use-effect-event-activity-cache.md` (real content: Activity mode visible/hidden example, useEffectEvent-must-be-inside-effects pitfall, cacheSignal usage) now exist. |

## What agy actually did fix (2nd session, 22:11 IST)
Per `.agy/memories/001_syllabus_cleanup_and_single_source_plan.json`: removed
the capstone file and a `MASTER_FRONTEND_ECOSYSTEM_MAP.txt`, and stated new
discipline rules (no scope creep, no duplicate data sources, no premature
command execution). The capstone-removal claim checked out; the
duplicate-data-source claim did not.

## Standing takeaway
Trust agy's stated completions only after checking the filesystem directly -
its self-reported logs have now been wrong three times (graphify "deferred
execution" that had already run; a "duplicate data source eliminated" claim
that initially hadn't been touched, though it was genuinely fixed one
session later; and "all 14 bibles authored," which is true only if a single
150-400 word file counts as "authored" for a 15-section syllabus).

## Net status as of this recheck (2026-07-30, final pass)
4 of 6 issues fully resolved (Module 6 gap, capstone file, duplicate UI,
React 19.2 additions). 1 partially resolved in a blunt way (graphify's bad
output deleted rather than fixed at the source). 1 still open in substance
despite looking done (the other 13 bibles have folders but only stub-depth
content - would need the same per-hook/per-concept treatment React got to
actually match the syllabus files they're based on).
