---
name: storybook-panels-review
description: Senior-level review of Storybook §3.2/§4-7 (Controls/Actions/Interactions/Visual/a11y) panel deep dives - content quality strong, but package/import surface is 1-2 Storybook major versions stale.
metadata:
  type: project
---

Reviewed the 5 new Storybook panel deep-dive files
([[031-storybook-panels-deep-dive]]) at senior technical level. Full detail
in `review/storybook/README.md` (second dated section).

**Verdict:** doc architecture and technical concepts are accurate and
strong (mechanics diagrams, pitfalls, checklists, cross-panel tables). One
real, verified gap: the content teaches Storybook 7/8-era package
boundaries — `@storybook/addon-essentials` and `@storybook/addon-interactions`
shown as things to install/register in `main.ts`, when both were merged
into core as of Storybook 9.0 (empty stub packages now). CI sections push
`@storybook/test-runner` as the only CI path, omitting the Vitest-based
"Storybook Test" (`@storybook/addon-vitest`) integration that ships in the
recommended install for new 9/10 projects. `@storybook/test` imports and
manual `within(canvasElement)` still work but are superseded by unscoped
`storybook/test` and context-provided `canvas`/`userEvent`.

**Why:** Verified against Storybook's own docs/blog via WebSearch, not
assumed from training data — as of 2026-08-01, Storybook 10.0 has been
stable since Oct 2025.

**How to apply:** Don't rewrite every code example (nothing here is
actually broken). Recommend a short version-note callout, likely in
`03-addons-ecosystem/01-essential-addons.md` since it's the hub linked from
all 5 files, when the user is ready to act on this.

**Status: FIXED (2026-08-01).** Version-note callouts added to all 5 files;
`action()`/`@storybook/addon-actions` swapped for `fn()`/`storybook/actions`
where shown as current; §4.6 in the controls file now uses context
`canvas`/`userEvent`; a11y file's `main.ts` snippet no longer lists
addon-essentials/addon-interactions; both files' CI sections now name the
Vitest-based "Storybook Test" integration alongside test-runner.
`yarn build` clean. Full diff-level detail in `review/storybook/README.md`
"Fixes applied" section.
