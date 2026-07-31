---
name: playwright-expansion
description: Playwright bible expanded from 2 stub files into 15 folders/files, 1:1 with syllabus sections.
metadata:
  type: project
---

# Playwright Bible Expansion

Continuing the ecosystem-filling work after [009](009-jest-rtl-expansion.md) - the natural
next pairing with the just-completed Jest & RTL bible (unit/component testing vs E2E testing).

## Structure Created
15 folders, 15 files, 1:1 with `syllabus/playwright_bible_syllabus.txt`'s 15 sections:
01-core-architecture (Browser→BrowserContext→Page isolation hierarchy, out-of-process
drivers), 02-test-runner (fixtures, test.extend(), projects matrix), 03-locators (lazy
re-resolving Locators vs ElementHandle, strictness mode), 04-actions-and-interactions
(fill() vs pressSequentially() realism gap), 05-auto-waiting-and-assertions (web-first
assertions eliminating manual sleep()-based flakiness, soft assertions), 06-navigation-and-
network (page.route() network-layer interception, HAR replay), 07-authentication-and-state
(storageState + global setup projects avoiding repeated UI logins), 08-fixtures-and-test-
isolation (test-scoped vs worker-scoped, automatic fixtures), 09-visual-and-screenshot-
testing (toHaveScreenshot, masking dynamic content), 10-debugging-tools (Trace Viewer for
post-mortem CI-only failure analysis, Inspector, codegen, UI Mode), 11-parallelism-and-
sharding (workers vs --shard, describe.serial() vs parallel()), 12-component-testing
(mounting in a REAL browser vs jsdom - catches real layout/scroll bugs jsdom masks),
13-api-testing (request fixture for fast setup + focused UI verification), 14-ci-integration
(reporters, retries, official Docker image avoiding dependency drift), 15-advanced-patterns
(Page Object Model, custom matchers, test tagging with --grep).

## Housekeeping
- Old stubs `docs/playwright/01-e2e-testing.md` and `02-network-interception-and-ci-cd.md`
  deleted (untracked in git).
- `docs/index.md` link updated to `./playwright/01-core-architecture/01-browser-automation-model.md`.
- `yarn build` verified clean.

## Remaining gap
4 bibles still stub-depth: tanstack-query, storybook, framer-motion, frontend-architecture.
Continue picking the next one per standing user instruction.
