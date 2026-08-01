# 🔧 Recipe: Diagnosing "Sticky That Refuses to Stick" 🟢 `[D]`

> **Priority Badges:** 🟢 `[D]` Daily · 🟡 `[O]` Occasional · 🔴 `[R]` Rare-but-critical

---

## 1. Under-The-Hood Mechanics

`position: sticky` toggles between relative and fixed-like behavior **within
its nearest scroll container**, constrained by its containing block. It fails
silently (no console error, element just scrolls away) when any of four
conditions aren't met: an offset property (`top`/`bottom`/etc.) isn't set, an
ancestor clips or scrolls in a way that traps it early, the containing block
isn't tall enough to give it room to "stick," or an ancestor's `overflow`
turns it into an unintended scroll container the element never escapes.

```
Sticky needs, simultaneously:
  1. top (or another inset) set to a value, not auto
  2. No ancestor between it and its scroll container has overflow: hidden/auto/scroll
     (unless that's the intended scroll container)
  3. The containing block (usually the parent) is taller than the sticky element,
     so there's room to "travel" before sticking
```

---

## 2. Real-World Engineering Scenario

**Scenario**: Sticky Section Header Scrolls Away Instead of Sticking.
A docs page has `.section > h2 { position: sticky; top: 0; }` but the
headers just scroll normally. DevTools reveals a `.content-wrapper` ancestor
with `overflow-x: auto` (added for a horizontal code-block scroll fix months
earlier) — that ancestor became the actual scroll container, and the sticky
header's containing block ends at each `.section`, which is exactly the
element's own height, leaving no room to stick. Removing the unnecessary
`overflow-x` from the wrapper (moving it to just the code blocks) fixes it.

---

## 3. Production-Grade Diagnostic Workflow

```text
1. Confirm an offset is set: computed `top` (or bottom/left/right) must not be `auto`.
2. Walk every ancestor up to the scroll container in DevTools:
   any `overflow` other than `visible` (including `overflow-x`/`overflow-y` alone)
   creates a new scroll container / clipping boundary.
3. Check the immediate parent's height: if parent height ≈ sticky element height,
   there's no scroll distance left for "sticky" to visibly do anything.
4. Check for `display: contents` or transform on an ancestor — both can change
   containing-block math in ways that break sticky.
5. Confirm the sticky element isn't inside a flex/grid item with default
   `align-items: stretch` collapsing its effective height to content size only.
```

```css
/* Common fix shape */
.section {
  /* ensure the containing block has real height for the header to travel within */
  min-height: 12rem;
}
.section > h2 {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--surface); /* avoid content showing through while stuck */
}

/* If an ancestor needs its own scroll for unrelated reasons,
   scope overflow tightly instead of on a shared wrapper */
.code-block-scroll {
  overflow-x: auto; /* not on .content-wrapper */
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: `overflow: hidden` Added for an Unrelated Fix
The most common real-world cause — someone added `overflow: hidden`/`auto` on
a distant ancestor to fix a scrollbar or clipping issue, unaware it silently
neutralizes every sticky descendant. Grep ancestors for `overflow` before
debugging sticky any other way.

### ⚠️ Pitfall 2: Sticky Inside a Flex/Grid Item Without Height
If the sticky element's direct parent is a flex/grid item that shrinks to
content, there's no extra height for the sticky element to travel through
before hitting its boundary — it "sticks" for zero pixels, looking broken.

### ⚠️ Pitfall 3: Missing Background on a Sticky Header
Sticky isn't visually "wrong," but content scrolls underneath and shows
through a transparent header — looks like a bug, isn't one. Always set an
opaque `background` on sticky headers/cells.

### ⚠️ Pitfall 4: Testing Only in a Browser That Handles Table Sticky Differently
`position: sticky` on `<th>`/`<thead>` had inconsistent engine support
historically for sticking to more than one edge at once (e.g. top **and**
left for a frozen corner cell) — verify frozen-corner patterns in your actual
target browser matrix, not just Chrome.
