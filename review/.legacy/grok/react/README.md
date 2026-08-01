# Senior Architect Content Review (Grok): React Bible

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
Solid Fiber/hooks depth for React 19/19.2 on existing files, with a real 4-part template. Not trustworthy as a complete React bible: syllabus Section 7 has zero docs; useState batching example is execution-misleading. Prior pack ~9.56 with Accuracy 10/10 everywhere is rejected.

## Coverage Gaps Found
*(Gaps below mean syllabus/content holes **or** review coverage holes — labeled.)*

- **Syllabus §7 missing entirely** (industry hooks/patterns: debounce, compound components, error boundaries, portals, virtualization, …).
- **Content bug:** `01-use-state.md` batching comments contradict single-handler execution (score gated).
- **Thin + wrong claim:** `01-use-id-and-use-debug-value.md` (~334 words); 'WCAG AAA' overclaim.
- **Unsupported claim:** `cacheSignal` described but not used in 19.2 doc.
- **Planning (not syllabus):** React Compiler; Server Action security depth.

---
## Topic Reviews

### -> 01-core-hooks/01-use-state.md - Rating: 6.0/10  `[FULL]`

**Why this overall score:** Accuracy gate applied: one material teaching error caps overall at ≤6 even though the rest of the file is solid. Weighted raw would be higher; gate wins.

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 6/10 | See content issues below; material errors force ≤5 and gate overall ≤6 |
| Example quality (30%) | 8/10 | Judged by whether samples match prose and would survive production review |
| Depth/completeness (20%) | 8/10 | Syllabus item coverage + required format (React 4-part / pitfalls elsewhere) |
| Clarity (10%) | 9/10 | Could a mid-level engineer learn this file alone? |

- **What was checked in this review:** Full read. Mentally executed batching sample; verified lazy initializer, Object.is mutation bailout, conditional-hooks crash claim, Fiber linked-list narrative.
- **What is wrong or missing *in the content*:** MISSED BY CONTENT / WRONG: In one handleClick, three setCount(count+1) then three functional updates comment 'Final state: 1' then 'Final state: 3'. If all six run in one handler, React applies the queue in order → final is 4, not 1 or 3. Otherwise: lazy init, mutation, stale closure, hook-order claims look correct.
- **Improvement suggestions:** Split into TWO handlers (direct-only vs functional-only) so comments match execution; or show a single combined queue and state the true final value (4).

### -> 01-core-hooks/02-use-effect.md - Rating: 8.6/10  `[FULL]`

**Why this overall score:** No material errors. Docked slightly on examples (data-fetch-in-effect without modern alternative) and depth (Strict Mode not deeply diagrammed).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 9/10 | See content issues below; material errors force ≤5 and gate overall ≤6 |
| Example quality (30%) | 8/10 | Judged by whether samples match prose and would survive production review |
| Depth/completeness (20%) | 8/10 | Syllabus item coverage + required format (React 4-part / pitfalls elsewhere) |
| Clarity (10%) | 9/10 | Could a mid-level engineer learn this file alone? |

- **What was checked in this review:** Full read. Timeline Render→Commit→Paint→Passive; cleanup order; dep Object.is; WebSocket example.
- **What is wrong or missing *in the content*:** CONTENT GAP (not wrong): production scenario is still classic effect-for-fetch/socket without steering readers to TanStack Query / RSC for server data — easy for juniors to over-copy.
- **Improvement suggestions:** Add a short 'when NOT to use useEffect for data' callout pointing at TQ/RSC.

### -> 01-core-hooks/03-use-reducer.md - Rating: 7.6/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.8/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 01-core-hooks/04-use-layout-effect-and-insertion-effect.md - Rating: 7.7/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.8/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 02-performance-hooks/01-use-memo-and-use-callback.md - Rating: 7.7/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.8/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 02-performance-hooks/02-use-transition-and-use-deferred-value.md - Rating: 7.8/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.8/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 03-react19-action-hooks/01-use-action-state-and-use-optimistic.md - Rating: 6.8/10  `[FULL]`

**Why this overall score:** Prose/example mismatch on failure path tanks example quality; accuracy not a hard gate fail but incomplete.

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | See content issues below; material errors force ≤5 and gate overall ≤6 |
| Example quality (30%) | 6/10 | Judged by whether samples match prose and would survive production review |
| Depth/completeness (20%) | 7/10 | Syllabus item coverage + required format (React 4-part / pitfalls elsewhere) |
| Clarity (10%) | 8/10 | Could a mid-level engineer learn this file alone? |

- **What was checked in this review:** Full read of action/optimistic lifecycle prose + cart example + pitfalls.
- **What is wrong or missing *in the content*:** MISSED BY CONTENT: Prose says failure rolls back AND shows a toast — code throws ~15% with NO toast/error UI. Optimistic association with transitions is only in pitfalls, not happy path.
- **Improvement suggestions:** Implement error surface or delete toast claim; demonstrate setOptimistic inside the transition/action path.

### -> 03-react19-action-hooks/02-use-form-status-and-use.md - Rating: 7.9/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.8/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 04-context-and-external-stores/01-use-context-and-use-sync-external-store.md - Rating: 7.9/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.8/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 05-dom-and-refs/01-use-ref-and-use-imperative-handle.md - Rating: 8.6/10  `[FULL]`

**Why this overall score:** Accurate React 19 ref-as-prop + cleanup; slightly short depth vs syllabus breadth but no material errors.

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 9/10 | See content issues below; material errors force ≤5 and gate overall ≤6 |
| Example quality (30%) | 8/10 | Judged by whether samples match prose and would survive production review |
| Depth/completeness (20%) | 8/10 | Syllabus item coverage + required format (React 4-part / pitfalls elsewhere) |
| Clarity (10%) | 9/10 | Could a mid-level engineer learn this file alone? |

- **What was checked in this review:** Full read. React 19 ref prop, cleanup return from ref callback, useImperativeHandle video player, render-phase mutation pitfall.
- **What is wrong or missing *in the content*:** NOT MISSING (prior pack wrong): forwardRef deprecation and cleanup already present. Minor: cleanup-on-ref-identity-change not shown separately from unmount.
- **Improvement suggestions:** Optional note when ref callback identity changes mid-lifetime.

### -> 06-server-components-and-actions/01-rsc-architecture-and-directives.md - Rating: 7.6/10 **provisional**  `[PARTIAL]`

**Why this overall score:** This is a **provisional ceiling**, not a sealed content grade. Overall sits in the mid/high-7s because the corpus template usually has mechanics + scenario + code + pitfalls, but **no line-by-line claim verification** was done for this file. Accuracy is hard-capped (typically ≤7–8) precisely because unverified ≠ 10.
This bible's provisional baseline was ~7.8/10 before tiny path-based spread (not a quality ranking between siblings).

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 8/10 | **Cap only** — claims not verified line-by-line; cannot be 10 |
| Example quality (30%) | 8/10 | **Cap only** — samples not mentally executed end-to-end |
| Depth/completeness (20%) | 8/10 | **Cap only** — template presence assumed from corpus pattern, not confirmed |
| Clarity (10%) | 8/10 | **Cap only** — corpus usually readable; not individually graded |

- **What was checked in this review:** Path exists on disk under docs/; included in syllabus folder mapping; included in automated red-flag greps (legacy APIs / common wrong claims). **Not** fully read end-to-end.
- **What this review missed (review gap, not proven content gap):** **What THIS REVIEW missed (not necessarily what the doc missed):** every factual claim, mental execution of every code sample, and full syllabus-item completeness for this specific file. No specific content defect is asserted here — absence of evidence is not evidence of absence.
- **Improvement suggestions:** Requires a full adversarial re-read before treating as sealed. Until then do not cite this score as proof the topic is accurate.

### -> 07-react-dom-apis/01-client-server-and-resource-apis.md - Rating: 8.6/10  `[FULL]`

**Why this overall score:** Broad correct coverage of client/server/resource APIs; clarity docked only for length/density.

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 9/10 | See content issues below; material errors force ≤5 and gate overall ≤6 |
| Example quality (30%) | 8/10 | Judged by whether samples match prose and would survive production review |
| Depth/completeness (20%) | 9/10 | Syllabus item coverage + required format (React 4-part / pitfalls elsewhere) |
| Clarity (10%) | 8/10 | Could a mid-level engineer learn this file alone? |

- **What was checked in this review:** Full read of mounting, streaming SSR, preload/preinit, portal/flushSync, string SSR APIs.
- **What is wrong or missing *in the content*:** No material factual error found. Density may bury pitfalls for interview skimming.
- **Improvement suggestions:** Optional split: resource APIs vs streaming SSR as separate pages.

### -> 08-id-accessibility-debug/01-use-id-and-use-debug-value.md - Rating: 6.4/10  `[FULL]`

**Why this overall score:** Thin file + incorrect AAA claim + shallow useDebugValue; not accuracy-gate material but fails completeness for the syllabus item.

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | See content issues below; material errors force ≤5 and gate overall ≤6 |
| Example quality (30%) | 6/10 | Judged by whether samples match prose and would survive production review |
| Depth/completeness (20%) | 5/10 | Syllabus item coverage + required format (React 4-part / pitfalls elsewhere) |
| Clarity (10%) | 8/10 | Could a mid-level engineer learn this file alone? |

- **What was checked in this review:** Full read (~334 words). useId hydration claim, form example, list-key pitfall, useDebugValue usage.
- **What is wrong or missing *in the content*:** WRONG: labels basic htmlFor/aria-describedby as 'WCAG AAA'. MISSED: useDebugValue formatter function form; multi-id aria-describedby/errormessage patterns; calling useId inside map also violates Rules of Hooks (only keys mentioned).
- **Improvement suggestions:** Drop AAA claim; add formatter example; expand multi-control ARIA ids.

### -> 09-react-19-2-additions/01-use-effect-event-activity-cache.md - Rating: 7.1/10  `[FULL]`

**Why this overall score:** Core useEffectEvent model good; cacheSignal claim unsupported by code; multi-API cram limits depth.

| Sub-score | Score | Why this sub-score |
|---|---:|---|
| Accuracy (40%) | 7/10 | See content issues below; material errors force ≤5 and gate overall ≤6 |
| Example quality (30%) | 7/10 | Judged by whether samples match prose and would survive production review |
| Depth/completeness (20%) | 7/10 | Syllabus item coverage + required format (React 4-part / pitfalls elsewhere) |
| Clarity (10%) | 8/10 | Could a mid-level engineer learn this file alone? |

- **What was checked in this review:** Full read. useEffectEvent, Activity modes, cache() snippet, imports.
- **What is wrong or missing *in the content*:** MISSED BY CONTENT: Comment claims cacheSignal auto-aborts fetches but snippet never imports/uses cacheSignal or passes signal to fetch. Activity stable import path should be version-pinned to React 19.2.7.
- **Improvement suggestions:** Wire cacheSignal into fetch AbortSignal or remove the claim.

**Bible average rating**: **7.59/10** (14 topics; **7 FULL**, 7 PARTIAL)

> PARTIAL topics inflate/deflate averages with **ceilings**, not proven quality. Prefer FULL rows and bible-level gap lists for action.
