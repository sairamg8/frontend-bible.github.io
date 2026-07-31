# 🚀 Frontend Engineering Master Bibles Platform

Welcome to the **Frontend Engineering Master Bibles Platform** — an enterprise-grade, single-source-of-truth documentation system designed for senior frontend engineers, staff architects, and interview preparation. 

Powered by **Docusaurus 3**, **React 19.2**, and **TypeScript 6**, this platform hosts **15 comprehensive, production-level reference bibles** covering every critical domain of modern frontend engineering.

---

## 🎯 Project Goals & Core Philosophy

1. **Single Source of Truth**: All documentation resides in `docs/`, organized cleanly into technology-specific subdirectories rendered via Docusaurus.
2. **Four-Tier Documentation Standard**: Every single concept across all bibles follows a strict 4-tier structure:
   - 🔬 **Under-The-Hood Mechanics**: Engine internals, runtime lifecycle, data structures, V8 / Fiber / browser operations.
   - 🏢 **Real-World Engineering Scenario**: High-scale production use cases and architectural patterns.
   - 💻 **Production-Grade Code**: Complete, type-safe code examples ready for production deployment.
   - ⚠️ **Senior Engineer Edge Cases & Pitfalls**: Tearing, memory leaks, race conditions, hydration mismatches, performance anti-patterns.
3. **Zero Duplication & Strict Discipline**: Rules tracked in `.agy/` ensure no fluff, complete link integrity, and high-density technical depth across all files.

---

## 🗂️ The 15 Technical Bibles

| Icon | Bible Name | Path | Key Focus & Content |
| :---: | :--- | :--- | :--- |
| ⚛️ | **React Bible** | `docs/react/` | React 19.2, 19 Core Hooks, Fiber reconciler, RSC, Streaming SSR, Asset preloading |
| ▲ | **Next.js Bible** | `docs/nextjs/` | App Router, Server Actions, Edge Middleware, ISR, Caching layer, Route Handlers |
| ⚡ | **JavaScript Bible** | `docs/javascript/` | V8 engine, Event Loop & microtasks, Memory profiling, Closures, Prototypes, Generators |
| 🔷 | **TypeScript Bible** | `docs/typescript/` | Type system mechanics, Generics, Conditional types, Template literals, Branded types |
| 🏛️ | **Frontend Architecture** | `docs/frontend-architecture/` | Micro-Frontends, Monorepo strategies, Offline-first apps, State machines, Web Workers |
| 🔄 | **TanStack Query Bible** | `docs/tanstack-query/` | QueryCache internals, Mutations, Optimistic updates, Infinite queries, SSR hydration |
| 📦 | **Redux Toolkit Bible** | `docs/redux-toolkit/` | RTK Query, Immer mechanics, Normalized entity adapters, Custom middleware |
| 🚀 | **Web Vitals & Performance** | `docs/web-vitals-performance/` | LCP, INP, CLS optimization, Critical rendering path, Time-slicing, Memory profiling |
| ⚡ | **Vite Bible** | `docs/vite/` | Dual-engine model (Esbuild + Rollup), HMR engine, Custom plugins, Code-splitting |
| ⚙️ | **Webpack Bible** | `docs/webpack/` | Module Federation (micro-frontends), Custom loaders/plugins, Tapable hooks, Chunk tuning |
| 🎨 | **Framer Motion Bible** | `docs/framer-motion/` | 60FPS layout animations, FLIP engine, AnimatePresence, Scroll-linked gestures |
| 📖 | **Storybook Bible** | `docs/storybook/` | Component Driven Development (CDD), CSF 3.0, Design Systems, Visual testing, A11y |
| 🧪 | **Jest & RTL Bible** | `docs/jest-rtl/` | JSDOM simulation, Async element queries, Module mocking, User Event, Test coverage |
| 🎭 | **Playwright Bible** | `docs/playwright/` | Cross-browser E2E testing, Visual regression, Network interception, CI/CD execution |
| 🔧 | **Git Bible** | `docs/git/` | Object store (Blobs, Trees, Commits), Plumbing vs Porcelain, DAG Traversal, Worktrees, Bisect, Real-World Recipes |


---

## 🛠️ Project Architecture & Stack

- **Documentation Engine**: [Docusaurus 3](https://docusaurus.io/) (`@docusaurus/core`, `@docusaurus/preset-classic`)
- **Core Runtime**: [React 19.2](https://react.dev/) & [TypeScript 6](https://www.typescriptlang.org/)
- **Linter**: [Oxlint](https://oxc.rs/) for high-performance JS/TS linting
- **Knowledge Graph Tool**: Custom Node.js Graphify scanner (`scripts/graphify.js`) generating clean knowledge graphs in `graphify-out/` excluding vendor noise.

---

## 🧠 Memory & System Architecture (`.agy/`)

The repository includes a persistent memory system located in `.agy/`:

```text
.agy/
├── index.json          # High-level index tracking memories, word counts, and status
├── instructions.json   # System instructions & post-mortem discipline rules
└── memories/           # Detailed historical logs of refactoring, setup, and authored bibles
```

### Key Principles from `.agy/` Memories:
- **`docs/` is the Single Source of Truth**: All documentation markdown lives strictly within `docs/`.
- **Zero Fluff**: Technical accuracy and senior-level depth prioritized over generic marketing summaries.
- **Knowledge Graph Verification**: Clean scan of 200+ documentation files totaling 185,000+ words of structured technical knowledge (see `graphify-out/GRAPH_SUMMARY.md` for the current per-bible breakdown).

---

## 💻 Getting Started & Commands

### Prerequisites
- Node.js >= 18.x
- Yarn or npm

### Installation & Execution

```bash
# Install dependencies
yarn install

# Start local documentation server (Docusaurus)
yarn start

# Build production bundle
yarn build

# Run Oxlint for fast code quality checks
yarn lint

# Generate knowledge graph output (excluding vendor directories)
yarn graphify
```

---

## 📜 License & Maintenance

Maintained as a high-grade Frontend Masterclass repository. All contributions follow the four-tier documentation standard.

