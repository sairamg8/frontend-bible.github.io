# 🧭 Recipe: Card Grid That Reflows With `auto-fit` + `minmax` 🟢 `[D]`

> **Priority Badges:** 🟢 `[D]` Daily · 🟡 `[O]` Occasional · 🔴 `[R]` Rare-but-critical

---

## 1. Under-The-Hood Mechanics

`repeat(auto-fit, minmax(MIN, 1fr))` asks the grid engine to fit as many tracks
of at least `MIN` as the container allows, then stretch them (`1fr`) to fill
leftover space, collapsing empty tracks. The item count is never declared —
the engine solves it per container width, so there's no `@media` breakpoint
tied to a specific column count. Wrap `MIN` in `min(100%, X)` so a single item
on a narrow phone doesn't overflow before the container is wide enough to even
fit `X`.

---

## 2. Real-World Engineering Scenario

**Scenario**: Product Grid With an Unpredictable Item Count.
A catalog page renders 3 to 200 products depending on the filter. Media-query
column counts (`2 → 3 → 4` at fixed breakpoints) leave awkward half-empty rows
or overly narrow cards depending on exactly how many items land in the last
row. Switching to `auto-fit` + `minmax` removes the breakpoint logic entirely
— the browser always finds the max column count that keeps every card ≥ the
minimum width, with no JS and no per-breakpoint QA matrix.

---

## 3. Production-Grade Code Example

```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: 1rem;
}

/* Cap growth so cards don't stretch absurdly wide on ultrawide monitors */
.product-grid--capped {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 20rem));
  justify-content: center; /* center the row when tracks hit their max */
}

.product-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.product-card__footer {
  margin-block-start: auto;
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Bare `minmax(16rem, 1fr)` Overflows on Narrow Phones
If the viewport is narrower than `16rem` plus padding, the single remaining
column still can't shrink below `16rem` → horizontal scroll. Always wrap the
minimum in `min(100%, 16rem)`.

### ⚠️ Pitfall 2: `auto-fit` When You Actually Wanted `auto-fill`
`auto-fit` stretches existing items to absorb empty track space; `auto-fill`
leaves the empty tracks as gaps. If cards must stay a fixed width and just
leave whitespace instead of growing, use `auto-fill`.

### ⚠️ Pitfall 3: Unbounded Growth on Ultrawide Displays
`1fr` alone can stretch a 3-item row to full 34" monitor width. Cap with
`minmax(min(100%, 16rem), 20rem)` and `justify-content: center` (or `start`)
so the row doesn't look sparse and oversized.

### ⚠️ Pitfall 4: Mixing `auto-fit` With `grid-auto-flow: dense`
Reordering combined with an item count nobody controls can produce confusing
visual jumps as items resize. Keep `dense` for fixed, curated layouts (bento),
not open-ended reflow grids.
