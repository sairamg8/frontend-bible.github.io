---
name: storybook-expansion
description: Storybook bible expanded from a single stub file into 15 folders/files, 1:1 with syllabus sections.
metadata:
  type: project
---

# Storybook Bible Expansion

Continuing the ecosystem-filling work after [011](011-tanstack-query-expansion.md).

## Structure Created
15 folders, 15 files, 1:1 with `syllabus/storybook_bible_syllabus.txt`'s 15 sections:
01-core-concepts (CSF3, isolation), 02-story-anatomy (meta/named exports/args/argTypes/
render), 03-addons-ecosystem (Controls/Actions/Viewport/Backgrounds), 04-controls-and-args
(auto-inference from TS types, args composition/merging), 05-interaction-testing (play
functions - documentation + test in one artifact), 06-visual-testing (Chromatic per-story
snapshots, TurboSnap for scale), 07-accessibility-testing (a11y addon, automatic per-story
axe-core scans during normal dev, not a separate audit), 08-documentation (autodocs,
docgen TSDoc comments, MDX for prose autodocs can't express), 09-decorators (global vs
story-level scoping, composition order), 10-composition-and-design-systems (design token
stories, variant matrices catching combos individual stories miss, Storybook Composition
across teams), 11-testing-integration (test-runner turning play functions into CI tests via
real Playwright browser), 12-multi-framework-support (renderer vs builder separation),
13-build-and-configuration (main.js stories glob, staticDirs), 14-publishing-and-deployment
(static hosting, Chromatic per-PR publish links), 15-advanced-patterns (outside-in /
component-driven workflow, PR-based merge-blocking visual+interaction gates).

## Housekeeping
- Old stub `docs/storybook/01-design-systems.md` deleted (untracked in git).
- `docs/index.md` link updated to `./storybook/01-core-concepts/01-component-driven-development.md`.
- `yarn build` verified clean.

## Remaining gap
2 bibles still stub-depth: framer-motion, frontend-architecture. Continue picking the next
one per standing user instruction.
