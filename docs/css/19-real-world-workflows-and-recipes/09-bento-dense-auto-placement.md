# 🧭 Recipe: Magazine / Bento Layout With Dense Auto-Placement 🟢 `[D]`

> **Priority Badges:** 🟢 `[D]` Daily · 🟡 `[O]` Occasional · 🔴 `[R]` Rare-but-critical

---

## 1. Under-The-Hood Mechanics

A bento grid mixes tile sizes (some span 2 columns, some span 2 rows, some
both) inside a uniform track grid. Default auto-placement packs items
strictly in DOM order and leaves holes when a spanning item doesn't fit the
next available cell; `grid-auto-flow: dense` backfills those holes with later
items, producing the tight "no gaps" bento look — at the cost of visual order
sometimes diverging from DOM order (see Pitfall 1 and the Grid deep dive's
own dense pitfall).

---

## 2. Real-World Engineering Scenario

**Scenario**: Marketing Feature Grid With One Hero Tile and Several Small Tiles.
Design specifies a hero tile spanning 2×2, two wide tiles spanning 2×1, and
several 1×1 tiles filling the rest — with no gaps, regardless of exactly how
many small tiles marketing adds later. `grid-auto-flow: dense` on a fixed
column grid with `grid-auto-rows` handles this without manually computing
placement for every tile whenever content changes.

---

## 3. Production-Grade Code Example

```css
.bento {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: minmax(8rem, auto);
  grid-auto-flow: dense;
  gap: 0.75rem;
}

.bento__tile {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1rem;
  border-radius: 0.75rem;
  min-width: 0;
}

/* Explicit spans — decorate specific tiles, everything else is 1x1 */
.bento__tile--hero { grid-column: span 2; grid-row: span 2; }
.bento__tile--wide { grid-column: span 2; }
.bento__tile--tall { grid-row: span 2; }

@media (max-width: 40rem) {
  .bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .bento__tile--hero { grid-column: span 2; grid-row: span 2; }
  .bento__tile--wide { grid-column: span 2; }
}
```

```html
<div class="bento">
  <article class="bento__tile bento__tile--hero">…</article>
  <article class="bento__tile">…</article>
  <article class="bento__tile bento__tile--wide">…</article>
  <article class="bento__tile bento__tile--tall">…</article>
  <article class="bento__tile">…</article>
</div>
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: `dense` Reorders Content Visually, Not Just Spatially
A screen reader or keyboard user still moves through tiles in DOM order —
tile 6 can render visually before tile 3. Reserve `dense` bento layouts for
marketing/gallery content where visual order isn't load-bearing; avoid it for
sequential or task-driven content.

### ⚠️ Pitfall 2: Spanning Tiles Wider Than the Grid
A `grid-column: span 2` tile inside a 2-column mobile grid still fits, but
`span 3` inside a 2-column grid overflows into the implicit grid unexpectedly.
Redeclare spans per breakpoint (as shown above) rather than assuming they
scale down safely.

### ⚠️ Pitfall 3: Uneven Row Heights From `auto` Sizing
`grid-auto-rows: auto` alone lets tall content stretch a whole row band,
throwing off the "uniform grid" look. Set a `minmax(MIN, auto)` floor, or a
fixed row height if the design calls for perfectly square cells.

### ⚠️ Pitfall 4: Treating This as a General-Purpose Component Grid
Bento/dense is for a **curated, fixed set** of differently-sized tiles a
designer laid out intentionally — not for an open-ended reflowing list. For
"unknown number of same-size cards," use the
[auto-fit + minmax recipe](./04-card-grid-auto-fit-and-minmax.md) instead.
