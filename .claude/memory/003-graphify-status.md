---
name: graphify-status
description: Graphify was installed and executed by "agy" (not this assistant) before its identity was ever confirmed. Current output is low-value. Do not re-run or trust until the user confirms package identity.
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

## Standing instruction
- Do not re-run, reconfigure, or rely on graphify output until the user
  explicitly confirms the intended package/identity and gives the go-ahead.
- Once confirmed and actually wanted, invoke it as `graphify query` per the
  user's original instruction, and exclude generated/vendor paths
  (`.pnp.cjs`, `.yarn/`, `node_modules`, `graphify-out/` itself) from the
  scan first.
