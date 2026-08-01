# 🗄️ CSS Grid Deep Dive: Tracks, Placement, Subgrid & vs Flex

## 1. Under-The-Hood Mechanics

Grid is a **two-dimensional** layout model: rows and columns form a grid of **cells**; items occupy one or more cells. Tracks (columns/rows) can be explicit (`grid-template-*`) or implicit (`grid-auto-*` when items need more lines).

```
display: grid | inline-grid
grid-template-columns / grid-template-rows  →  explicit track list
grid-template-areas                         →  named rectangular regions
grid-auto-columns / grid-auto-rows          →  size of implicit tracks
grid-auto-flow: row | column | dense        →  auto-placement algorithm
gap / row-gap / column-gap                  →  gutters (special tracks)
```

### Track Sizing Functions
| Function | Meaning |
|---|---|
| `px`, `%`, `fr` | Fixed, percentage of grid container, share of free space |
| `auto` | Roughly max-content but can stretch/shrink depending on context |
| `min-content` / `max-content` | Intrinsic content extremes |
| `minmax(min, max)` | Clamped track size (foundation of responsive grids) |
| `fit-content(limit)` | `min(max-content, max(min-content, limit))` |
| `repeat(n, …)` | Repeat track list |
| `repeat(auto-fill, minmax(…))` | As many tracks as fit; empty tracks remain |
| `repeat(auto-fit, minmax(…))` | Like fill, but empty tracks collapse |

`fr` is distributed **after** fixed/min content requirements are satisfied — nested `minmax(0, 1fr)` is often required so tracks can shrink below content (same family of bugs as flex `min-width: 0`).

### Placement
```css
grid-column: 1 / 3;      /* start line / end line */
grid-column: 1 / span 2;
grid-row: article;
grid-area: header;       /* named area */
```
Line numbers start at 1. Negative lines count from the end of the **explicit** grid.

### Alignment
- **Item**: `justify-self` / `align-self` / `place-self` (within its area)
- **Tracks in container**: `justify-content` / `align-content` / `place-content` (when grid is larger than tracks)
- **Default items**: `justify-items` / `align-items` / `place-items`

### Subgrid
`grid-template-columns: subgrid` (and/or rows) makes a nested grid **adopt parent tracks** (and optionally gaps), so inner cards share column alignment with the outer page grid.

### Auto-Placement & `dense`
Default packs items in order row-by-row. `dense` backfills holes left by spanning items (visual order may diverge from DOM order — a11y caution).

### Masonry (Where Supported) & Progressive Enhancement
True CSS masonry (`grid-template-rows: masonry`) packs items into the **shortest column** each row, like Pinterest — unlike `dense` auto-placement, which only backfills rectangular holes without changing item heights. As of this bible's writing, masonry is shipped/flagged in Firefox and in-progress in the CSS Grid Level 3 spec, but **not** available in Chromium/Safari without a flag — treat it as progressive enhancement, not a baseline layout tool. Multi-column (`columns`) approximates the visual effect but reorders content into column-major order (bad for reading order); a `dense` auto-flow grid with fixed row heights is the safe fallback when items are roughly uniform height.

```css
/* Masonry where supported, auto-fit grid fallback otherwise */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
}
@supports (grid-template-rows: masonry) {
  .gallery {
    grid-template-rows: masonry;
    masonry-auto-flow: next; /* pack order, not size-driven */
  }
}
```

### Grid vs Flex (Decision Rules)
| Need | Prefer |
|---|---|
| 1D row/column of controls, nav, toolbars | **Flex** |
| 2D alignment (rows AND columns matter) | **Grid** |
| Unknown number of equal cards reflowing | Grid `auto-fit` + `minmax` |
| Content-driven main axis, cross-axis centering | Flex |
| Full page app shell with named regions | Grid template areas |
| Both | Nest: outer Grid shell, inner Flex toolbars |

---

## 2. Real-World Engineering Scenario

**Scenario**: Marketing Landing With Bento Feature Grid.
Design has a hero spanning two columns, feature tiles of mixed spans, and a CTA band. Absolute positioning fails responsive. A single grid with `grid-template-columns: repeat(4, 1fr)`, area names for hero/cta, and `grid-column: span 2` for featured tiles adapts via media queries or, better, switches `grid-template-columns` / areas at breakpoints. Card internals use subgrid (where supported) so titles baseline-align across a row.

---

## 3. Production-Grade Code Example

```css
/* Responsive card grid — no breakpoint for column count */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: 1rem;
}

/* App shell with named areas */
.shell {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 16rem 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "nav    main"
    "footer footer";
}
.shell__header { grid-area: header; }
.shell__nav    { grid-area: nav; overflow: auto; }
.shell__main   { grid-area: main; min-width: 0; min-height: 0; overflow: auto; }
.shell__footer { grid-area: footer; }

@media (max-width: 48rem) {
  .shell {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "nav"
      "footer";
  }
}

/* fr tracks that can actually shrink */
.equal-cols {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

/* Auto-placement dense bento */
.bento {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: minmax(8rem, auto);
  grid-auto-flow: dense;
  gap: 0.75rem;
}
.bento__hero { grid-column: span 2; grid-row: span 2; }
.bento__wide { grid-column: span 2; }

/* Subgrid: align form labels across nested groups */
.form {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.75rem 1rem;
}
.form__group {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  gap: inherit;
}
```

```css
/* Alignment */
.center-stage {
  display: grid;
  place-items: center; /* align + justify items */
  min-height: 50vh;
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: `1fr` Won't Shrink Below Content
```css
/* ❌ Implicit min is auto-like content size */
grid-template-columns: 1fr 1fr;

/* ✅ */
grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
```

### ⚠️ Pitfall 2: `auto-fill` vs `auto-fit`
With few items, `auto-fill` leaves empty tracks (items don't stretch to fill); `auto-fit` collapses empty tracks so items expand. Choose based on whether you want leftover whitespace as empty columns or absorbed by items.

### ⚠️ Pitfall 3: Implicit Rows From Auto-Placement Surprises
Spanning items + default `grid-auto-rows: auto` can produce uneven rows. Set `grid-auto-rows: minmax(…, auto)` for denser dashboards.

### ⚠️ Pitfall 4: Percentage Gaps/Tracks and Indefinite Sizes
If the grid container's size is indefinite in an axis, `%` tracks may behave like `auto`. Prefer `fr`, `minmax`, or definite container sizes for predictable dashboards.

### ⚠️ Pitfall 5: Subgrid Support & Fallback
Subgrid is excellent when supported; provide a fallback simple grid/flex for older engines. Don't block critical layout solely on subgrid.

### ⚠️ Pitfall 6: `dense` Breaks Reading Order Assumptions
Visually backfilled holes can place DOM item 5 visually before item 4. Avoid dense for content where reading/focus order matters (articles, forms); fine for photo masonry-like UIs if DOM order is still sensible.

### ⚠️ Pitfall 7: Shipping True Masonry Without a Fallback
`grid-template-rows: masonry` has no Chromium/Safari support at time of writing — gate it behind `@supports`, and make sure the fallback (`auto-fit` grid or `dense` auto-flow) still looks acceptable on its own, not just as an afterthought nobody QAs.
