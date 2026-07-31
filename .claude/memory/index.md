# Memory Index

Read this file ONLY at the start of a session. Load an individual file below
only when the current request relates to what its summary describes. Do not
bulk-read every file.

| File | Summary |
|---|---|
| [001-bible-syllabus-inventory.md](001-bible-syllabus-inventory.md) | Full list of the 14 `syllabus/*.txt` bible files this assistant authored, their format convention, and known gaps (API catalog, not tutorial). |
| [002-agy-react-docs-review.md](002-agy-react-docs-review.md) | Review of agy's docs site across 2 rechecks. Final: 4/6 issues genuinely fixed (Module 6 gap, capstone file, duplicate UI, React 19.2 additions). graphify's bad output was deleted (not fixed at source). The other 13 bibles have folders now but are 150-400 word stubs, not real coverage - agy's "all 14 bibles authored" claim is misleading. |
| [003-graphify-status.md](003-graphify-status.md) | Old unverified npm `graphify` dependency was replaced with a local `scripts/graphify.js` (correctly excludes vendor dirs now) - identity concern resolved. Script fully reviewed (safe, no network/eval) and `yarn build` verified clean as of 2026-07-31. |
| [004-site-architecture-fixes.md](004-site-architecture-fixes.md) | Removed the recurring duplicate Vite SPA, fixed a real `yarn build` crash (root cause: `"type": "module"` + Docusaurus's Node-version-derived webpack target breaking react-loadable codegen), fixed 3 MDX content bugs, fixed 8 broken links + duplicate folder/file numbering, authored the 6 missing React DOM APIs. All build-verified. 13 non-React bibles were later expanded too (005-014) - all 14 now complete, `docs/index.md`'s "all 14 Bibles" claim is now accurate. |
| [005-redux-toolkit-expansion.md](005-redux-toolkit-expansion.md) | Redux Toolkit bible rebuilt from 1 stub file into 13 folders/16 files covering all 15 syllabus sections, matching React bible depth. Build-verified clean. |
| [006-webpack-and-web-vitals-expansion.md](006-webpack-and-web-vitals-expansion.md) | Webpack (20 files, incl. 5-file Module Federation/micro-frontend deep dive) and Web Vitals (10 files) bibles expanded from stubs. Build-verified clean. 10 other bibles still stub-depth. |
| [007-nextjs-typescript-javascript-plan.md](007-nextjs-typescript-javascript-plan.md) | Next.js, TypeScript, JavaScript bibles expanded to 15 folders/files each (45 files total), 1:1 with syllabus sections. COMPLETE, build-verified. |
| [008-vite-expansion.md](008-vite-expansion.md) | Vite bible expanded to 15 folders/files, 1:1 with syllabus sections. COMPLETE, build-verified. |
| [009-jest-rtl-expansion.md](009-jest-rtl-expansion.md) | Jest & RTL bible expanded to 15 folders/files, 1:1 with syllabus sections. COMPLETE, build-verified. |
| [010-playwright-expansion.md](010-playwright-expansion.md) | Playwright bible expanded to 15 folders/files, 1:1 with syllabus sections. COMPLETE, build-verified. |
| [011-tanstack-query-expansion.md](011-tanstack-query-expansion.md) | TanStack Query bible expanded to 15 folders/files, 1:1 with syllabus sections. COMPLETE, build-verified. |
| [012-storybook-expansion.md](012-storybook-expansion.md) | Storybook bible expanded to 15 folders/files, 1:1 with syllabus sections. COMPLETE, build-verified. |
| [013-framer-motion-expansion.md](013-framer-motion-expansion.md) | Framer Motion bible expanded to 15 folders/files, 1:1 with syllabus sections. COMPLETE, build-verified. |
| [014-frontend-architecture-expansion.md](014-frontend-architecture-expansion.md) | Frontend Architecture bible (the deliberately-different decisions/tradeoffs one, not an API catalog) expanded to 15 folders/files. FINAL bible - all 14 in the syllabus are now complete, build-verified. |
| [015-long-task-workflow-preferences.md](015-long-task-workflow-preferences.md) | User's preferences for long multi-part tasks: continue autonomously through a whole queue once given go-ahead, checkpoint memory per completed unit (not just at the end), and mid-task "save progress" means an exact file-by-file checkpoint. |
| [016-industry-ready-patterns-plan.md](016-industry-ready-patterns-plan.md) | New "industry-ready patterns" syllabus sections added to both JS (SECTION 16) and React (SECTION 7) bibles - debounce/memoization/chunking/etc. Syllabus only, committed; docs/ authoring deferred - pick up there next. |
