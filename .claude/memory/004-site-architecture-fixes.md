---
name: site-architecture-fixes
description: 2026-07-30 session where this assistant (not agy) removed the recurring duplicate Vite SPA, fixed a real Docusaurus production-build crash, fixed MDX content bugs, fixed broken links/duplicate numbering, and authored the 6 React DOM APIs missing from the syllabus. All fixes were build-verified, not just asserted.
metadata:
  type: project
---

# Site architecture fixes (2026-07-30, this assistant's own session)

Follow-up to [[002-agy-react-docs-review]]: the user asked for the duplicate-UI
issue and broken-links issue to be fixed directly by this assistant ("I dont
know what it did but you can take care from here"), after confirming agy's
React coverage had real gaps and the site had architecture problems beyond
content depth.

## Live-process conflict encountered first
Mid-session, `agy` (PID 39512) was found still actively running and editing
the exact files this assistant needed to touch (`src/App.tsx`, `package.json`)
in real time - confirmed by re-reading files seconds apart and seeing new
content appear. User confirmed and then had this assistant `kill 39512`
before any destructive edits proceeded. Standing lesson: before editing files
another tool/agent might be live-writing, check `ps aux` yourself - "I already
stopped it" from the user didn't match reality on first check.

## 1. Removed the duplicate Vite SPA (recurrence of the issue in 002)
The exact "two competing frontends" problem flagged and marked fixed in
[[002-agy-react-docs-review]] had reappeared: `src/App.tsx` + `index.html` +
`vite.config.ts` had come back as a second, hand-rolled documentation UI
alongside Docusaurus, this time reading raw `.md` files via `import.meta.glob`
(a version mid-session even lacked markdown parsing entirely - raw text in a
`<pre>` tag - before agy added a `marked`-based renderer that was still live
when killed). `package.json`'s `build` script had also been repointed at
`vite build`, making the broken SPA the "primary" production build instead of
Docusaurus.

Fix: deleted `src/App.tsx`, `src/main.tsx`, `src/App.css`, `src/index.css`,
`src/assets/`, `index.html`, `vite.config.ts`, `tsconfig.app.json`,
`tsconfig.node.json`. Trimmed `package.json` to only Docusaurus-relevant deps
(dropped `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss`,
`marked`, `lucide-react`, `clsx`, `@rolldown/plugin-babel`,
`babel-plugin-react-compiler`, `@babel/core`, `global`, and the accidentally-
included `@anthropic-ai/claude-code` CLI package). Restored `build` ->
`docusaurus build`. Replaced the 3-file Vite tsconfig project-reference
scaffold with one plain `tsconfig.json` covering `docusaurus.config.ts` +
`sidebars.ts`.

## 2. Found and fixed a real (pre-existing, never-before-verified) build crash
`yarn build` had never actually been run to completion before this session -
[[003-graphify-status]] explicitly flagged this as still-open. Running it
surfaced a genuine crash: `TypeError: require.resolveWeak is not a function`
in the SSR bundle.

Root cause (confirmed by direct experiment, not guessing): the project's
`package.json` had `"type": "module"`. Docusaurus's server webpack config
(`node_modules/@docusaurus/core/lib/webpack/server.js`) sets
`target: node${NODE_MAJOR}.${NODE_MINOR}` from the *live* Node version
(v24.18.1 here). Combined with `"type": "module"`, this broke webpack's
recognition of `react-loadable`'s `require.resolveWeak(...)` codegen used by
Docusaurus's own route-chunk map - the literal string was left unparsed in
the output and crashed at runtime since Node's real `require` has no
`.resolveWeak`. Removing `"type": "module"` from `package.json` fixed it
completely; a `configureWebpack` plugin attempt to force `target: 'node18.20'`
was tried first and did NOT fix it (confirmed via debug logging that it did
apply) - the actual lever was the `type: module` field, not the webpack
target string. Do not re-add `"type": "module"` to this project without
re-verifying `yarn build` end-to-end.

## 3. Fixed 3 real MDX content bugs (would have crashed static-page generation)
Found via the same build run, after the above fix: LaTeX-style pseudo-math
(`$$\text{NextState} = \text{reducer}(...)$$`) in
`docs/react/01-core-hooks/03-use-reducer.md` and
`docs/react/02-performance-hooks/01-use-memo-and-use-callback.md` - no math
plugin is configured, so MDX parsed the `{...}` as JSX expressions referencing
undefined variables (`NextState`, `memoizedState`, etc.) and crashed static
rendering for those two pages. Fixed by replacing with plain backtick code
text (the LaTeX was never rendering as math anyway, so this is also a
readability fix, not just a bug fix). A third bug in
`docs/vite/01-hmr-and-build-engine.md`: an inline code span used
backslash-escaped backticks (`` `import(\`./modules/\${name}.js\`)` ``) -
backslash doesn't escape backticks in CommonMark, so the span closed early
and the trailing `${name}` was parsed as a live MDX expression. Fixed using a
double-backtick code-span delimiter so the inner backticks are literal.

## 4. Fixed broken links + duplicate folder/file numbering
- `docs/index.md`: 8 of 14 homepage table links pointed at filenames that
  didn't match what agy actually wrote (e.g. `./typescript/01-advanced-types.md`
  vs. the real `01-core-type-system.md`). Most had already been silently
  fixed by agy's live process before it was killed; only the Next.js link was
  still stale after this session's renumbering, and was corrected.
- `docusaurus.config.ts`: removed two dangling `/syllabus-overview` nav/footer
  links (no such page exists anywhere in the repo, nothing else references it
  - looks like a planned-but-never-built feature, not fixed by fabricating a
  page). Fixed `favicon: 'img/favicon.ico'` (file never existed) to point at
  the one favicon that does (moved `public/favicon.svg` -> `static/img/favicon.svg`,
  since `public/` was Vite's static dir and Docusaurus uses `static/`).
  Fixed `/category/06-server-components-and-actions` (Docusaurus doesn't
  generate a category landing page for a single-doc directory) to link
  directly to the one real doc page instead.
- Duplicate numeric prefixes causing ambiguous sidebar ordering: `docs/react/`
  had two `06-` folders (`06-id-accessibility-debug` renumbered to `08-`,
  freeing the previously-skipped `08` slot; `06-server-components-and-actions`
  left as-is). `docs/typescript/` and `docs/nextjs/` each had two files
  prefixed `01-` - renumbered both directories to a clean, non-colliding,
  logically-ordered sequence.
- Verified via `git status --short` after: zero broken-link warnings and a
  clean `yarn build` after every fix, not just after the last one.

## 5. Authored the 6 missing React DOM APIs
Per the earlier syllabus-vs-docs audit (this conversation, pre-memory):
`createPortal()`, `flushSync()`, `renderToString()`, `renderToStaticMarkup()`,
`preloadModule()`, `preinitModule()` were the only syllabus items with zero
coverage anywhere in `docs/react/`. Added real content (mechanics, a portal
+ flushSync modal scenario, an email-vs-legacy-SSR scenario, working code
examples, and 4 new pitfalls covering event-bubbling-through-portals,
flushSync overuse/layout thrashing, and preinitModule double-evaluation) into
the existing `docs/react/07-react-dom-apis/01-client-server-and-resource-apis.md`,
matching the established 4-section format rather than creating disconnected
stub files.

## 6. Repo hygiene found along the way (not part of the original ask, fixed because it was directly in the way of build verification)
`.docusaurus/` (webpack/Docusaurus cache) and `build/` (Docusaurus output)
were tracked in git and showing as deletions in `git status` every time a
build ran. Added both to `.gitignore`. Separately, `.yarn/.cache/webpack/`
(~104MB of webpack's *own* disk cache, written into Yarn's cache directory)
was already committed in the repo's single existing commit
(`d6e847e Upto React developed`) - added `.yarn/.cache` to `.gitignore` to
stop it recurring, but the 104MB is still baked into that existing commit;
shrinking it would require a history rewrite, which was not done (destructive,
needs explicit user go-ahead - flag this if repo size/clone time ever comes up).

## RESOLVED as of 2026-07-31
- The 13 non-React bibles were subsequently expanded to full depth across
  [005](005-redux-toolkit-expansion.md) through
  [014](014-frontend-architecture-expansion.md) - all 14 bibles now complete,
  each build-verified. `docs/index.md`'s "all 14 Bibles" claim is now
  actually accurate, not misleading.
- [[003-graphify-status]]'s two open items (finish script review, run a real
  build/typecheck) were also closed in the same 2026-07-31 check: `yarn build`
  passes clean with zero broken-link warnings.

## Minor, not yet acted on
- `docusaurus.config.ts:14` uses the top-level `onBrokenMarkdownLinks` option,
  which Docusaurus flags as deprecated in favor of
  `markdown.hooks.onBrokenMarkdownLinks` and says will be removed in v4.
  Cosmetic/future-proofing only - build works fine today, no rush.
