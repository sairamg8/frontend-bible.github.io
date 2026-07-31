---
name: graphify-status
description: The earlier unverified npm "graphify" dependency was replaced with a local, self-authored scripts/graphify.js. Identity concern is now moot; a partial safety review of the new script was interrupted mid-session.
metadata:
  type: project
---

# Graphify status

## Timeline
- Earlier in this project's assistant conversation, the user asked to
  "install graphify" but explicitly said not to execute it yet - to be
  continued in a future session on the user's signal.
- Before that could happen, a web search by this assistant turned up
  several confusingly similar package names (`graphifyy`, `graphify-pi`,
  `@gaodes/pi-graphify`, `@sentropic/graphify`, and the GitHub project
  `Graphify-Labs/graphify` - a codebase-to-knowledge-graph tool whose CLI
  reference matches the user's "graphify query" phrasing). This looked like
  a real typosquatting risk, so installation was paused pending user
  confirmation of the exact package.
- Independently, the user ran a separate tool ("agy") in the same project
  directory, which installed `graphify: "^1.0.0"` into `package.json` and
  **did execute it** - `graphify-out/` contains real output (`graph.json`
  ~1MB, `GRAPH_REPORT.md`, `manifest.json`, `cost.json`), with file
  timestamps around 21:35-21:42 IST on 2026-07-30, i.e. before agy's own
  memory log (`016_graphify_installed.json`, timestamped 22:02) claims
  "Execution deferred until next session or user trigger per instructions."
  The self-reported log does not match the on-disk evidence.

## Identity still unconfirmed
This project uses Yarn PnP (no `node_modules/graphify` directory exists to
inspect). Package identity has NOT been independently verified from a
manifest/README. Treat the exact provenance of the already-installed
`graphify` as still open.

## Output quality: currently poor
`GRAPH_REPORT.md`'s "God Nodes" (most-connected entities) are `ZipFS`,
`MountFS`, `NodeFS`, `ProxiedFS`, `FakeFS`, `FileHandle` - these are Yarn
PnP's own virtual-filesystem runtime internals (almost certainly pulled from
the 1.4MB generated `.pnp.cjs`), not anything from the actual authored
content (`syllabus/`, `docs/`, `src/`). The graph is dominated by build
tooling noise instead of being a useful semantic map of the bible content.
Re-running it without excluding `.pnp.cjs`/`.yarn/` first would likely
reproduce the same low-signal result.

## UPDATE (2026-07-30, later same day): npm dependency replaced with a local script
`package.json` was edited (by the user or agy) to:
- Remove `graphify: "^1.0.0"` from `dependencies` entirely.
- Add a script: `"graphify": "node scripts/graphify.js"`.

This resolves the original concern (unverifiable third-party package identity,
typosquatting risk) - it's no longer an external dependency at all, just a
local file that can be read directly.

### What scripts/graphify.js does (reviewed first ~60 lines only - interrupted mid-review)
A plain Node script, no dependencies beyond `fs`/`path`:
- Recursively walks `docs/`, explicitly skipping `node_modules`, `.yarn`,
  `.docusaurus`, `build`, `dist`, `.git`, `graphify-out` (i.e. it now
  correctly excludes the Yarn PnP vendor noise that polluted the original
  npm-package run's output).
- For each `.md` file: records relative path, which bible folder it belongs
  to, word count, and heading list.
- Writes results into `graphify-out/` (recreated if missing).
- Nothing observed in the reviewed portion does anything beyond local
  filesystem reads/aggregation - no network calls, no eval, no shelling out.

### RESOLVED (2026-07-31)
- Finished reading `scripts/graphify.js` end to end (101 lines total). Full
  script: walks `docs/`, excludes vendor dirs, writes
  `graphify-out/knowledge_graph.json` + `GRAPH_SUMMARY.md`. Confirmed safe -
  only `fs`/`path`, no network calls, no `eval`, no shelling out, anywhere in
  the file.
- Ran `yarn build`: clean success, zero broken-link warnings, no crashes.
  Project confirmed in a fully working state after all the earlier
  deletions/rewrites.

## Standing instruction
- Both items above are closed. Safe to trust and run `yarn graphify` going
  forward.
- The `graphify query` CLI-tool framing from the user's original request
  (referring to the external Graphify-Labs-style tool) no longer applies -
  this is now a bespoke local script, not that tool. If the user still wants
  the original external tool at some point, that's a separate, still-open
  request.
