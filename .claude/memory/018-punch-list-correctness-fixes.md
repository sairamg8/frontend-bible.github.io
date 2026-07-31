---
name: punch-list-correctness-fixes
description: Applied the 7 quick-fix items from the Grok-authenticated review punch list (memory 017) to real docs files - all build-verified.
metadata:
  type: project
---

# Punch-list correctness fixes (2026-07-31)

User asked to verify `review/` (agy) vs `review/grok/` and update the courses. Independently
re-verified 6 of Grok's flagged bugs by reading the actual files before touching anything -
all confirmed real. Then applied fixes **one bible at a time** (user's explicit instruction
mid-task), `yarn build` clean after all edits.

## Fixed (punch list items 1, 2, 5, 6, 7, 8, 9 from [[review-authentication]])

1. **Next.js fetch default cache (Next 15+)** - `docs/nextjs/04-data-fetching/01-fetch-api-and-fetching-patterns.md`
   + `docs/nextjs/03-rendering-strategies/01-server-client-components-and-rendering-modes.md`.
   Was teaching `force-cache` as the default; Next 15+ defaults to uncached. Added an explicit
   callout, a new Pitfall 4, and fixed the inline example comments.
2. **React `useState` batching example** - `docs/react/01-core-hooks/01-use-state.md`. Split the
   one self-contradictory handler (6 calls, two claimed final states) into two separate handlers
   (`handleDirectClicks` / `handleFunctionalClicks`), each internally consistent.
3. **React `useOptimistic` toast claim** - `docs/react/03-react19-action-hooks/01-use-action-state-and-use-optimistic.md`.
   Prose claimed a toast on failure but the action threw with no catch. Rewrote the action to
   return an error-flagged state instead of throwing, and added the actual inline toast render.
4. **React `cacheSignal` claim** - `docs/react/09-react-19-2-additions/01-use-effect-event-activity-cache.md`.
   Comment claimed auto-abort but `cacheSignal` was never called. Wired `signal: cacheSignal()`
   into the `fetch` call for real.
5. **TypeScript decorators gap** - `docs/typescript/10-classes-and-oop/01-class-based-typing.md`.
   Title promised "& Decorators", body had none. Added a real Stage-3-vs-legacy-`experimentalDecorators`
   mechanics section, a `@logCall` Stage 3 code example, and a pitfall about mixing decorator flavors.
6. **RTK Query optimistic updates** - `docs/redux-toolkit/04-rtk-query/02-cache-management-and-invalidation.md`.
   Had tags/polling but no rollback pattern. Added `onQueryStarted` + `updateQueryData().undo()`
   mechanics, extended the existing `updateUserRole` mutation with a real optimistic patch, and
   added a pitfall for forgetting to `undo()` on rejection.
7. **`keepPreviousData` import** - `docs/frontend-architecture/10-error-handling-and-resilience/01-designing-for-failure.md`.
   Was used without import; added `import { useQuery, keepPreviousData } from '@tanstack/react-query'`.

## Deliberately NOT done this pass (user chose "quick fixes only")

Punch list items 3-4 (author React syllabus §7 + JS syllabus §16 from scratch — see [[industry-ready-patterns-plan]])
remain deferred, largest real gaps still open. Item 10 (optional Web Vitals 1:1 folder restructure)
also untouched - content already exists, just not 1:1-navigable.

## Verdict on the two review packs (unchanged from [[review-authentication]])

`review/grok/*` = trustworthy, real paths, honest variance, all spot-checked claims confirmed
accurate against actual files. `review/*` (agy, non-grok) = reject as a grading artifact; keep
only as a rough bible inventory.
