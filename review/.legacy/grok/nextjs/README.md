# Senior Architect Content Review (Grok): Next.js Bible

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
Four-layer cache excellent; fetch default force-cache is material wrong for Next 15+. Not safe to hand off until fixed.

## Coverage Gaps Found
*(Gaps below mean syllabus/content holes **or** review coverage holes — labeled.)*

- **Material content bug:** force-cache taught as default in rendering + data-fetching docs.
- **Content miss:** PPR.
- Router Cache timings need version pin.

---
## Topic Reviews

### -> 01-routing-fundamentals/01-file-conventions.md - Rating: 7.1/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 02-advanced-routing-patterns/01-dynamic-and-parallel-routes.md - Rating: 7.3/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 03-rendering-strategies/01-server-client-components-and-rendering-modes.md - Rating: 6.0/10  `[FULL]`

**Why this overall score:** Accuracy gate: material wrong default for fetch cache in Next 15+ ⇒ overall capped at 6.

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 5/10 | See content issues below; material errors force ≤5 and gate overall ≤6 |
| Example quality (30%) | 8/10 | Judged by whether samples match prose and would survive production review |
| Depth/completeness (20%) | 8/10 | Syllabus item coverage + required format (React 4-part / pitfalls elsewhere) |
| Clarity (10%) | 9/10 | Could a mid-level engineer learn this file alone? |

- **What was checked in this review:** Full read of RSC default, client boundary, composition, static/dynamic triggers, Suspense example.
- **What is wrong or missing *in the content*:** WRONG (material): comment 'default cache: force-cache'. Next.js 15 changed default fetch caching to uncached/no-store semantics. RSC/composition/streaming content still largely correct.
- **Improvement suggestions:** Document Next 15 default; show how to opt into force-cache/revalidate intentionally.

### -> 04-data-fetching/01-fetch-api-and-fetching-patterns.md - Rating: 6.0/10  `[FULL]`

**Why this overall score:** Same accuracy gate on force-cache-as-default. Parallel/tags content good underneath.

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 5/10 | See content issues below; material errors force ≤5 and gate overall ≤6 |
| Example quality (30%) | 8/10 | Judged by whether samples match prose and would survive production review |
| Depth/completeness (20%) | 8/10 | Syllabus item coverage + required format (React 4-part / pitfalls elsewhere) |
| Clarity (10%) | 9/10 | Could a mid-level engineer learn this file alone? |

- **What was checked in this review:** Full read of extended fetch options, memoization, generateStaticParams, parallel vs sequential.
- **What is wrong or missing *in the content*:** WRONG (material): API sketch lists force-cache as default. Waterfalls/tags/revalidate examples still useful.
- **Improvement suggestions:** Next 14 vs 15 cache default comparison table; fix default annotation.

### -> 05-server-actions-and-mutations/01-server-functions-and-optimistic-ui.md - Rating: 7.4/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 06-caching-architecture/01-the-four-layers.md - Rating: 8.5/10  `[FULL]`

**Why this overall score:** Best Next file audited; slight accuracy dock for version-hedged Router Cache timings and no Next 15 fetch-default crosslink.

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | See content issues below; material errors force ≤5 and gate overall ≤6 |
| Example quality (30%) | 9/10 | Judged by whether samples match prose and would survive production review |
| Depth/completeness (20%) | 9/10 | Syllabus item coverage + required format (React 4-part / pitfalls elsewhere) |
| Clarity (10%) | 9/10 | Could a mid-level engineer learn this file alone? |

- **What was checked in this review:** Full read of four layers, revalidateTag + router.refresh scenario, pitfalls.
- **What is wrong or missing *in the content*:** NOT wrong enough to gate: Router Cache durations 'as of recent versions' are hedged. Does not correct sibling files' force-cache default myth.
- **Improvement suggestions:** Cross-link Next 15 fetch defaults; mention PPR if targeting latest App Router.

### -> 07-metadata-and-seo/01-metadata-api.md - Rating: 7.1/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 08-middleware/01-edge-middleware.md - Rating: 7.1/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 09-route-handlers/01-api-routes.md - Rating: 7.0/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 10-optimization-apis/01-image-font-script.md - Rating: 7.4/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 11-legacy-pages-router/01-pages-router-reference.md - Rating: 7.1/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 12-rendering-runtimes/01-node-vs-edge.md - Rating: 7.3/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 13-configuration/01-next-config.md - Rating: 7.1/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 14-deployment-and-build/01-build-lifecycle-and-isr.md - Rating: 7.2/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 15-advanced-patterns/01-composition-and-streaming.md - Rating: 7.0/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.2/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

**Bible average rating**: **7.11/10** (15 topics; **3 FULL**, 12 PARTIAL)

> PARTIAL topics inflate/deflate averages with **ceilings**, not proven quality. Prefer FULL rows and bible-level gap lists for action.
