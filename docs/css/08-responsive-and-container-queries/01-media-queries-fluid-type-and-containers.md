# 📱 Responsive Design, Fluid Type & Container Queries

## 1. Under-The-Hood Mechanics

### Viewport Media Queries
`@media (width >= 48rem)` (modern range syntax) or `min-width` mobile-first queries adapt layout to the **viewport**. Also query user preferences: `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`, `hover`, `pointer`.

### Fluid Sizing
Instead of stair-step font sizes at breakpoints:
```css
font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
```
`clamp(MIN, PREFERRED, MAX)` + viewport/`cqi` units create continuous scales. The browser picks whichever of the three values is in the middle on every resize — no `@media` breakpoint, no JS resize listener, no per-screen overrides. This is the mechanism that answers "how do I not write a font-size for every screen": you write the formula **once**, and it interpolates for every width in between.

### The Interpolation Math Behind the Preferred Value
The middle argument of `clamp()` isn't a value you eyeball — it's a linear equation solved between two points: *(minimum viewport, minimum size)* and *(maximum viewport, maximum size)*.

```
slope        = (maxSize - minSize) / (maxViewport - minViewport)
intercept    = minSize - minViewport * slope
preferred    = intercept + (slope * 100)vw
```

Worked example — body text should be `1rem` at a `320px` (`20rem`) viewport and `1.125rem` at a `1280px` (`80rem`) viewport, all math done in `rem` (`1rem = 16px` baseline):

```
slope     = (1.125 - 1) / (80 - 20)        = 0.125 / 60  = 0.002083rem per rem-of-viewport
intercept = 1 - 20 * 0.002083               = 1 - 0.04167 = 0.9583rem
preferred = 0.9583rem + 0.2083vw
```

```css
font-size: clamp(1rem, 0.9583rem + 0.2083vw, 1.125rem);
```

Below `20rem` viewport width it locks to `1rem`; above `80rem` it locks to `1.125rem`; in between it's a straight line, recalculated continuously — not stepped. You only ever run this formula twice per scale step (once when you set the min/max design targets), never per breakpoint. Tools like Utopia's fluid-type calculator do this arithmetic for you, but knowing the formula means you can hand-tune a single step without regenerating the whole scale.

**Why `rem`, not `px`, in the preferred expression**: mixing `vw` (viewport-relative) with `rem` (root-font-relative) rather than `px` keeps the result inside the user's zoom/base-font-size chain — see Pitfall 6.

### Building a Fluid Type Scale (Tokens, Not Per-Breakpoint Rules)
The scalable pattern is a **modular scale**: pick a ratio (1.125–1.333 is typical for UI text), generate every step as a `clamp()` custom property once, then every heading/body/caption just reads a token — nobody writes a `font-size` rule per component or per screen ever again:

```css
:root {
  /* ratio 1.2, min viewport 20rem, max viewport 80rem */
  --step--2: clamp(0.694rem, 0.677rem + 0.087vw, 0.75rem);   /* captions */
  --step--1: clamp(0.833rem, 0.805rem + 0.14vw, 0.9rem);      /* small/meta */
  --step-0:  clamp(1rem,     0.958rem + 0.208vw, 1.125rem);   /* body */
  --step-1:  clamp(1.2rem,   1.133rem + 0.333vw, 1.406rem);   /* h4/h5 */
  --step-2:  clamp(1.44rem,  1.337rem + 0.517vw, 1.758rem);   /* h3 */
  --step-3:  clamp(1.728rem, 1.575rem + 0.767vw, 2.197rem);   /* h2 */
  --step-4:  clamp(2.074rem, 1.851rem + 1.117vw, 2.746rem);   /* h1 */
}
```
Each step's min/max grows by the same ratio, so the whole scale keeps its rhythm at every viewport width instead of just the base size. Consuming code only ever says `font-size: var(--step-3)` — the "per-screen" work already happened once, in the token file.

### Container Queries
**Component-level** responsiveness: a card lays out based on its **container's** width, not the viewport — so the same card works in a sidebar and a main column.

```css
.card-wrap {
  container-type: inline-size; /* or size */
  container-name: card;
}
@container card (min-width: 24rem) {
  .card { grid-template-columns: 8rem 1fr; }
}
```

Units: `cqw`/`cqh`/`cqi`/`cqb`/`cqmin`/`cqmax` relative to the query container.

### Viewport Units
`vh` is problematic on mobile (URL bar show/hide). Prefer `dvh` (dynamic), `svh` (smallest), `lvh` (largest) for full-viewport shells.

---

## 2. Real-World Engineering Scenario

**Scenario**: Design System Card Used in Sidebar and Dashboard Main.
Viewport breakpoints force the sidebar card into a "mobile" stacked layout even on a wide monitor because the *viewport* is wide but the *sidebar* is narrow. Container queries fix it: the card becomes horizontal only when its container ≥ 24rem, independent of page width. Designers stop filing "broken in dashboard" bugs that were really "wrong query axis."

---

## 3. Production-Grade Code Example

```css
/* Mobile-first shell */
.shell {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  grid-template-columns: 1fr;
}
@media (width >= 64rem) {
  .shell {
    grid-template-columns: 16rem 1fr;
    padding: 1.5rem;
  }
}

/* Fluid type scale — solved once with the interpolation formula above,
   never revisited per component or per breakpoint */
:root {
  --step--1: clamp(0.833rem, 0.805rem + 0.14vw, 0.9rem);
  --step-0:  clamp(1rem,     0.958rem + 0.208vw, 1.125rem);
  --step-1:  clamp(1.2rem,   1.133rem + 0.333vw, 1.406rem);
  --step-2:  clamp(1.44rem,  1.337rem + 0.517vw, 1.758rem);
  --step-3:  clamp(1.728rem, 1.575rem + 0.767vw, 2.197rem);
  --step-4:  clamp(2.074rem, 1.851rem + 1.117vw, 2.746rem);

  /* Fluid spacing rides the same formula, keyed to layout not text */
  --space-sm: clamp(0.75rem, 0.7rem + 0.5vw, 1rem);
  --space-md: clamp(1rem, 0.75rem + 1vw, 2rem);
  --space-lg: clamp(2rem, 1.5rem + 2vw, 4rem);
}

body  { font-size: var(--step-0); }
small, .meta { font-size: var(--step--1); }
h4, h5 { font-size: var(--step-1); }
h3     { font-size: var(--step-2); }
h2     { font-size: var(--step-3); }
h1     { font-size: var(--step-4); text-wrap: balance; }
.section { padding: var(--space-md); }

/* Component-local fluid type: scale with the container, not the viewport,
   for a card that's dropped into a narrow sidebar OR a wide main column */
.card-title {
  font-size: clamp(1rem, 0.9rem + 1.5cqi, 1.5rem);
}

/* Container query card */
.card-wrap {
  container-type: inline-size;
  container-name: feature-card;
}
.card {
  display: grid;
  gap: 0.75rem;
}
@container feature-card (width >= 28rem) {
  .card {
    grid-template-columns: 10rem 1fr;
    align-items: center;
  }
}

/* Preference queries */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
@media (hover: hover) and (pointer: fine) {
  .nav a:hover { text-decoration: underline; }
}

/* Full height mobile-safe */
.app {
  min-height: 100dvh;
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Desktop-First `max-width` Spaghetti
Overrides pile up and fight. Default to `min-width` / range syntax progressive enhancement.

### ⚠️ Pitfall 2: Forgetting `container-type`
`@container` rules never apply if no ancestor establishes a container. `container-type: inline-size` is the usual choice (avoids circular size issues with `size`).

### ⚠️ Pitfall 3: Nested Containers & Name Collisions
Name containers (`container-name`) and target them explicitly when nesting cards inside cards.

### ⚠️ Pitfall 4: `100vh` Mobile UI Jump
Use `dvh` for shells; test iOS Safari. Avoid mixing `vh` sticky footers with dynamic toolbars without QA.

### ⚠️ Pitfall 5: Hover-Only Affordances on Touch
`@media (hover: hover)` guards hover styles; provide visible focus/active states for touch.

### ⚠️ Pitfall 6: Pure `vw` Font Sizes Break Browser Zoom
`font-size: 4vw` alone never grows when a user cranks their browser's default font size (Ctrl/Cmd `+`, or an OS accessibility setting) — `vw` is purely a fraction of the viewport, with zero relationship to the root font size. That fails WCAG 1.4.4 (text must reflect a 200% text-only zoom). This is exactly why the `clamp()` preferred value above is `rem + vw`, not `vw` alone: the `rem` term ties the fluid size back into the user's font-size preference, and the `vw` term is what adds the fluid component. Never ship a bare `vw` value on real text — only inside a `rem + vw` expression, and always inside `clamp()` so it has hard min/max bounds too.

### ⚠️ Pitfall 7: Hand-Picking Clamp Values Instead of Solving the Scale
One-off `clamp(1rem, 2vw, 1.4rem)` calls sprinkled per component drift out of rhythm — sizes stop lining up on a shared scale and every new component needs someone to eyeball new numbers again, which is the "per-screen styling" problem in a new outfit. Solve the min/max/ratio **once** as the `--step-N` tokens shown above (or generate them with a fluid-scale calculator), then every component consumes a token. If a design genuinely needs an off-scale size, that's a signal to talk to design about the scale, not to freehand a new `clamp()`.
