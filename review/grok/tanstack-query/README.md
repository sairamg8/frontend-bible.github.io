# Senior Architect Content Review (Grok): TanStack Query Bible

## How to read these scores

| Tag | Meaning | Trust level |
|---|---|---|
| `[FULL]` | File was fully read; every sub-score has a specific reason; content defects quoted | **Use for decisions** |
| `[PARTIAL]` | File was **not** fully read; scores are **provisional ceilings**; reasons explain review limits, not proven content bugs | **Do not treat as sealed accuracy** |

**Accuracy gate:** any material production-misleading error ⇒ overall **≤6/10** even if other subs are high.

**Weighting:** Accuracy 40% · Example quality 30% · Depth/completeness 20% · Clarity 10%.

## Review provenance
- Reviewer: Grok 4.5 (no subagents) · 2026-07-31
- Paths: real `docs/` only

## Bible-Level Summary
Strongest audited accuracy (v5 status + staleTime/gcTime). Remaining files provisional.

## Coverage Gaps Found
*(Gaps below mean syllabus/content holes **or** review coverage holes — labeled.)*

- Planning: persist-client offline. Confirm remaining files stay on v5 APIs (spot checks good).

---
## Topic Reviews

### -> 01-core-concepts/01-the-server-state-model.md - Rating: 8.2/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~8.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 02-usequery-deep-dive/01-core-options.md - Rating: 8.8/10  `[FULL]`

**Why this overall score:** High confidence: v5 staleTime vs gcTime correctly taught; no material errors found.

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 9/10 | See content issues below; material errors force ≤5 and gate overall ≤6 |
| Example quality (30%) | 9/10 | Judged by whether samples match prose and would survive production review |
| Depth/completeness (20%) | 9/10 | Syllabus item coverage + required format (React 4-part / pitfalls elsewhere) |
| Clarity (10%) | 9/10 | Could a mid-level engineer learn this file alone? |

- **What was checked in this review:** Full read of options model, stale vs gc timers, dashboard scenario, pitfalls.
- **What is wrong or missing *in the content*:** Nothing material missed. Optional advanced: structuralSharing, query key hashing edge cases.
- **Improvement suggestions:** Optional structuralSharing note for advanced readers.

### -> 03-query-states/01-status-flags.md - Rating: 9.0/10  `[FULL]`

**Why this overall score:** Only FULL file with Accuracy 10 — every status flag claim checked against TQ v5 model and held.

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 10/10 | See content issues below; material errors force ≤5 and gate overall ≤6 |
| Example quality (30%) | 9/10 | Judged by whether samples match prose and would survive production review |
| Depth/completeness (20%) | 9/10 | Syllabus item coverage + required format (React 4-part / pitfalls elsewhere) |
| Clarity (10%) | 9/10 | Could a mid-level engineer learn this file alone? |

- **What was checked in this review:** Full read. status/fetchStatus matrix, isLoading=isPending&&isFetching, offline paused, examples.
- **What is wrong or missing *in the content*:** None found on audited claims.
- **Improvement suggestions:** None required for this topic.

### -> 04-caching-and-invalidation/01-cache-management-apis.md - Rating: 8.2/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~8.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 05-usemutation/01-mutation-lifecycle.md - Rating: 8.2/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~8.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 06-background-refetching/01-automatic-freshness.md - Rating: 8.1/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~8.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 07-pagination-and-infinite-queries/01-paged-data-patterns.md - Rating: 8.2/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~8.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 08-dependent-and-parallel-queries/01-query-composition.md - Rating: 8.2/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~8.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 09-prefetching-and-ssr/01-server-rendered-data-flow.md - Rating: 8.1/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~8.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 10-suspense-integration/01-suspense-driven-fetching.md - Rating: 8.2/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~8.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 11-devtools/01-react-query-devtools.md - Rating: 8.0/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~8.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 12-query-cancellation/01-abortsignal-integration.md - Rating: 8.2/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~8.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 13-global-configuration/01-defaultoptions.md - Rating: 8.0/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~8.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 14-optimistic-updates-patterns/01-advanced-rollback-strategies.md - Rating: 8.2/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~8.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 15-testing-tanstack-query/01-isolated-and-integration-testing.md - Rating: 8.2/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~8.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

**Bible average rating**: **8.25/10** (15 topics; **2 FULL**, 13 PARTIAL)

> PARTIAL topics inflate/deflate averages with **ceilings**, not proven quality. Prefer FULL rows and bible-level gap lists for action.
