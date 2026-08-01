# CSS Bible Review (2026-08-01)

First accuracy/coverage review of `docs/css/` (21 files, matches
`syllabus/css_bible_syllabus.txt`, 19 sections). Read all 21 files directly and
cross-checked every claim/pattern against real CSS spec behavior rather than
trusting the prose. No prior review pack existed for this bible.

## Bible-level summary

Where content exists, it is technically accurate — no fabricated output or
invalid syntax found (unlike the git bible's [[git-bible-review]] fabricated
hash/wrong tool name). The real problem is **coverage**: several sub-topics the
syllabus itself names explicitly are never addressed in the body text, and
Section 19 (Real-World Workflows & Recipes) is missing most of its promised
recipes. This mirrors the pattern the earlier grok review found across the
other 13 bibles — strong depth where written, silent gaps elsewhere.

## Coverage gaps found

### Section 19 — Real-World Workflows & Recipes (biggest gap)
Syllabus lists **13 recipes** across 5 subsections; only **3 files exist**:

| Subsection | Syllabus promises | Files present |
|---|---|---|
| 19.1 Layout | dashboard shell, card grid auto-fit, holy-grail sticky footer | only dashboard shell (`01`) |
| 19.2 Flexbox | navbar wrap, media object/split-button | **none** |
| 19.3 Grid | subgrid form labels, bento dense auto-placement | **none** |
| 19.4 Debugging | flex won't shrink, sticky won't stick, z-index wars | only flex won't shrink (`02`) |
| 19.5 Progressive enhancement | container-query card, themeable tokens, scroll-driven/view-transition morph | only container-query card + tokens combined (`03`) — scroll-driven/view-transition recipe missing |

Note the syllabus itself already describes card-grid-auto-fit and bento/subgrid
as concepts covered in Sections 5/14 mechanics — but Section 19 is explicitly
scoped as *task-driven recipes*, distinct from those mechanics sections, so
their absence here is a real gap, not duplication.

### Named sub-topics with zero coverage in the body text
- **Masonry** — syllabus 5.1 explicitly lists "Masonry (where supported) /
  progressive enhancement" as a Grid topic; `05-css-grid-deep-dive` never
  mentions masonry.
- **Attribute selector operators** — syllabus 9.1 lists `[attr^=]`, `[attr$=]`,
  `[attr*=]`, and the case-insensitivity flag; `09-selectors-and-pseudo-patterns`
  only shows a bare `[data-state=open]` example, no operators, no `i`/`s` flag.
- **CSS anchor positioning** — syllabus 15.1 title explicitly names
  "Popover API & anchor positioning (CSS anchor)"; `15-forms-ui-controls...`
  covers Popover fully but has no `anchor-name` / `position-anchor` / `anchor()`
  example at all.
- **`@view-transition` at-rule (MPA)** — syllabus 12.1 names
  "View Transitions API (`@view-transition`, `view-transition-name`)";
  `12-transforms-transitions-and-animations` only covers the SPA
  `document.startViewTransition()` JS API, never the declarative at-rule for
  cross-document/MPA transitions.
- **Trig/numeric functions** — syllabus 13.1 calls out
  `sin/cos/tan, abs/sign/round/mod/rem`; `13-custom-properties...` mentions
  them in one passing line with no code example, and omits `sign()`/`rem()`
  entirely.

None of these are wrong where present — they're just absent despite being
named directly in the syllabus, which is the same "stub gap" failure mode
flagged in [[002-agy-react-docs-review]] and [[021-cross-bible-recipe-gaps-survey]]
for other bibles.

## Technical accuracy spot-checks (held up)

Verified against spec/practical behavior — all correct, no changes needed:
- Cascade/layer/origin ordering, `:where()` = 0 specificity, `:is()`/`:not()`/`:has()` take most-specific argument.
- `box-sizing` math, margin collapse boundaries (BFC/flex/grid exclusions), `100vw` including scrollbar gutter.
- Flex algorithm (hypothetical main size → free space → grow/shrink → clamp), `min-width: auto` default trap.
- Grid track sizing functions, `fr` distribution after fixed/min requirements, negative line numbering from explicit grid.
- Stacking context creator list (opacity, transform, filter, isolation, position+z-index, fixed/sticky).
- `fixed` positioning breaking under an ancestor `transform`/`filter`/`perspective`.
- `color-mix(in oklch, …)` syntax, `@property` typed custom properties requirement for animating custom props.
- `content-visibility: auto` + `contain-intrinsic-size` semantics.

## Minor phrasing nit (not a bug, low priority)

`01-cascade-specificity-and-layers.md` and `09-selectors-and-pseudo-patterns.md`
both phrase `:is()` specificity as conditional on "if that branch matches" —
per spec, `:is()`/`:where()` specificity is fixed to the max of its arguments
for the whole selector, not selected per-matched-branch. The practical effect
described is right, but the wording implies the specificity value changes
based on which alternative matched, which it doesn't.

## Fixes applied (2026-08-01, follow-up pass)

All gaps above are now closed:

- **Section 19**: wrote the 9 missing recipe files (file `03` already covered
  2 of the 3 items in 19.5, so 13 promised − 4 already covered = 9, not 10 as
  first estimated) — `04` card-grid auto-fit, `05` holy-grail sticky footer,
  `06` navbar wrap, `07` media object/split-button, `08` subgrid form labels,
  `09` bento dense auto-placement, `10` sticky-won't-stick debug, `11`
  z-index-wars debug, `12` scroll-driven progress + view-transition morph.
- **Masonry**: added to `05-css-grid-deep-dive` (mechanics + `@supports`
  fallback example + pitfall on shipping without one).
- **Attribute selector operators**: added full operator table +
  case-insensitivity/`i`/`s` flag to `09-selectors-and-pseudo-patterns`.
- **CSS anchor positioning**: added `anchor-name`/`position-anchor`/`anchor()`
  section + pitfall to `15-forms-ui-controls-and-interaction`.
- **`@view-transition` at-rule**: added MPA/cross-document coverage +
  example + pitfall to `12-transforms-transitions-and-animations`.
- **Trig/numeric functions**: added full function table (including the
  previously-missing `sign()`/`rem()`) with worked examples and a
  `mod()` vs `rem()` sign pitfall to `13-custom-properties-functions-and-at-rules`.

Two of the new recipe files initially had broken relative cross-links
(`../../` instead of `../` from inside the `19-real-world-workflows-and-recipes/`
folder) — caught by `yarn build`'s broken-link checker and fixed before commit.

`yarn build` is clean (0 broken links) as of this pass.

## Verdict

No fabricated facts or invalid syntax — clean bill of health on accuracy.
All coverage gaps from the initial pass have been fixed (see above). CSS bible
is now feature-complete against its syllabus: 21 → 30 files.
