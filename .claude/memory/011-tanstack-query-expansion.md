---
name: tanstack-query-expansion
description: TanStack Query bible expanded from 2 stub files into 15 folders/files, 1:1 with syllabus sections.
metadata:
  type: project
---

# TanStack Query Bible Expansion

Continuing the ecosystem-filling work after [010](010-playwright-expansion.md).

## Structure Created
15 folders, 15 files, 1:1 with `syllabus/tanstack_query_bible_syllabus.txt`'s 15 sections:
01-core-concepts (server state vs client state, QueryClient), 02-usequery-deep-dive
(staleTime vs gcTime - the most common source of confusion, queryKey hierarchy, select),
03-query-states (status vs fetchStatus independent axes, isLoading vs isFetching),
04-caching-and-invalidation (invalidateQueries vs refetchQueries vs setQueryData),
05-usemutation (onMutate/onSuccess/onError/onSettled lifecycle, mutate vs mutateAsync),
06-background-refetching (refetchOnWindowFocus, self-stopping conditional refetchInterval),
07-pagination-and-infinite-queries (useInfiniteQuery accumulation vs keepPreviousData
discrete pagination), 08-dependent-and-parallel-queries (enabled chaining vs useQueries()
for dynamic-count parallel queries), 09-prefetching-and-ssr (dehydrate/HydrationBoundary,
Next.js Server Component prefetch + Client Component hydration), 10-suspense-integration
(useSuspenseQuery eliminating manual isLoading/isError checks), 11-devtools (live cache
inspection for diagnosing invalidation key mismatches), 12-query-cancellation (AbortSignal
threading - TanStack Query cancels its own waiting either way, but signal must be threaded
to actually stop the real network request), 13-global-configuration (defaultOptions,
queries vs mutations retry defaults - mutations should NOT auto-retry due to idempotency
risk), 14-optimistic-updates-patterns (list vs single-item rollback, cancelQueries() to
avoid the background-refetch race), 15-testing-tanstack-query (fresh QueryClient per test,
retry:false for fast failure, MSW at the network layer).

## Housekeeping
- Old stubs `docs/tanstack-query/01-async-state-and-cache.md` and
  `02-mutations-and-optimistic-updates.md` deleted (untracked in git).
- `docs/index.md` link updated to `./tanstack-query/01-core-concepts/01-the-server-state-model.md`.
- `yarn build` verified clean.

## Remaining gap
3 bibles still stub-depth: storybook, framer-motion, frontend-architecture. Continue
picking the next one per standing user instruction.
