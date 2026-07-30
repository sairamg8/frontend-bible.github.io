# Graph Report - .  (2026-07-30)

## Corpus Check
- 33 files · ~52,447 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1154 nodes · 2268 edges · 73 communities (43 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Yarn PnP Runtime Core
- PnP Loader ESM Errors
- Package Dependencies
- NodeFS Sync API
- NodeFS Promise API
- ZipFS Archive Ops
- MountFS Layer
- ProxiedFS Sync
- ProxiedFS File Handles
- JsZip and LibZip
- FS Stats and Watchers
- Package Exports Resolve
- FakeFS Buffer IO
- FileHandle Streams
- FS Copy Move Remove
- App TSConfig and DOM
- FS Read and FDs
- FS Copy Implementation
- FakeFS Change Files
- Node Vite TSConfig
- FS Dir and Stat Errors
- FS Error Codes
- Custom Directory Iterator
- Frontend Capstone Track
- Next.js React Server Stack
- Oxlint React Rules
- WASM Binary Loader
- Async FS Copy Flow
- Vite Webpack Bundlers
- Open File Handle Limits
- JS TypeScript Runtime
- FS Lock and Unlink
- Site Favicon Branding
- Frontend Arch and Testing
- State Management Stack
- DynamicFS Path Resolve
- VirtualFS Mapping
- Social Icon Sprite
- Playwright Storybook QA
- Emscripten Time Heap
- FS Readdir Watch
- VirtualFS Realpath
- StatEntry File Types
- Hero Graphic Design
- Emscripten Runtime Hooks
- Emscripten C Interop
- Node Options Parsing
- ESM Require Errors
- React Logo Asset
- Vite Logo Asset
- Archive Busy Close
- NodePathFS Mapping
- Framer Motion Animations
- Emscripten Heap Resize
- ZipOpenFS Archives
- FS Symlink Copy
- PosixFS Mapping
- Root TSConfig Project
- ArgError Type
- BasePortableFakeFS
- LibzipError Type
- Oxlint Concept

## God Nodes (most connected - your core abstractions)
1. `ZipFS` - 98 edges
2. `MountFS` - 83 edges
3. `NodeFS` - 75 edges
4. `NodeFS` - 75 edges
5. `ProxiedFS` - 74 edges
6. `ProxiedFS` - 74 edges
7. `buffer` - 28 edges
8. `FakeFS` - 25 edges
9. `FakeFS` - 25 edges
10. `FileHandle` - 23 edges

## Surprising Connections (you probably didn't know these)
- `React Compiler` --semantically_similar_to--> `React Compiler Auto-Memoization`  [INFERRED] [semantically similar]
  README.md → syllabus/react_bible_syllabus.txt
- `React + TypeScript + Vite Template` --conceptually_related_to--> `React 19`  [INFERRED]
  README.md → syllabus/react_bible_syllabus.txt
- `@vitejs/plugin-react` --conceptually_related_to--> `React 19`  [EXTRACTED]
  README.md → syllabus/react_bible_syllabus.txt
- `SPA HTML Entry (index.html)` --conceptually_related_to--> `React + TypeScript + Vite Template`  [INFERRED]
  index.html → README.md
- `React + TypeScript + Vite Template` --conceptually_related_to--> `Vite`  [EXTRACTED]
  README.md → syllabus/vite_bible_syllabus.txt

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Frontend Testing Stack (Unit/Component/E2E)** — syllabus_jest_rtl_bible_syllabus_jest, syllabus_jest_rtl_bible_syllabus_rtl, syllabus_playwright_bible_syllabus_playwright, syllabus_frontend_architecture_bible_syllabus_testing_pyramid [EXTRACTED 1.00]
- **React/Next.js Server-First Rendering Stack** — syllabus_react_bible_syllabus_react_19, syllabus_react_bible_syllabus_react_server_components, syllabus_react_bible_syllabus_server_actions, syllabus_nextjs_bible_syllabus_nextjs, syllabus_react_bible_syllabus_streaming_ssr [EXTRACTED 1.00]
- **Client vs Server State Tooling Split** — syllabus_tanstack_query_bible_syllabus_tanstack_query, syllabus_redux_toolkit_bible_syllabus_redux_toolkit, syllabus_redux_toolkit_bible_syllabus_rtk_query, syllabus_frontend_architecture_bible_syllabus_state_decision_tree [EXTRACTED 1.00]
- **Dual Platform Stack Composition** — src_assets_hero_floating_upper_platform, src_assets_hero_solid_lower_platform, src_assets_hero_vertical_alignment_guides, src_assets_hero_isometric_composition [EXTRACTED 1.00]
- **Vite Logo Composition** — src_assets_vite_logo, src_assets_vite_stylized_v_mark, src_assets_vite_parenthesis_frame, src_assets_vite_purple_cyan_gradient [EXTRACTED 1.00]

## Communities (73 total, 30 thin omitted)

### Community 0 - "Yarn PnP Runtime Core"
Cohesion: 0.02
Nodes (67): assert__default, ASYNC_IMPLEMENTATIONS, buffer__default, crypto, defaultApi, defaultFsLayer, defaultRuntimeState, defaultTime (+59 more)

### Community 1 - "PnP Loader ESM Errors"
Cohesion: 0.07
Nodes (45): BasePortableFakeFS, defaultTime, defaultTimeMs, ERR_INVALID_MODULE_SPECIFIER, ERR_INVALID_PACKAGE_CONFIG, ERR_INVALID_PACKAGE_TARGET, ERR_PACKAGE_IMPORT_NOT_DEFINED, filterOwnProperties() (+37 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.05
Nodes (41): @anthropic-ai/claude-code, @babel/core, babel-plugin-react-compiler, global, oxlint, dependencies, @anthropic-ai/claude-code, global (+33 more)

### Community 14 - "FS Stats and Watchers"
Cohesion: 0.12
Nodes (7): areStatsEqual(), assertStatus(), BigIntStatsEntry, clearStats(), CustomStatWatcher, unwatchFile(), watchFile()

### Community 15 - "Package Exports Resolve"
Cohesion: 0.13
Nodes (25): emitTrailingSlashPatternDeprecation(), filterOwnProperties(), getPackageConfig(), getPackageScopeConfig(), isArrayIndex(), isConditionalExportsMainSugar(), ObjectPrototypeHasOwnProperty(), packageExportsResolve() (+17 more)

### Community 19 - "App TSConfig and DOM"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 21 - "FS Copy Implementation"
Cohesion: 0.17
Nodes (9): convertPath(), copyFile(), copyFileDirect(), copyFileViaIndex(), copyFolder(), copyImpl(), copyPromise(), copySymlink() (+1 more)

### Community 23 - "Node Vite TSConfig"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 24 - "FS Dir and Stat Errors"
Cohesion: 0.26
Nodes (5): convertToBigIntStats(), ENOENT(), ENOTDIR(), makeManager(), opendir()

### Community 25 - "FS Error Codes"
Cohesion: 0.23
Nodes (7): EEXIST(), EINVAL(), EISDIR(), ENOSYS(), ENOTEMPTY(), EROFS(), makeError$1()

### Community 27 - "Frontend Capstone Track"
Cohesion: 0.16
Nodes (16): Capstone: Real-Time Collaborative Canvas Engine, Capstone: HFT Market Analytics Dashboard, Capstone: Observability CI/CD & Automated QA, WebSockets, Yjs (CRDTs), 14-Syllabus Core Toolkit, 50-60 LPA Frontend Architect Track, Next.js Bible Syllabus (+8 more)

### Community 28 - "Next.js React Server Stack"
Cohesion: 0.22
Nodes (14): React Compiler, Capstone: Next.js Multi-Tenant E-Commerce, Edge Middleware, Next.js Four-Layer Caching Architecture, Incremental Static Regeneration (ISR), Next.js (App Router), Static / Dynamic / Streaming Rendering, React 19 (+6 more)

### Community 29 - "Oxlint React Rules"
Cohesion: 0.18
Nodes (10): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, react, typescript (+2 more)

### Community 30 - "WASM Binary Loader"
Cohesion: 0.15
Nodes (13): abort(), addRunDependency(), assert, createWasm(), getBinary(), getValue(), instantiateSync(), intArrayFromBase64() (+5 more)

### Community 31 - "Async FS Copy Flow"
Cohesion: 0.22
Nodes (5): copyFile(), copyFolder(), copyImpl(), copyPromise(), maybeLStat()

### Community 32 - "Vite Webpack Bundlers"
Cohesion: 0.21
Nodes (12): @vitejs/plugin-react, Capstone: Design System & Micro-Frontend Platform, Micro-Frontends, ES Modules & Tree-Shaking, esbuild Pre-Bundling, Hot Module Replacement (Vite HMR), Rollup Production Build (Vite), Vite (+4 more)

### Community 34 - "JS TypeScript Runtime"
Cohesion: 0.22
Nodes (10): SPA HTML Entry (index.html), React + TypeScript + Vite Template, Asynchronous JavaScript (Promises/async-await), Event Loop (Macrotasks vs Microtasks), JavaScript Language & Runtime, Memory Management & Garbage Collection, Web Workers, Generics & Conditional Types (+2 more)

### Community 37 - "Site Favicon Branding"
Cohesion: 0.29
Nodes (10): Alpha mask clipping brand silhouette, Browser tab / app identity icon, Cyan accent highlights (#47bfff), Site favicon (SVG brand mark), Angular zigzag geometric glyph, Lavender soft highlights (#ede6ff), Modern tech / AI product branding aesthetic, Purple-violet brand palette (#863bff, #7e14ff) (+2 more)

### Community 38 - "Frontend Arch and Testing"
Cohesion: 0.22
Nodes (10): BFF (Backend-for-Frontend), Feature-Based Colocation Structure, Frontend Architecture, Monorepo Strategy (Turborepo/Nx), Testing Pyramid, Behavior-Over-Implementation Testing Philosophy, Jest, MSW (Mock Service Worker) (+2 more)

### Community 39 - "State Management Stack"
Cohesion: 0.29
Nodes (10): State Management Decision Tree, Zustand, createSlice / Immer Drafts, Entity Normalization (createEntityAdapter), Redux Toolkit, RTK Query, Cache Invalidation (invalidateQueries), Optimistic Updates (TanStack Query) (+2 more)

### Community 42 - "Social Icon Sprite"
Cohesion: 0.47
Nodes (9): Accent stroke color #aa3bff, Bluesky icon (symbol #bluesky-icon), Brand icon fill #08060d, Discord icon (symbol #discord-icon), Documentation icon (symbol #documentation-icon), GitHub icon (symbol #github-icon), Social/profile icon (symbol #social-icon), icons.svg (SVG icon sprite) (+1 more)

### Community 43 - "Playwright Storybook QA"
Cohesion: 0.25
Nodes (9): Design System Governance, E2E Testing, Page Object Model (POM), Playwright, Visual Regression Testing, Chromatic Visual Testing, Component-Driven Development, Component Story Format (CSF3) (+1 more)

### Community 44 - "Emscripten Time Heap"
Cohesion: 0.36
Nodes (8): allocateUTF8(), _gmtime_r(), LE_HEAP_LOAD_I32(), LE_HEAP_STORE_I32(), lengthBytesUTF8(), _time(), _timegm(), _tzset()

### Community 48 - "Hero Graphic Design"
Cohesion: 0.46
Nodes (8): Black Void Background, Floating Upper Platform, Hero Graphic (Stacked Platforms), Isometric 3D Composition, Layered Stack Metaphor, Purple Metallic Palette, Solid Purple Lower Platform, Vertical Alignment Guides

### Community 49 - "Emscripten Runtime Hooks"
Cohesion: 0.29
Nodes (7): addOnPostRun(), addOnPreRun(), callRuntimeCallbacks(), initRuntime(), postRun(), preRun(), run()

### Community 50 - "Emscripten C Interop"
Cohesion: 0.33
Nodes (7): ccall(), cwrap(), getCFunc(), makeInterface(), stringToUTF8(), stringToUTF8Array(), writeArrayToMemory()

### Community 51 - "Node Options Parsing"
Cohesion: 0.29
Nodes (6): getNodeOptionsEnvArgv(), getOptionValue(), makeApi(), parseArgv(), ParseNodeOptionsEnvVar(), parseOptions()

### Community 55 - "ESM Require Errors"
Cohesion: 0.33
Nodes (6): applyPatch(), ERR_REQUIRE_ESM(), makeError(), MODULE_NOT_FOUND_ERRORS, readPackage(), readPackageScope()

### Community 57 - "React Logo Asset"
Cohesion: 0.33
Nodes (5): Three elliptical electron orbits, Cyan fill #00D8FF, Iconify logos asset, React atom logo, Central nucleus circle

### Community 58 - "Vite Logo Asset"
Cohesion: 0.40
Nodes (6): Dark-Mode Adaptive Fill, Vite Logo, Adaptive Parenthesis Frame, Purple-Cyan Gradient Glow, Stylized V Mark, Vite

### Community 61 - "Framer Motion Animations"
Cohesion: 0.40
Nodes (5): AnimatePresence, Framer Motion, Layout Animations (layout/layoutId), Motion Values (useMotionValue/useTransform), App Router File Conventions

### Community 62 - "Emscripten Heap Resize"
Cohesion: 0.50
Nodes (4): alignUp(), emscripten_realloc_buffer(), _emscripten_resize_heap(), updateGlobalBufferAndViews()

## Knowledge Gaps
- **167 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buffer` connect `FakeFS Buffer IO` to `Yarn PnP Runtime Core`, `FS Lock and Unlink`, `JsZip and LibZip`, `FS Read and FDs`, `FakeFS Change Files`, `FS Open Remap FDs`, `Custom Directory Iterator`, `Archive Busy Close`, `NodePathFS Mapping`, `WASM Binary Loader`?**
  _High betweenness centrality (0.276) - this node is a cross-community bridge._
- **Why does `FakeFS` connect `FakeFS Change Files` to `PnP Loader ESM Errors`, `FS Copy Move Remove`, `FS Lock and Unlink`, `Async FS Copy Flow`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Why does `ProxiedFS` connect `ProxiedFS File Handles` to `Yarn PnP Runtime Core`, `DynamicFS Path Resolve`, `FS Path Mapping`, `FS Map Base IO`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Yarn PnP Runtime Core` be split into smaller, more focused modules?**
  _Cohesion score 0.024369747899159664 - nodes in this community are weakly interconnected._
- **Should `PnP Loader ESM Errors` be split into smaller, more focused modules?**
  _Cohesion score 0.06823529411764706 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._