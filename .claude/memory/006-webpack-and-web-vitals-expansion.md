---
name: webpack-and-web-vitals-expansion
description: Webpack (20 files, 5-file Module Federation micro-frontend deep dive) and Web Vitals (10 files) bibles expanded from single stubs, matching React/Redux Toolkit depth.
metadata:
  type: project
---

# Webpack & Web Vitals Bible Expansion

Following the same pattern as [005](005-redux-toolkit-expansion.md), two more bibles were rebuilt
from single stub files into full-depth folder structures. User specifically asked for webpack's
micro-frontend handling to cover "all kinds of possibilities" - Module Federation (syllabus section
11) got 5 files instead of 1, well beyond every other section's 1-file treatment.

## Webpack (15 folders, 20 files)
1-10, 12-15 follow the syllabus's other 14 sections 1:1 (core concepts, configuration, module
resolution, loaders x2, asset modules, plugins, code splitting, optimization, dev server/HMR,
caching, source maps, multi-config, performance analysis, advanced custom tooling).

**`11-module-federation/` (the deep dive) - 5 files:**
1. `01-fundamentals-remotes-and-exposes.md` - container runtime, exposes/remotes, eager vs lazy
2. `02-shared-dependencies-and-version-negotiation.md` - singleton, requiredVersion/strictVersion, eager shared
3. `03-dynamic-remotes-and-runtime-loading.md` - runtime-resolved remote URLs, per-tenant/white-label pattern, hand-rolled loadRemoteModule
4. `04-architecture-patterns-and-topologies.md` - horizontal / nested (vertical) / bidirectional federation, federated design-system pattern, build-time vs runtime (multi-zone) composition, when NOT to reach for MF
5. `05-production-ops-and-troubleshooting.md` - remoteEntry.js cache-header pitfall, error-boundary isolation per federated import, circuit breaker/timeout pattern, TypeScript ambient types for federated modules

## Web Vitals & Performance (10 folders, 10 files)
Syllabus's 15 sections combined into 10 folders (legacy metrics+lab tools combined; loading+rendering
combined; bundle+media combined; caching+RUM tools combined; budgets+advanced diagnostics combined):
core-web-vitals, legacy-and-lab-measurement, real-user-monitoring, lcp-optimization,
inp-optimization, cls-optimization, loading-and-rendering-performance,
bundle-and-media-optimization, caching-and-production-monitoring, budgets-and-advanced-diagnostics.

## Housekeeping
- Old stubs (`docs/webpack/01-module-federation-and-loaders.md`,
  `docs/web-vitals-performance/01-lcp-inp-cls-tuning.md`) deleted - both were untracked in git,
  same as the redux-toolkit stub was.
- `docs/index.md` links updated to point at each bible's new first file.
- `yarn build` verified clean on the first attempt this time (no broken links/anchors).

## Remaining gap
Per [001](001-bible-syllabus-inventory.md), still stub-depth: vite, nextjs, jest-rtl, playwright,
typescript, tanstack-query, storybook, framer-motion, javascript, frontend-architecture (10 bibles).
