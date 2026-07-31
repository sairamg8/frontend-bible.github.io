---
name: github-pages-jekyll-fix
description: Fixed a live GitHub Pages build failure - repo was running classic Jekyll instead of the Docusaurus build, plus discovered/fixed placeholder deploy URLs. Pushed to origin/master.
metadata:
  type: project
---

# GitHub Pages Jekyll build fix (2026-07-31)

## Discovery
User pasted a raw GitHub Pages/Jekyll build error log mid-session (Liquid syntax error on
`{{ opacity: { duration: 0.2 } }}` in a framer-motion doc). This revealed the repo already has
a remote configured (`origin` = `git@github.com:sairamg8/frontend-bible.github.io.git`) and
had ALREADY been pushed by the user directly (outside this assistant's tool calls, in a
separate session/terminal) - commit "Committed Config.yml" was already on `origin/master`
before this was investigated. Local `git remote -v` had returned empty earlier this same
session when the assistant asked to help connect a remote; user added it themselves later
without going through the assistant.

## Root cause
GitHub Pages defaults to a classic Jekyll build when no `.nojekyll` marker exists. The user's
push added a stray `_config.yml` (Jekyll config, `theme: Frontend dev bible` - not a valid
Jekyll theme name, silently fell back to `jekyll-theme-primer`), which triggered Jekyll
auto-detection on a repo that is a Docusaurus site, not a Jekyll site. Jekyll's Liquid
templating engine ran over the raw `docs/` MARKDOWN SOURCE (not Docusaurus's built HTML output)
and crashed on ordinary `{{ }}` JS/JSX syntax in code examples - Liquid treats `{{` as its own
template-variable delimiter, and this runs before Markdown/code-fence-aware processing, so even
fenced code blocks aren't safe from it.

## Second bug found while fixing the first
`docusaurus.config.ts` had `url: 'https://reactbible.local'` (a placeholder local-dev domain)
and `baseUrl: '/'` - never updated for real deployment. Since the repo is named
`frontend-bible.github.io` under owner `sairamg8` (NOT literally `sairamg8.github.io`), GitHub
only treats an exact `<owner>.github.io`-named repo as the root user site; this one is a
project-page repo, served at `https://sairamg8.github.io/frontend-bible.github.io/`. Fixed
`url`/`baseUrl` accordingly and added `organizationName`/`projectName`.

## Fix (pushed to origin/master, commit c48a408)
- Removed `_config.yml`.
- Added `.nojekyll` at repo root (immediate fix under the CURRENT "deploy from branch" Pages
  mode) AND in `static/.nojekyll` (so every future `yarn build` output includes it automatically
  - verified it lands in `build/.nojekyll` after a rebuild).
- Added `.github/workflows/deploy-docs.yml` - the correct long-term fix: builds the actual
  Docusaurus site (`yarn build`) and deploys `build/` via `actions/upload-pages-artifact` +
  `actions/deploy-pages`, instead of GitHub Pages trying to serve raw markdown directly.
- Fixed `docusaurus.config.ts` url/baseUrl/organizationName/projectName.
- Verified locally: `yarn build` clean with the new baseUrl, `.nojekyll` present in output,
  asset paths correctly prefixed with `/frontend-bible.github.io/`.

## Still needs a manual step (user confirmed they'll do it, not delegated to a future session)
Repo Settings -> Pages -> Build and deployment -> Source must be switched from "Deploy from a
branch" to "GitHub Actions" for the new workflow to actually take over. The assistant has no
`gh` CLI / GitHub token available in this environment to do this via API - confirmed with user
they'd do this one click themselves after the push landed.

## Scoping decision
This was a genuinely separate, higher-priority issue from the recipe-writing task in progress
(see [[cross-bible-recipe-gaps-survey]]) - the user was mid-way through it when this build
failure came in. Committed/pushed ONLY the 5 Pages-fix files, not the rest of the session's
accumulated doc work (git bible, Next.js/Vite recipes, README fixes, etc.) - user explicitly
chose a scoped push first, rest to follow separately. Recipe work resumed immediately after.
