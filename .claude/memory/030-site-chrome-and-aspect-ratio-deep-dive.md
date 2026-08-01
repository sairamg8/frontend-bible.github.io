---
name: site-chrome-and-aspect-ratio-deep-dive
description: Removed Docusaurus footer, made docs sidebar sticky/fixed on scroll, added aspect-ratio+object-fit deep dive and scroll-snap carousel recipe to CSS bible.
metadata:
  type: project
---

Three changes in one session (2026-08-01):

1. **Footer removed**: deleted the `footer` block from `themeConfig` in
   `docusaurus.config.ts`. Docusaurus renders no footer when the key is
   absent — confirmed via `yarn build` + grep on the built HTML.

2. **Sidebar made sticky**: added `.theme-doc-sidebar-container` /
   `.theme-doc-sidebar-menu` rules to `src/css/custom.css` (`position:
   sticky; top: var(--ifm-navbar-height); height: calc(100vh -
   var(--ifm-navbar-height)); overflow-y: auto`) so the sidebar stays
   pinned to the viewport instead of scrolling away with long doc pages.
   Confirmed compiled into build CSS.

3. **CSS bible content gap closed**: `aspect-ratio` previously got only 2
   sentences (in `docs/css/02-box-model-and-sizing/01-...md`) versus a
   full derivation for `clamp()` elsewhere in the bible. Added:
   - `docs/css/02-box-model-and-sizing/02-aspect-ratio-object-fit-and-intrinsic-sizing.md`
     — full 4-section deep dive on `aspect-ratio` (sizing-algorithm
     mechanics, replaced vs non-replaced elements, HTML width/height attr
     interaction) + `object-fit`/`object-position` (its natural pairing,
     previously used in examples but never explained in prose).
   - `docs/css/19-real-world-workflows-and-recipes/13-scroll-snap-carousel.md`
     — new recipe; `scroll-snap` was completely absent from the bible and
     syllabus despite being a major no-JS-library carousel pattern.
   - Syllabus (`syllabus/css_bible_syllabus.txt`) updated: SECTION 2.1
     aspect-ratio bullet now mentions object-fit + "[Deep dive]"; SECTION
     19.1 gained the scroll-snap carousel recipe line.
   - Old 2-sentence aspect-ratio blurb in file 01 trimmed to a cross-link
     rather than duplicated content.

`yarn build` clean after all three changes (no broken-link warnings).

**Why**: User asked to fix persistent site chrome (footer/sidebar) and
specifically flagged `aspect-ratio` as under-explained relative to other
"major" CSS concepts already in the bible (compared to the existing
`clamp()` treatment, which has a full interpolation-math derivation).

**How to apply**: If asked for more "major concept" deep dives at this
depth, other candidates surveyed but found *already* well-covered:
`:has()`, `clamp()`/`min()`/`max()`, native CSS nesting, `backdrop-filter`,
`content-visibility`. Don't re-add those without checking coverage first —
grep the relevant `docs/css/*/​*.md` file before assuming a gap exists.
