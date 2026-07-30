# Project Instructions

This project maintains a collection of in-depth "bible" reference files for
frontend technologies (`syllabus/*.txt`), plus a documentation site built on
top of them.

## Persistent memory (.claude/memory/)
This project keeps its own durable, file-based memory - separate from any
personal assistant memory system.
- At the START of a session, read ONLY `.claude/memory/index.md`.
- `index.md` lists every memory file with a one-line summary. Use it to
  decide which file(s), if any, are relevant to the current request.
- Do NOT bulk-read every memory file. Load a specific file only when the
  user's request or the task at hand relates to what its summary describes.
- When saving new progress or a decision: write the full detail to a new
  (or existing, if extending) file under `.claude/memory/`, then add/update
  its one-line entry in `index.md`. Never write memory content directly
  into `index.md` - it is an index, not a memory.

## Graphify
- A package named `graphify` (`^1.0.0`) is present in `package.json` and has
  already produced output in `graphify-out/` - installed and executed by a
  separate tool ("agy"), not by this assistant.
- Its exact identity/publisher has not been independently verified. Current
  output is low-value (indexed Yarn PnP runtime internals, not project
  content). Full details: `.claude/memory/003-graphify-status.md`.
- Do not re-run, reconfigure, or rely on graphify output until the user
  explicitly confirms the package identity and gives the go-ahead. When
  actually used, invoke it as `graphify query` per the user's instruction,
  and exclude `.pnp.cjs`/`.yarn/`/`node_modules`/`graphify-out/` from scans.

## Bible file format convention
`syllabus/*.txt` files follow a consistent format: ASCII header block,
numbered `SECTION N:` dividers on dashed lines, sub-numbered concept items
with one-line descriptions. Match this when adding new bibles, unless the
user asks for a different treatment (e.g. `frontend_architecture_bible_syllabus.txt`
is deliberately decisions/tradeoffs-focused instead of an API catalog).
