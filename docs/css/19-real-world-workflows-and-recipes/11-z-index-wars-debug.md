# 🔧 Recipe: Diagnosing Z-Index Wars 🟢 `[D]`

> **Priority Badges:** 🟢 `[D]` Daily · 🟡 `[O]` Occasional · 🔴 `[R]` Rare-but-critical

---

## 1. Under-The-Hood Mechanics

`z-index` only ever competes **within the stacking context it was assigned
in**. Raising a value from `100` to `9999` does nothing if an ancestor already
created a lower-priority stacking context — that whole context, however high
its children's z-indexes go, paints as one unit relative to sibling contexts.
The fix is never "add more zeroes"; it's finding **which ancestor created a
context** and either escaping it (portal/top-layer) or raising the ancestor
context's priority instead.

```
Stacking context creators to check for on every ancestor:
  - position != static AND z-index != auto
  - opacity < 1
  - transform / filter / perspective != none
  - isolation: isolate
  - position: fixed / sticky (in most engines)
  - will-change naming a property that itself would create a context
  - mix-blend-mode != normal
```

---

## 2. Real-World Engineering Scenario

**Scenario**: Dropdown Menu Renders Behind a Sibling Card.
A dropdown has `z-index: 9999` and still paints under an unrelated card two
components over. DevTools' Layers/3D view shows the dropdown's trigger button
lives inside a `.card` that has `transform: translateY(0)` (an animation
wrapper left over from a hover effect) — that `transform` created a stacking
context, trapping the dropdown inside the card's paint layer regardless of
its own z-index. Moving the dropdown to a `popover`/portal at the document
root (outside the transformed ancestor) fixes it permanently instead of
re-fighting z-index values every time a new overlay is added nearby.

---

## 3. Production-Grade Diagnostic Workflow

```text
1. In DevTools, select the element that's rendering "behind" and walk up
   its ancestor chain checking Computed styles for the creator list above.
2. The first ancestor (from the misbehaving element upward) that creates a
   stacking context is your real constraint — z-index changes below that
   point can't escape it.
3. Decide: raise the ANCESTOR context's priority among its own siblings,
   or physically move the overlay out of that ancestor (portal, popover
   top layer, <dialog>).
4. For genuinely global overlays (modals, toasts, menus), prefer the
   Popover API / <dialog> top layer over z-index entirely — it always
   paints above normal stacking contexts without a number to maintain.
```

```css
/* Escape the fight instead of winning it: top-layer overlay */
[popover] {
  margin: auto; /* combine with inset for centering */
}
```

```html
<button popovertarget="menu">Actions</button>
<div id="menu" popover>…</div>
```

```css
/* When you must stay in normal layers, isolate deliberately */
.header {
  position: sticky;
  top: 0;
  isolation: isolate; /* explicit local stacking context, documents intent */
  z-index: 10;         /* only competes with OTHER siblings of .header */
}
.header .dropdown {
  position: absolute;
  z-index: 1;          /* only competes inside .header's own context */
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Escalating Z-Index Numbers Without Finding the Context
`z-index: 999999` is a symptom of never having found the actual trapping
ancestor. If a number that high is "needed," the real fix is architectural
(portal/top-layer), not a bigger number.

### ⚠️ Pitfall 2: Animation Wrappers Silently Creating Contexts
`transform`, `filter`, and `will-change: transform` on hover/motion wrappers
(common with Framer Motion or CSS transitions) create stacking contexts even
when idle — audit these first, they're the most common accidental cause.

### ⚠️ Pitfall 3: `isolation: isolate` Used Everywhere "Just in Case"
Sprinkling `isolation: isolate` defensively creates many small contexts that
then need their own z-index coordination — use it deliberately on components
that truly need to own their internal stacking (headers, cards with hover
overlays), not globally.

### ⚠️ Pitfall 4: Overlay z-index Fighting a Portal-Free Modal
A modal rendered inline (not portaled to `<body>`) inherits every ancestor's
stacking context — including ones added later by unrelated feature work. A
true portal or the Popover/`<dialog>` top layer removes this class of bug
permanently instead of requiring re-audits per release.
