# 📍 Positioning, Containing Blocks & Stacking Contexts

## 1. Under-The-Hood Mechanics

`position` changes how a box's offsets are resolved and whether it stays in normal flow.

| Value | In flow? | Offset containing block (typical) |
|---|---|---|
| `static` | yes | n/a (top/left ignored) |
| `relative` | yes (offset paints away) | its normal position |
| `absolute` | no | nearest positioned ancestor (not static), else initial containing block |
| `fixed` | no | viewport (unless an ancestor has transform/filter/perspective/etc. → becomes that) |
| `sticky` | yes until threshold | nearest scroll ancestor; constrained by containing block |

`inset`, `inset-block`, `inset-inline` set offsets with logical awareness. Absolute centering classic: `inset: 0; width/height: max-content; margin: auto` inside a positioned parent.

### Stacking Contexts
Painting order is not "global z-index." A **stacking context** is a local z-order realm. Creators include: root, `position` + `z-index` not auto, `opacity < 1`, `transform` other than none, `filter`, `isolation: isolate`, `fixed`/`sticky` in many cases, `will-change` for certain properties, etc.

Inside a context, children are sorted among themselves; the whole context is painted as a unit in the parent context. That's why `z-index: 9999` "doesn't win" — an ancestor already trapped you in a lower context.

---

## 2. Real-World Engineering Scenario

**Scenario**: Dropdown Clipped and Losing z-index Wars.
A table cell uses `overflow: auto` and `position: relative`. The row action menu is `position: absolute; z-index: 100` but (a) clips inside the scrollport and (b) still paints under a sticky header because the header's stacking context is higher. Fix path: portal/popover top-layer (`popover` attribute or dialog), or reposition with fixed + anchor positioning; stop raising z-index blindly — audit which ancestor created the context (`isolation`, `transform` on motion wrappers are common culprits in React apps).

---

## 3. Production-Grade Code Example

```css
/* Sticky section header inside a scrollable main */
.main {
  overflow: auto;
  max-height: 100dvh;
}
.section__title {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--surface);
  padding-block: 0.5rem;
  /* ensure no ancestor between .main and title has overflow:hidden unexpectedly */
}

/* Absolute center */
.modal-root {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(0 0 0 / 0.4);
}
.modal {
  position: relative; /* for inner absolute close button */
  max-width: min(32rem, 100% - 2rem);
}

/* Control stacking without random 9999 */
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  isolation: isolate; /* create explicit local context */
}
.dropdown {
  position: absolute;
  z-index: 1; /* only competes inside header's context */
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Sticky "Does Nothing"
Causes: ancestor `overflow: hidden/auto` (becomes the scroll container you didn't expect), no room to stick (parent height ≈ sticky element height), `top` not set, parent flex/grid item with wrong overflow. Debug by walking ancestors for overflow and height.

### ⚠️ Pitfall 2: `fixed` Inside `transform`
Any ancestor with `transform`, `filter`, or `perspective` makes `fixed` act like absolute relative to that ancestor — breaks full-viewport overlays inside animated panels.

### ⚠️ Pitfall 3: z-index Only Applies to Positioned/Flex/Grid Items
On `position: static` non-flex/grid items, `z-index` is ignored. Create a positioning or use flex/grid item contexts deliberately.

### ⚠️ Pitfall 4: Opacity/Transform on Wrappers
Framer Motion / CSS transitions often put `transform` on wrappers → new stacking contexts → children can't escape under sibling trees. Plan overlay architecture first (top layer / portal).
