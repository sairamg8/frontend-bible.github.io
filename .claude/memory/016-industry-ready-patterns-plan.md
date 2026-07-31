---
name: industry-ready-patterns-plan
description: Syllabus-only checkpoint for a new "industry-ready patterns" section added to both the JavaScript and React bibles - docs/ content authoring is deferred, pick up here next.
metadata:
  type: project
---

# Industry-ready patterns - syllabus done, docs/ still pending

User asked (2026-07-31 session) for a list of "industry ready" JS/React
concept snippets (debounce, memoization, chunking incoming data, etc.),
to be listed and saved into the syllabus first, with actual doc content
deferred to a later session. Committed as `db17520`.

## What's done
- `syllabus/javascript_bible_syllabus.txt`: new SECTION 16 "INDUSTRY-READY
  PATTERNS & UTILITY SNIPPETS", subsections 16.1-16.8 (25 items total):
  timing/control-flow utilities, caching/memoization, data transformation,
  functional composition, async concurrency control, streaming/chunked
  data processing, from-scratch design patterns, rate limiting.
- `syllabus/react_bible_syllabus.txt`: new SECTION 7 "INDUSTRY-READY
  CUSTOM HOOKS & PATTERNS", subsections 7.1-7.7 (~20 items total):
  timing/input hooks, browser/DOM hooks, state/storage hooks, data
  fetching/async hooks, performance patterns, composition patterns,
  reliability patterns.
- Both sections follow the existing bible-syllabus format convention
  exactly (80-dash separators, numbered `SECTION N:` + `N.M` subsections,
  one-line item descriptions) - see [[001-bible-syllabus-inventory]].

## Not yet done (pick up here next)
- No `docs/` folders/files exist yet for either new section. Per the
  project's established 1:1 syllabus-section-to-docs-folder convention
  (see [005](005-redux-toolkit-expansion.md) through
  [014](014-frontend-architecture-expansion.md) for the pattern used
  across every other bible expansion), this would become:
  - `docs/javascript/16-industry-ready-patterns/` (8 files, one per 16.1-16.8)
  - `docs/react/07-industry-ready-hooks-and-patterns/` (note: React's
    docs/ folder numbering does NOT match syllabus SECTION numbers 1:1
    already - e.g. syllabus SECTION 6 covers resource-loading APIs but
    `docs/react/07-react-dom-apis/` covers client/server APIs. Check the
    existing docs/react/ folder list and pick the next free number, likely
    `10-`, rather than assuming `07-`.)
- Each doc file should follow the depth/format already established for
  its bible: React bible content needs the mandatory 4-section structure
  (Concept & Fiber Mechanics / Real-World Scenario / Production Code /
  Edge Cases & Pitfalls per the syllabus's own DOCUMENTATION STANDARD);
  JavaScript bible content follows the plainer format used in its other
  14 sections (working code + explanation + pitfalls, no fixed 4-section
  template required).
- After authoring, run `yarn build` to verify no MDX/link breakage before
  considering it done (standing practice this whole project, see
  [004](004-site-architecture-fixes.md)).
