---
name: nextjs-typescript-javascript-plan
description: Next.js, TypeScript, and JavaScript bibles expanded from stub-depth to full per-concept depth - COMPLETE (45 files total).
metadata:
  type: project
---

# Next.js / TypeScript / JavaScript Expansion Plan

User asked (2026-07-30 session) to work on Next.js, TypeScript, and JavaScript next,
explicitly requesting each concept explained in depth with examples and senior engineer
gotchas - the same 4-part skeleton (mechanics / real-world scenario / production code /
pitfalls) used for [005](005-redux-toolkit-expansion.md) and
[006](006-webpack-and-web-vitals-expansion.md).

## Starting state (all three were stub-depth per [001](001-bible-syllabus-inventory.md))
- `docs/nextjs/`: 4 flat files (01-routing-fundamentals, 02-app-router-and-rsc,
  03-advanced-routing-patterns, 04-four-caching-layers), each ~70-90 lines covering
  MULTIPLE syllabus sections compressed together.
- `docs/typescript/`: 7 flat files (01-core-type-system through 07-advanced-type-engineering),
  ~60-90 lines each, roughly covering syllabus sections 1,4,5,6,7,9,15 - missing 2,3,8,10,11,12,13,14.
- `docs/javascript/`: only 3 files exist (01-v8-engine-and-event-loop,
  02-execution-context-closures-and-scope, 15-proxies-reflect-and-metaprogramming) -
  12 of 15 syllabus sections have NO file at all yet.

## Planned folder structure (15 folders/files each, one per syllabus section, matching
`syllabus/nextjs_bible_syllabus.txt`, `syllabus/typescript_bible_syllabus.txt`,
`syllabus/javascript_bible_syllabus.txt` 1:1 this time - each syllabus section is already
granular enough not to need combining, unlike redux-toolkit/web-vitals)

**Next.js**: 01-routing-fundamentals, 02-advanced-routing-patterns, 03-rendering-strategies,
04-data-fetching, 05-server-actions-and-mutations, 06-caching-architecture,
07-metadata-and-seo, 08-middleware, 09-route-handlers, 10-optimization-apis,
11-legacy-pages-router, 12-rendering-runtimes, 13-configuration, 14-deployment-and-build,
15-advanced-patterns.

**TypeScript**: 01-core-type-system, 02-structural-typing, 03-interfaces-and-type-aliases,
04-functions-and-generics, 05-advanced-generics, 06-utility-types, 07-mapped-types,
08-template-literal-types, 09-type-narrowing-and-guards, 10-classes-and-oop,
11-enums-and-const-assertions, 12-modules-and-declarations, 13-configuration,
14-react-typescript-integration, 15-advanced-patterns.

**JavaScript**: 01-core-language-fundamentals, 02-execution-context-and-scope,
03-the-this-keyword, 04-functions-in-depth, 05-prototypes-and-oop,
06-asynchronous-javascript, 07-event-loop-deep-dive, 08-iterables-and-generators,
09-memory-management, 10-modules, 11-modern-es-features, 12-collections-and-data-structures,
13-browser-apis-and-dom, 14-error-handling, 15-advanced-meta-programming.

## Execution approach
All old flat stub files in these 3 bibles get deleted and replaced by the new folder
structure (same as the redux-toolkit/webpack/web-vitals stub replacements - confirmed via
`git ls-files` that none of these docs/ files were tracked in git, so plain `rm` is safe,
no `git rm` needed). `docs/index.md` links for all three bibles need updating to the new
first file once done. Build-verify with `yarn build` at the end, then update this memory
file's status and `.claude/memory/index.md`.

## Status: COMPLETE (2026-07-31)

All three bibles fully expanded to 15 folders/files each (45 files total), matching
the react/redux-toolkit/webpack/web-vitals depth pattern. All old flat stub files deleted
(Next.js: 4, TypeScript: 7, JavaScript: 3 - including reusing/rewriting the 3 JS files that
already existed, e.g. the old `01-v8-engine-and-event-loop.md` content was folded into the
new `07-event-loop-deep-dive/01-concurrency-model.md`, and `15-proxies-reflect-and-metaprogramming.md`
into `15-advanced-meta-programming/01-proxy-reflect-and-symbols.md`).

`docs/index.md` links updated for all three bibles to their new first files. `yarn build`
verified clean (no broken links/anchors) on the first attempt.

## Remaining gap
Per [001](001-bible-syllabus-inventory.md)/[006](006-webpack-and-web-vitals-expansion.md),
7 bibles remain stub-depth: vite, jest-rtl, playwright, tanstack-query, storybook,
framer-motion, frontend-architecture. User said (2026-07-31) to pick the next topic and
keep filling out the ecosystem without waiting for further prompting once this batch finished.
