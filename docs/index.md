---
sidebar_position: 1
title: 📚 Frontend Master Bibles Overview
slug: /
---

# 📚 Frontend Engineering Master Bibles

Welcome to the central technical documentation platform. This repository contains deep-dive, production-grade reference bibles covering the core frontend ecosystem.

---

## 🗂️ The 16 Technical Bibles

Every topic includes **Under-the-Hood Mechanics**, **Real-World Scenarios**, **Production Code**, and **Senior Engineer Edge Cases & Pitfalls**.

| Bible | Category | Core Topics Covered |
| :--- | :--- | :--- |
| ⚛️ **[React Bible](./react/01-core-hooks/01-use-state.md)** | Core Library | React 19, 19 Hooks, Fiber Engine, RSC, Streaming SSR, Asset Preloading |
| ▲ **[Next.js Bible](./nextjs/01-routing-fundamentals/01-file-conventions.md)** | Full-Stack Framework | App Router, Server Actions, Edge Middleware, Caching, ISR, Route Handlers |
| ⚡ **[JavaScript Bible](./javascript/01-core-language-fundamentals/01-variables-types-and-coercion.md)** | Core Engine | Event Loop & Microtasks, Closures, Prototypes, Memory Leaks, Async/Generators |
| 🔷 **[TypeScript Bible](./typescript/01-core-type-system/01-foundations-and-inference.md)** | Type System | Generics, Conditional Types, Template Literals, Type Guards, Branded Types |
| 🎨 **[CSS Bible](./css/01-cascade-specificity-and-inheritance/01-cascade-specificity-and-layers.md)** | Styling Language | Cascade & Layers, Flexbox, Grid & Subgrid, Global Color Tokens, Container Queries, Layout Tricks |
| 🏛️ **[Frontend Architecture Bible](./frontend-architecture/01-project-structure-and-organization/01-folder-strategy.md)** | System Design | Micro-Frontends, Monorepos, Offline-First, State Machines, Web Workers |
| 🔄 **[TanStack Query Bible](./tanstack-query/01-core-concepts/01-the-server-state-model.md)** | Server State | Query Cache, Mutations, Optimistic Updates, Infinite Queries, SSR |
| 📦 **[Redux Toolkit Bible](./redux-toolkit/01-store-setup/01-configure-store.md)** | Client State | Slice Design, RTK Query, Entity Adapters, Middleware, Normalization |
| 🚀 **[Web Vitals & Performance Bible](./web-vitals-performance/01-core-web-vitals/01-lcp-inp-cls-fundamentals.md)** | Performance | LCP, INP, CLS Tuning, Critical Rendering Path, Web Workers, Profiling |
| ⚡ **[Vite Bible](./vite/01-core-architecture/01-dual-engine-model.md)** | Build Tools | HMR Mechanics, Esbuild, Plugin API, Environment Configs, Code Splitting |
| ⚙️ **[Webpack Bible](./webpack/01-core-concepts/01-five-core-concepts-and-module-graph.md)** | Bundling | Module Federation (5-file micro-frontend deep dive), Custom Loaders, Tapable Hooks, Chunk Optimization |
| 🎞️ **[Framer Motion Bible](./framer-motion/01-core-concepts/01-declarative-animation-philosophy.md)** | UI & Motion | 60FPS Layout Animations, AnimatePresence, Gestures, Scroll Progress |
| 📖 **[Storybook Bible](./storybook/01-core-concepts/01-component-driven-development.md)** | Component Docs | Stories, Controls/Actions/Interactions panels, Visual & A11y testing, Config, Colors & Fonts |
| 🧪 **[Jest & RTL Bible](./jest-rtl/01-jest-core-concepts/01-test-structure.md)** | Unit Testing | DOM Simulation, Async Testing, Mocking, User Event, Code Coverage |
| 🎭 **[Playwright Bible](./playwright/01-core-architecture/01-browser-automation-model.md)** | E2E Testing | Cross-Browser Automation, Visual Regression, Network Interception, CI/CD |
| 🔧 **[Git Bible](./git/01-core-architecture/01-object-store-and-git-topology.md)** | Version Control | Object Store, Plumbing vs Porcelain, DAG Traversal, Worktrees, Bisect, Real-World Recipes |

---

## 🧭 Topic hub — CSS, colors & Storybook (Docusaurus)

All of the following are **pages in this Docusaurus site** (sidebar + links below).  
They are **not** inside the Storybook application UI — open them with `yarn start` and use the left sidebar, or click here.

### CSS Bible — language, layout, colors

| Topic | Open in Docusaurus |
| :--- | :--- |
| Full CSS bible (start) | [Cascade, specificity & layers](./css/01-cascade-specificity-and-inheritance/01-cascade-specificity-and-layers.md) |
| **Flexbox** deep dive | [Flexbox engine & algorithm](./css/04-flexbox-deep-dive/01-flexbox-engine-and-algorithm.md) |
| **CSS Grid** deep dive | [Grid tracks, placement & subgrid](./css/05-css-grid-deep-dive/01-grid-tracks-placement-and-subgrid.md) |
| Color spaces & surfaces | [Color spaces, backgrounds & borders](./css/11-color-backgrounds-and-borders/01-color-spaces-backgrounds-and-borders.md) |
| **Global color system** (tokens, light/dark, drop-in CSS) | [Global color system & tokens](./css/11-color-backgrounds-and-borders/02-global-color-system-and-tokens.md) |
| **Fullstack color strategy** (tokens + Tailwind/Modules) | Same page → [§5 Color strategy for modern fullstack apps](./css/11-color-backgrounds-and-borders/02-global-color-system-and-tokens.md#5-color-strategy-for-modern-fullstack-applications) |
| Architecture styling decisions | [Choosing & scaling a styling approach](./frontend-architecture/06-styling-architecture/01-choosing-and-scaling-a-styling-approach.md) |
| CSS recipes (dashboard, flex debug, …) | [Real-world workflows & recipes](./css/19-real-world-workflows-and-recipes/01-responsive-dashboard-shell-with-grid.md) |
| Syllabus outline (source TOC) | Repo file: `syllabus/css_bible_syllabus.txt` |

### Storybook Bible — config, customization, theme & fonts

| Topic | Open in Docusaurus |
| :--- | :--- |
| Storybook bible (start) | [Component-driven development](./storybook/01-core-concepts/01-component-driven-development.md) |
| Config basics (`main` / `preview`) | [Build & configuration — main](./storybook/13-build-and-configuration/01-storybook-main.md) |
| **In-depth main + preview customization** | [Advanced main & preview customization](./storybook/13-build-and-configuration/02-advanced-main-and-preview-customization.md) |
| **Manager UI, viteFinal, env, CI** | [Manager UI, builder hooks & env](./storybook/13-build-and-configuration/03-manager-ui-builder-hooks-and-env.md) |
| **Colors & themes inside Storybook preview** | [Global colors, themes & tokens](./storybook/17-theming-colors-and-fonts/01-global-colors-themes-and-tokens.md) |
| **Custom fonts in Storybook** | [Custom fonts & typography](./storybook/17-theming-colors-and-fonts/02-custom-fonts-and-typography.md) |
| Recipe: wire app colors + fonts | [Wiring colors and custom fonts](./storybook/16-real-world-workflows-and-recipes/02-wiring-colors-and-custom-fonts.md) |
| Bootstrap Storybook into an existing app | [Bootstrapping into an existing app](./storybook/16-real-world-workflows-and-recipes/01-bootstrapping-into-an-existing-app.md) |
| Syllabus outline (source TOC) | Repo file: `syllabus/storybook_bible_syllabus.txt` |

### Storybook Bible — story bottom panels (Controls → a11y)

These are the tabs you open **inside Storybook** for each component story. The pages below explain what each panel does, how to configure it, and how they work together.

| Storybook UI panel | Open in Docusaurus |
| :--- | :--- |
| **Controls** — live prop editing | [Controls & args deep dive](./storybook/04-controls-and-args/01-dynamic-prop-editing.md) |
| **Actions** — callback / event logs | [Actions panel in depth](./storybook/03-addons-ecosystem/02-actions-panel-in-depth.md) |
| **Interactions** — `play` step debugger | [play functions & Interactions](./storybook/05-interaction-testing/01-play-functions.md) |
| **Visual tests** — Chromatic snapshots | [Chromatic / visual testing](./storybook/06-visual-testing/01-chromatic-integration.md) |
| **Accessibility** — axe-core scans | [a11y addon panel](./storybook/07-accessibility-testing/01-a11y-addon.md) |
| Essentials bundle overview | [addon-essentials](./storybook/03-addons-ecosystem/01-essential-addons.md) |

### How to view

```bash
yarn start
# open the local URL → home page has this hub
# or use the left sidebar: Css / Storybook sections
```

---

## 🔬 Four-Tier Documentation Standard

Every single concept across all 16 Bibles is documented with:
1. **Under-The-Hood Mechanics**: Engine internals, data structures, and runtime execution phases.
2. **Real-World Engineering Scenario**: Production use cases from high-scale applications.
3. **Production-Grade Code**: Clean, type-safe code examples ready for production.
4. **Senior Engineer Edge Cases & Pitfalls**: Memory leaks, race conditions, tearing, and performance traps.

