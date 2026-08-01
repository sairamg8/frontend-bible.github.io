---
name: css-bible-review
description: CSS bible (docs/css/) reviewed and fixed - no fabricated facts found; the 9 missing Section 19 recipes and 5 syllabus-named sub-topics with zero coverage (masonry, attribute selector operators, anchor positioning, @view-transition, trig functions) were all written. 21 -> 30 files, yarn build clean. Full findings in review/css/README.md.
metadata:
  type: project
---

Reviewed `docs/css/` (21 files) against `syllabus/css_bible_syllabus.txt` (19
sections) on 2026-08-01, per user request. Unlike [[019-git-bible-review]],
found no fabricated output or invalid syntax - all spot-checked technical
claims (cascade/specificity, box model, flex algorithm, grid tracks, stacking
contexts, color-mix/@property, content-visibility) held up. The gap was
coverage, not correctness - and the user asked for it to be fixed in the same
session.

## Fixes applied
- 9 new recipe files in `19-real-world-workflows-and-recipes/` (04-12),
  closing Section 19 from 3/13 to 13/13 syllabus items covered.
- 5 content additions to existing files for syllabus-named sub-topics that
  had zero body coverage: masonry (05-grid), attribute selector operators
  (09-selectors), CSS anchor positioning (15-forms), `@view-transition`
  at-rule/MPA (12-motion), trig/numeric functions incl. `sign()`/`rem()`
  (13-custom-properties).
- Caught and fixed 2 broken relative links (`../../` vs `../`) via
  `yarn build`'s link checker before considering the pass done.

Full write-up (gap table, fix list, spot-check results) lives in
`review/css/README.md`, not just this memory file - see [[review-folder-convention]].

**Why:** User asked for a CSS docs review, then asked to fix what was found -
this is the first review+fix pass for this bible (added after
[[017-review-authentication]] / [[023-css-bible-syllabus]], no prior pack).

**How to apply:** CSS bible is now feature-complete against its syllabus.
Don't re-review from scratch on a future request - read `review/css/README.md`
first to see what's already been checked and fixed.
