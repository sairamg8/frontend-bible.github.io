---
name: vite-expansion
description: Vite bible expanded from a single stub file into 15 folders/files, 1:1 with syllabus sections.
metadata:
  type: project
---

# Vite Bible Expansion

Continuing the ecosystem-filling work after [007](007-nextjs-typescript-javascript-plan.md)
(Next.js/TypeScript/JavaScript), per the user's instruction to keep picking the next stub
bible without waiting for further prompting. Vite was next (pairs naturally with the
already-completed Webpack bible).

## Structure Created
15 folders, 15 files, 1:1 with `syllabus/vite_bible_syllabus.txt`'s 15 sections:
01-core-architecture (dual-engine: dev server native ESM + esbuild pre-bundling vs Rollup
production build), 02-cli-and-scaffolding, 03-configuration, 04-dev-server-mechanics (HMR
API, optimizeDeps), 05-build-system-rollup (manualChunks, library mode), 06-asset-handling
(?raw/?url/?worker suffixes, import.meta.glob), 07-env-variables-and-modes (VITE_ prefix
security boundary), 08-plugin-system (Rollup-compatible + Vite-specific hooks), 09-css-handling
(CSS Modules, PostCSS, Lightning CSS), 10-ssr-support (middlewareMode, ssrLoadModule,
ssrManifest), 11-optimization-and-performance, 12-path-resolution-and-aliases (dedupe for
the "two React copies" monorepo problem), 13-worker-and-wasm-support, 14-testing-integration
(Vitest sharing vite.config.ts - no separate Jest-style transform config to drift out of
sync), 15-deployment-considerations (base path + cache header strategy).

## Housekeeping
- Old stub `docs/vite/01-hmr-and-build-engine.md` deleted (untracked in git, same pattern
  as every previous bible expansion this project).
- `docs/index.md` Vite link updated to `./vite/01-core-architecture/01-dual-engine-model.md`.
- `yarn build` verified clean (no broken links/anchors, both client and server compiled
  successfully).

## Remaining gap
6 bibles still stub-depth: jest-rtl, playwright, tanstack-query, storybook, framer-motion,
frontend-architecture. Continue picking the next one per standing user instruction.
