# Storybook Bible Review — §17 Theming (Colors & Fonts) Addition (2026-08-01)

Scoped review of the new Storybook §17 content (added outside this assistant's
prior sessions — see [[024-storybook-colors-fonts]]), not a full re-review of
the whole 16-section Storybook bible. Requested after the CSS bible review, as
a "look at what else changed and fix if needed" follow-up.

## Files reviewed
- `docs/storybook/17-theming-colors-and-fonts/01-global-colors-themes-and-tokens.md`
- `docs/storybook/17-theming-colors-and-fonts/02-custom-fonts-and-typography.md`
- `docs/storybook/16-real-world-workflows-and-recipes/02-wiring-colors-and-custom-fonts.md`
- Cross-link additions in `10-composition-and-design-systems/01-storybook-as-a-design-system-hub.md`
  and `16-real-world-workflows-and-recipes/01-bootstrapping-into-an-existing-app.md`
- `syllabus/storybook_bible_syllabus.txt` (new §16.1 recipe line + full §17)

## What was checked
- **Link integrity**: `yarn build` — 0 broken links (all `../` depths correct,
  unlike the CSS recipes' first draft in [[026-css-bible-review]] which had
  two `../../` mistakes).
- **Syllabus coverage**: every §17.1/§17.2 bullet point has matching content —
  iframe token import, toolbar→decorator→`data-theme`, backgrounds-addon vs
  real theme, token doc stories, Tailwind/CSS-Modules bridge, `staticDirs` vs
  bundler `@font-face`, import order, `next/font` bridge, typography specimens
  + `document.fonts.ready`, preload & licensing — nothing named but uncovered,
  unlike the gaps found in the CSS bible.
- **Technical spot-checks** (all held up, no fabrication found):
  - Storybook per-story `globals` override (`globals: { theme: "dark" }` on a
    story export) — real feature, Storybook 7.1+.
  - `@storybook/test` package for `expect`/`within` — correct, replaces the
    older `@storybook/jest` + `@storybook/testing-library` split as of
    Storybook 8.
  - Fraunces variable font's `SOFT`/`WONK` custom axes in the
    `font-variation-settings` example — real axes specific to that typeface,
    not a generic/wrong guess.
  - `next/font`'s `.variable` → CSS custom property bridge pattern, applied
    via a class on `<html>` — matches actual Next.js API.
  - `document.fonts.ready` (FontFaceSet) usage in interaction tests — correct
    Web API.
  - Tailwind `darkMode: ["selector", '[data-theme="dark"]']` — correct v3.4+/v4
    selector-strategy syntax.
  - Inter's Latin `unicode-range` value — matches the real Google Fonts output.

## Verdict

No issues found — no fixes applied. This addition matches the quality bar of
the rest of the bible: accurate, and syllabus-complete for the section it adds.

---

# Storybook Bible Review — §3.2/§4–7 Panel Deep Dives (2026-08-01)

Senior-level technical review of the new Controls/Actions/Interactions/Visual
tests/Accessibility panel content (see [[031-storybook-panels-deep-dive]]),
requested directly by the user ("review with senior technical level").

## Files reviewed
- `docs/storybook/03-addons-ecosystem/02-actions-panel-in-depth.md` (new)
- `docs/storybook/04-controls-and-args/01-dynamic-prop-editing.md`
- `docs/storybook/05-interaction-testing/01-play-functions.md`
- `docs/storybook/06-visual-testing/01-chromatic-integration.md`
- `docs/storybook/07-accessibility-testing/01-a11y-addon.md`
- Cross-link additions in `03-addons-ecosystem/01-essential-addons.md`,
  `10-composition-and-design-systems/01-storybook-as-a-design-system-hub.md`,
  `13-build-and-configuration/01-storybook-main.md`,
  `16-real-world-workflows-and-recipes/01-bootstrapping-into-an-existing-app.md`
- `syllabus/storybook_bible_syllabus.txt` (§3.2, §4.1, §5.1, §6.1, §7.1 additions)

## What was checked
- **Structural/pedagogical quality**: mechanics diagrams, UI reference
  tables, production config, real-world scenario, senior pitfalls,
  checklist, cross-panel relationship table — consistently applied across
  all 5 files. This is genuinely strong doc architecture, not boilerplate.
- **Technical accuracy of concepts**: argTypes inference/composition,
  control-type reference, conditional controls (`if`)/`mapping`, TurboSnap's
  dependency-graph diffing, Chromatic `modes`/viewports/`ignoreSelectors`,
  axe-core violation/pass/incomplete taxonomy, a11y test `todo`/`error`/`off`
  modes — all directionally correct, no fabricated APIs found.
- **Current-version accuracy** (Aug 2026: Storybook 10.0 has been stable
  since Oct 2025; Storybook 9.0, released mid-2025, already obsoleted the
  patterns below) — verified via Storybook's own docs/blog and GitHub
  migration-guide issues, not assumed from training knowledge.

## Findings

### 1. [Real, most important] Version-currency gap — content teaches a Storybook 7/8-era package boundary that's 1–2 major versions behind current stable
- `@storybook/addon-essentials` and `@storybook/addon-interactions` are shown
  as packages to `addons: [...]`-register in `main.ts`
  (`07-accessibility-testing/01-a11y-addon.md` §3.1;
  `03-addons-ecosystem/01-essential-addons.md` throughout). As of Storybook
  9.0 both packages are empty stubs — Controls/Actions/Backgrounds/Viewport/
  Interactions/Docs moved into core and are no longer registered explicitly.
  A reader following this file against a current `create storybook@latest`
  project adds two dead dependencies and a stale addons array.
- The CI sections for Interactions and Accessibility present
  `@storybook/test-runner` + `axe-playwright` as *the* CI mechanism with no
  mention of "Storybook Test" (the Vitest-based integration,
  `@storybook/addon-vitest`), which ships in the recommended install for new
  Storybook 9/10 projects and is what Storybook's own docs now recommend
  over test-runner for Vite-powered projects — it unifies interaction +
  a11y + coverage into one Vitest run tied to the Testing widget. Not wrong
  (test-runner still works), but it teaches the legacy path as if it were
  the only one and omits the current default onboarding path.
- Every `play` example imports `fn/expect/userEvent/within/waitFor` from
  `@storybook/test`. Still functional, but current official examples use
  the unscoped `storybook/test`; worth a one-line note so readers aren't
  confused when they see the new name elsewhere.
- None of the 4 files showing `play` functions mention that the play
  context now exposes `canvas` (pre-scoped) and `userEvent` directly
  (`play: async ({ canvas, userEvent }) => …`) — the primary pattern in
  current official docs. Every example here manually does
  `const canvas = within(canvasElement)` instead. Not wrong, just the more
  verbose alternative presented as the only way.

  This is the one fix worth prioritizing: the rest of the content is high
  quality, but staleness on the exact package/registration surface is what
  erodes trust fastest once a reader diffs it against a real, current
  Storybook install.

### 2. [Minor] `04-controls-and-args/01-dynamic-prop-editing.md` §4.6 mixes API generations in one snippet
Destructures `userEvent` from the play context (modern) but still manually
calls `within(canvasElement)` (older, and `within` isn't imported in that
isolated snippet). Not a functional bug given the file's earlier imports,
but worth aligning once finding #1 is addressed — pick one generation of
the pattern consistently.

### 3. [Minor, same root cause as #1] `03-addons-ecosystem/02-actions-panel-in-depth.md` §3.2
`import { action } from "@storybook/addon-actions"` — `action()` itself is
still real, but `@storybook/addon-actions` is one of the packages absorbed
into core alongside essentials. Same package-name drift as finding #1, not
a new class of issue.

### No issues found in
Mechanics descriptions, control-type reference, TurboSnap explanation, axe
taxonomy, and Chromatic modes/viewports semantics — all accurate to how the
tools actually behave, independent of the package-naming churn above.

## Verdict

Content/pedagogy quality: strong, matches the bar of the rest of the bible.
Currency: dated by ~1–2 major versions on the exact package/import surface
(addon-essentials, addon-interactions, `@storybook/test`, `within(canvasElement)`
vs context `canvas`). Recommend a short version-note callout (e.g. in
`essential-addons.md`, already the hub linked from all 5 files) rather than
rewriting every example, since `@storybook/test` and manual `within()` still
work today — they're just no longer what a reader will see in a fresh
Storybook 9/10 project.

## Fixes applied (2026-08-01)

All 3 findings addressed via version-note callouts + targeted snippet fixes
(no wholesale rewrites — existing `@storybook/test`/`within()` examples are
still correct, just no longer the only/primary path):

- **`03-addons-ecosystem/01-essential-addons.md`**: added a version-note
  admonition (Storybook 9 core-merge, current stable 10); relabeled the
  bundling diagram; swapped the `action()`/`@storybook/addon-actions`
  code example and Pitfall 2 to `fn()` from `@storybook/test`.
- **`03-addons-ecosystem/02-actions-panel-in-depth.md`**: added version
  note; fixed §3.2's `action()` import to `storybook/actions` (the old
  `@storybook/addon-actions` package throws on Storybook 9+); updated the
  `fn()` comparison table row.
- **`04-controls-and-args/01-dynamic-prop-editing.md`**: §4.6 now
  destructures `canvas` (not `within(canvasElement)`) alongside `userEvent`
  from the play context, with a note pointing to both styles.
- **`05-interaction-testing/01-play-functions.md`**: added version note
  (interactions now core; `storybook/test` alias; context `canvas`/
  `userEvent` as the primary modern pattern, explicit imports as the
  still-valid alternative used in this file's examples); CI diagram and
  checklist now name the Vitest-based "Storybook Test" integration
  alongside test-runner.
- **`07-accessibility-testing/01-a11y-addon.md`**: added version note
  (a11y addon is the one panel here that's *still* a separate install —
  contrast with essentials/interactions, which aren't); §3.1's `main.ts`
  snippet drops the two stale entries; §4 now names both CI paths (Vitest
  addon vs test-runner) with guidance on when to use which; §4.2 rewritten
  with a concrete `a11y.test` config example instead of vague
  "version-dependent" hand-waving.

`yarn build` clean after all edits (0 broken links, MDX valid).
