---
name: cross-bible-recipe-gaps-survey
description: Survey of all 14 non-git bibles for git-recipes-chapter-style gaps (cross-topic "how do I do X end-to-end" tasks not owned by any single file) - 12 real gaps found, working through them one at a time.
metadata:
  type: project
---

# Cross-bible real-world recipe gaps (2026-07-31)

Follow-up to [[git-recipes-chapter]]: user asked whether other bibles have the same kind of
gap (a common practical task spanning multiple sections, owned by none of them - like git
having no "connect a local project to a remote" doc despite covering fetch/pull/push
extensively). Read all 14 non-git syllabi fresh and reasoned about likely cross-topic gaps
(did not read every doc file - this is a syllabus-structure-level survey, not a full content
audit like [[review-authentication]] or [[git-bible-review]]).

## No gap - already covered by design

- **`frontend-architecture`**: this bible already IS the scenario/decisions bible (see its own
  syllabus header: "unlike the other bibles, which catalog APIs, this one catalogs DECISIONS").
  No separate recipes chapter needed.
- **`redux-toolkit`** §13 (`docs/redux-toolkit/13-migration/01-from-classic-redux.md`, 850 words)
  already exists as a migration-scenario doc. Lower priority than the list below, not a hard gap.

## Real gaps found (working through these one at a time, git-recipes-chapter style: sandbox/verify-first where commands are involved, then write, then `yarn build`)

Status key: ☐ not started · ▶ in progress · ✅ done

1. ✅ **Next.js** - Migrating Pages Router -> App Router end-to-end. Added syllabus SECTION 16 +
   `docs/nextjs/16-migration-recipes/01-pages-router-to-app-router.md`. Cross-checked every
   mapping (getStaticProps/getServerSideProps/_app/_document -> Server Components/layout.tsx,
   fallback->dynamicParams, redirect()->permanentRedirect()) against this project's own already-
   verified `01-routing-fundamentals` and `11-legacy-pages-router` files for consistency (Next.js
   itself isn't installed locally, so no live sandbox test this time — relied on cross-referencing
   + declining to assert an uncertain HTTP status-code specific in the redirect() pitfall rather
   than risk a wrong number). Also fixed the syllabus's OWN stale `force-cache (default)` line
   (same bug as [[punch-list-correctness-fixes]] item 1, missed in the syllabus back then).
   Build-verified.
2. ✅ **Vite** - Migrating an existing CRA project to Vite. Added syllabus SECTION 16 +
   `docs/vite/16-migration-recipes/01-cra-to-vite-migration.md`. Cross-checked against this
   project's own `07-env-variables-and-modes` and `12-path-resolution-and-aliases` docs for
   terminology consistency. Vite/CRA not installed locally so no live sandbox test - relied on
   stable, long-established migration facts (index.html relocation, VITE_ prefix, no built-in
   `process` global, SVG import differences). Build-verified.
3. ✅ **TypeScript** - Incremental JS->TS adoption. Added syllabus SECTION 16 +
   `docs/typescript/16-migration-recipes/01-incremental-js-to-ts-adoption.md`. TypeScript IS
   installed locally, so this one got REAL `tsc` sandbox verification (not cross-reference-only
   like Next.js/Vite): confirmed exact TS7006 implicit-any error text, confirmed JSDoc bridge-
   typing is genuinely enforced not decorative, confirmed per-file `// @ts-check` works
   independent of global `checkJs`, confirmed a bare renamed `.ts` file compiles clean under
   `strict:false` then immediately errors under `strict:true` with zero other changes. Caught my
   own guessed error CODE AND MESSAGE being wrong pre-publish (guessed TS2345/"Argument of
   type..."; actual is TS2322/"Type 'string' is not assignable to type 'number'." on the array
   literal) - fixed before it ever got read. Build-verified.
4. ✅ **React** - Diagnosing re-render bugs (too-often AND won't-re-render, as one unified
   decision tree, not two separate docs). Added syllabus SECTION 8 (React's own section-7 slot
   was already taken by the deferred industry-hooks gap from memory 016) +
   `docs/react/10-real-world-workflows-and-recipes/01-diagnosing-re-render-bugs.md`. Cross-
   checked against this project's own `02-performance-hooks` (memo/Object.is mechanics) and
   `04-context-and-external-stores` (propagateContextChange bypasses memo entirely) docs - no
   live render harness in this project (no jsdom/test-renderer installed), so relied on
   cross-referencing established React reconciliation semantics rather than a sandbox test,
   same approach as Next.js/Vite. Build-verified.

   NAMING NOTE: used "REAL-WORLD WORKFLOWS & RECIPES" (matching the git bible's own SECTION 7
   title) instead of "MIGRATION RECIPES" (used for Next.js/Vite/TS) since this and most of the
   remaining gaps are diagnostic/setup tasks, not migrations - "MIGRATION RECIPES" doesn't fit.
   Not going back to rename the 3 already-done ones (churn not worth it, they WERE genuinely
   migrations) - use "REAL-WORLD WORKFLOWS & RECIPES" for everything remaining in this list.
5. ✅ **Playwright** - Diagnosing CI-only flaky tests. Added syllabus SECTION 16 +
   `docs/playwright/16-real-world-workflows-and-recipes/01-diagnosing-flaky-ci-tests.md`.
   Cross-checked against `10-debugging-tools` (trace capture config) and `05-auto-waiting-and-
   assertions` (why manual waits cause exactly this bug class) for consistency. Playwright not
   installed locally, no live browser test - relied on well-established CDP/Playwright
   flakiness-diagnosis knowledge (CPU throttling via `Emulation.setCPUThrottlingRate`, worker
   isolation, trace-first diagnosis). Build-verified.
6. ✅ **Jest & RTL** - Testing setup from zero. Added syllabus SECTION 16 +
   `docs/jest-rtl/16-real-world-workflows-and-recipes/01-testing-setup-from-zero.md`. BONUS
   FIND while cross-referencing `06-coverage-and-configuration` for grounding: that EXISTING
   doc (and the syllabus) used `setupFilesAfterEach` as a Jest config key - not real; Jest's
   actual key is `setupFilesAfterEnv` (no "AfterEach" config key exists in Jest's schema at
   all, likely confused with the per-test `afterEach()` lifecycle hook). Fixed in both the
   existing doc (3 occurrences) and the syllabus, and used the correct name throughout the new
   recipe. Build-verified.
7. ✅ **Web Vitals** - Diagnosing a production LCP/INP regression end-to-end. Added syllabus
   SECTION 16 + `docs/web-vitals-performance/16-real-world-workflows-and-recipes/01-diagnosing-
   a-production-lcp-inp-regression.md`. Cross-checked against `10-budgets-and-advanced-
   diagnostics` (attribution API, deploy correlation) and `03-real-user-monitoring` (RUM
   beaconing pattern) for consistency - built the 3-tool sequence (field RUM -> attribution
   sub-phase breakdown -> lab reproduction -> targeted fix -> field-confirmed resolution) as one
   continuous workflow. Build-verified.
8. ✅ **Webpack** - Diagnosing and shrinking a bloated bundle. Added syllabus SECTION 16 +
   `docs/webpack/16-real-world-workflows-and-recipes/01-diagnosing-a-bloated-bundle.md`. Built
   around 4 real bloat categories (duplicate deps, missing sideEffects, transitive-dep surprises,
   legacy browserslist targets), cross-checked against `14-performance-analysis` (analyzer/
   performance.hints) and `08-optimization` (sideEffects mechanics, the huge-ui-library scenario
   this recipe extends into a diagnostic walkthrough) for consistency. Build-verified.
9. ✅ **Storybook** - Bootstrapping into an existing app. Added syllabus SECTION 16 +
   `docs/storybook/16-real-world-workflows-and-recipes/01-bootstrapping-into-an-existing-app.md`.
   Cross-checked against `09-decorators` (global vs story-level composition order) and
   `13-build-and-configuration` (main.ts mechanics) - extended into a NEW pattern not
   previously documented anywhere in this bible: `viteFinal`/`webpackFinal` alias drift is the
   same failure class as Jest's `moduleNameMapper` drift (memory 021 item 6's neighbor finding),
   worth cross-referencing next time that pattern comes up elsewhere too. Build-verified.
10. ✅ **Framer Motion** - Diagnosing janky animations. Added syllabus SECTION 16 +
    `docs/framer-motion/16-real-world-workflows-and-recipes/01-diagnosing-janky-animations.md`.
    Split into 2 genuinely different root-cause categories: wrong-property-choice (already
    covered mechanically in `14-performance-considerations`) vs FLIP-measurement-cost-at-scale
    from the `layout` prop (a NEW distinction, not previously documented - cross-checked FLIP
    mechanics against `07-layout-animations` to confirm the getBoundingClientRect cost claim is
    real and scales with element count independent of animated property). Build-verified.
11. ✅ **TanStack Query** - RTK Query -> TanStack Query migration. Added syllabus SECTION 16 +
    `docs/tanstack-query/16-migration-recipes/01-rtk-query-to-tanstack-query.md`. Reused the
    EXACT usersApi/updateUserRole example from [[punch-list-correctness-fixes]] item 6 (the RTK
    optimistic-update fix earlier this session) as the "before" side, for direct continuity.
    Cross-checked against `02-usequery-deep-dive` and `04-caching-and-invalidation` for
    staleTime/gcTime/queryKey terminology. Flagged the "do we still need Redux at all" question
    as the migration's real structural consequence, not just an API surface swap. Build-verified.
12. ✅ **JavaScript** - Diagnosing a memory leak end-to-end. Added syllabus SECTION 17 (16 is
    reserved for the still-deferred Industry-Ready Patterns content from memory 016 - this is
    intentionally 17, not 16) + `docs/javascript/17-real-world-workflows-and-recipes/01-
    diagnosing-a-memory-leak.md`. Cross-checked against `09-memory-management` (leak patterns
    already documented there) - this recipe is the DevTools heap-snapshot-comparison DIAGNOSTIC
    workflow that doc didn't cover (it explains what leaks look like once found, not how to find
    one). Build-verified.

## ALL 12 GAPS COMPLETE (2026-07-31)

Every real gap from the survey now has a syllabus SECTION + doc file, all build-verified
individually and the full site rebuilt clean at the end. 3 bonus real bugs found and fixed
along the way while cross-referencing existing docs for grounding (not part of the original
punch list, discovered incidentally):
- Next.js syllabus's OWN stale `force-cache (default)` line (syllabus-level echo of
  [[punch-list-correctness-fixes]] item 1, missed there since that pass only touched docs/).
- Jest's `setupFilesAfterEach` (fabricated key name) -> real key is `setupFilesAfterEnv`,
  fixed in both `docs/jest-rtl/06-coverage-and-configuration` AND the syllabus.
- (Framer Motion) Identified FLIP-measurement-cost-at-scale as a genuinely separate jank
  category from property-choice cost - not a bug fix, but a real gap in the EXISTING
  performance-considerations doc's framing that this new recipe fills in.

None of this work (recipes or the earlier punch-list fixes) is pushed yet except the
GitHub Pages fix ([[github-pages-jekyll-fix]], commit c48a408) - still needs a scoped
commit/push decision from the user for the rest.


## Process (per [[git-recipes-chapter]] precedent)

For each: add a new highest-numbered SECTION to that bible's syllabus file (task-driven framing,
explicit note distinguishing it from the mechanics/API sections, matching the git bible's
SECTION 7 note), create the matching `docs/<bible>/NN-.../` folder, write the recipe(s) with
the full 4-tier structure, sandbox-verify any runnable commands/code before writing (not
guessed), `yarn build` after each to confirm no regressions, then update `docs/index.md` +
`README.md` bible one-liners if the addition is worth surfacing there.

Update this file's checkboxes as each one completes - do not create a new memory file per
bible; append progress notes here instead, to keep the survey and the execution log together.
