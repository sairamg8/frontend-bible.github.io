# 🧱 Visual Formatting Model, `display` & Formatting Contexts

## 1. Under-The-Hood Mechanics

Layout is not "draw the CSS." The engine builds a **box tree** from the DOM (plus anonymous boxes), then runs formatting contexts that position those boxes.

### Outer vs Inner Display
Modern `display` is two-axis: **outer** (how the box participates in parent's context: block-level vs inline-level) and **inner** (how children are laid out: flow, flex, grid, table, …).

| Value | Outer | Inner (children) |
|---|---|---|
| `block` | block-level | flow layout |
| `inline` | inline-level | flow (line boxes) |
| `inline-block` | inline-level | flow as a block container |
| `flex` / `inline-flex` | block/inline | flex formatting context |
| `grid` / `inline-grid` | block/inline | grid formatting context |
| `flow-root` | block-level | new **block formatting context** (BFC) |
| `contents` | no box generated for element | children "hoist" into parent |
| `none` | no box, not rendered | descendants gone from box tree |

### Block Formatting Context (BFC)
A BFC is an independent layout region. Floats are contained, margins don't collapse through its boundary, and in-flow content doesn't overlap floats from outside. Established by e.g. `display: flow-root`, `overflow` ≠ `visible`, flex/grid items' internal contexts, `contain: layout`, etc.

### Line Boxes & Inline Layout
Inline content is packed into **line boxes**. `vertical-align`, strut height, and font metrics explain half of "mystery gaps under images" (images are replaced inline elements sitting on the baseline by default).

### `content-visibility`
Not the same as `display: none`. `content-visibility: auto` lets the engine skip rendering work for off-screen subtrees while optionally reserving size via `contain-intrinsic-size` — a performance tool, not a show/hide API.

---

## 2. Real-World Engineering Scenario

**Scenario**: Floated Avatar Escapes a Comment Card Background.
Legacy CMS markup floats an avatar; the parent card's height collapses and the background doesn't wrap the float. Instead of the old clearfix hack, engineers set `display: flow-root` on the card (or convert the row to flex). The card becomes a BFC, contains the float, and margins behave predictably — without `overflow: hidden` clipping focus rings or dropdowns.

---

## 3. Production-Grade Code Example

```css
/* BFC without overflow side effects */
.card {
  display: flow-root; /* contains floats; kills margin collapse through boundary */
  padding: 1rem;
  background: var(--surface);
}

/* Mystery gap under images: baseline alignment */
.media img {
  display: block; /* or vertical-align: middle */
  max-width: 100%;
  height: auto;
}

/* display: contents — wrapper disappears from box tree, children join parent grid/flex */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
}
.auto-grid > .contents-wrap {
  display: contents; /* children become direct grid items */
}

/* Hide vs remove vs defer rendering */
.is-hidden { display: none; }           /* no box, no a11y tree participation typically */
.is-invisible { visibility: hidden; }   /* box remains, takes space */
.offscreen-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px; /* size estimate while skipped */
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: `display: contents` Accessibility Bugs
Historically, some browsers dropped elements with `display: contents` from the accessibility tree (buttons/lists/tables broken). Test with screen readers; prefer real DOM structure for interactive/semantic wrappers when possible.

### ⚠️ Pitfall 2: `inline-block` Whitespace Nodes
Markup newlines between `inline-block` children create text nodes → visible gaps. Flex/grid eliminate this class of bugs.

### ⚠️ Pitfall 3: Using `overflow: hidden` as a BFC Hammer
It works but also clips shadows, sticky descendants, and focus outlines. Prefer `flow-root` when you only need a BFC.

### ⚠️ Pitfall 4: Confusing Outer `inline-flex` With "Make Children Inline"
`inline-flex` only makes the **container** participate as an inline-level box; children still use flex layout, not inline flow.
