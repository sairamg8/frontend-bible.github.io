---
name: jest-rtl-expansion
description: Jest & RTL bible expanded from a single stub file into 15 folders/files, 1:1 with syllabus sections.
metadata:
  type: project
---

# Jest & RTL Bible Expansion

Continuing the ecosystem-filling work after [008](008-vite-expansion.md). Jest & RTL was
next (natural pairing with testing-integration content already touched in the Vite bible's
Vitest doc).

## Structure Created
15 folders, 15 files, 1:1 with `syllabus/jest_rtl_bible_syllabus.txt`'s 15 sections:
01-jest-core-concepts (test.each, hook cascading), 02-assertions-and-matchers (toBe vs
toEqual vs toStrictEqual - a real bug-catching distinction, asymmetric matchers), 03-mocking
(jest.fn/spyOn/mock differences, fake timers), 04-async-testing (the "forgot to await" test
that can never fail), 05-snapshot-testing (when NOT to use them - reflexive -u approval
risk), 06-coverage-and-configuration, 07-rtl-core-philosophy (behavior vs implementation
detail testing), 08-rtl-queries (getBy/queryBy/findBy + accessibility-first priority order),
09-user-interaction (fireEvent vs user-event realism gap), 10-async-utilities (waitFor/
findBy, act() warnings as a genuine signal not noise), 11-custom-render (provider wrapping +
re-exporting RTL from one module), 12-mocking-network-requests (MSW network-layer
interception vs direct axios/fetch mocking), 13-testing-hooks (renderHook, rerender for
reactivity), 14-accessibility-testing (jest-axe + accessible name matchers), 15-debugging-
tests (screen.debug, logRoles, Testing Playground).

## Housekeeping
- Old stub `docs/jest-rtl/01-unit-testing.md` deleted (untracked in git).
- `docs/index.md` link updated to `./jest-rtl/01-jest-core-concepts/01-test-structure.md`.
- `yarn build` verified clean.

## Remaining gap
5 bibles still stub-depth: playwright, tanstack-query, storybook, framer-motion,
frontend-architecture. Continue picking the next one per standing user instruction.
