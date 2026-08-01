# 📦 Box Model, Sizing & Logical Properties

## 1. Under-The-Hood Mechanics

Every element generates zero or more **boxes**. For a typical block, the box has content, padding, border, and margin. How `width`/`height` interact with padding and border depends on `box-sizing`:

| `box-sizing` | What `width` means |
|---|---|
| `content-box` (initial) | Width of **content only**; padding+border add outside |
| `border-box` | Width includes **content + padding + border** |

```
content-box:  total = width + padding + border + margin
border-box:   total = width + margin  (padding/border eat into width)
```

### min/max & Preferred Size
Used size is clamped: `min-width ≤ used ≤ max-width` (same for height). In Flex/Grid, `min-width: auto` (the default on items) often means "don't shrink below content size" — the root of many overflow bugs (see Flexbox section).

### Margin Collapse
**Vertical** margins of adjoining block-level boxes in the same BFC can collapse into one margin (the larger wins). Collapse does **not** happen between flex/grid items, or once a BFC boundary intervenes (`overflow` other than visible, `display: flow-root`, flex/grid containers, etc.).

### Logical Properties
Physical properties (`margin-left`, `width`) assume horizontal-TB LTR. Logical properties map to the **writing mode**:

| Physical | Logical |
|---|---|
| `width` / `height` | `inline-size` / `block-size` |
| `margin-left/right` | `margin-inline-start/end` |
| `padding-top/bottom` | `padding-block-start/end` |
| `top/right/bottom/left` | `inset-block/inline-*` |

### `aspect-ratio` & Overflow
`aspect-ratio` gives a preferred ratio used when one axis is auto — see the
[dedicated aspect-ratio & object-fit deep dive](./02-aspect-ratio-object-fit-and-intrinsic-sizing.md)
for the full sizing-algorithm mechanics. `overflow` decides scrollports: `clip` (no scroll, no programmatic scroll) vs `hidden` vs `auto`/`scroll`. `overflow-anchor` can fight intentional scroll position changes.

---

## 2. Real-World Engineering Scenario

**Scenario**: Card Grid Where Borders/Padding Blow Past the Column Width.
Designers specify 320px cards with 16px padding and 1px borders. With `content-box`, real width becomes 320 + 32 + 2 = 354px and the last card wraps early or overflows. A single global `*, *::before, *::after { box-sizing: border-box; }` (or inheritance from `html { box-sizing: border-box; } * { box-sizing: inherit; }`) makes `width: 320px` mean the full outer box — matches design tools and human intuition.

---

## 3. Production-Grade Code Example

```css
/* Universal border-box baseline */
html { box-sizing: border-box; }
*, *::before, *::after { box-sizing: inherit; }

.card {
  inline-size: min(100%, 20rem);
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  /* media stays ratio-stable → fewer CLS jumps */
}

.card__media {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 0.375rem;
}

.card__media img {
  block-size: 100%;
  inline-size: 100%;
  object-fit: cover;
  display: block;
}

/* Logical margins: flip correctly in RTL without extra rules */
.stack > * + * {
  margin-block-start: 1rem; /* not margin-top only */
}

/* Scroll container with stable gutter to reduce layout shift */
.panel {
  overflow: auto;
  scrollbar-gutter: stable;
  max-block-size: 70vh;
}
```

```css
/* min/max interaction */
.sidebar {
  inline-size: 100%;
  max-inline-size: 20rem;
  min-inline-size: 12rem;
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Percentage Height "Does Nothing"
```css
/* ❌ height: 100% needs a definite height on the containing block */
.child { height: 100%; }

/* ✅ Prefer flex/grid stretch, or min-height on ancestors, or dvh for viewport shells */
.shell { min-height: 100dvh; display: grid; grid-template-rows: auto 1fr auto; }
.main { min-height: 0; } /* allow grid child to shrink / scroll */
```

### ⚠️ Pitfall 2: Margin Collapse Between Parent and First Child
A parent's top margin and the first child's top margin can collapse *through* the parent, "pulling" background with unexpected gaps. Fix with padding on parent, `display: flow-root`, or flex/grid.

### ⚠️ Pitfall 3: `100vw` Includes Scrollbar Width
`100vw` is the viewport width **including** the scrollbar gutter on some engines, causing horizontal overflow. Prefer `100%` of a full-width parent or `100dvw` carefully; for full-bleed, modern grid full-bleed patterns beat `100vw` hacks.

### ⚠️ Pitfall 4: Mixing Physical and Logical Blindly in RTL
Using `margin-left` for "spacing after icon" breaks in RTL. Prefer `margin-inline-start` for start-edge spacing so layout mirrors correctly when `dir="rtl"`.
