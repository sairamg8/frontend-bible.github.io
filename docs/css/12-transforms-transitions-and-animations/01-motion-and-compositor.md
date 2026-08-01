# 🎬 Transforms, Transitions, Animations & View Transitions

## 1. Under-The-Hood Mechanics

### Why Transform/Opacity Are Special
Changing `width`/`top`/`margin` forces **layout**; many color/box-shadow changes force **paint**. `transform` and `opacity` often run on the **compositor** with their own layers — smooth if you don't thrash layout.

```
JS/CSS change → Style → Layout → Paint → Composite
Prefer animating properties that can skip Layout/Paint when possible.
```

### Transitions & Animations
`transition` interpolates property changes. `@keyframes` define multi-step animations. `animation-composition`, `transition-behavior: allow-discrete` (for discrete props like `display`) are modern additions.

### Scroll-Driven Animations
`animation-timeline: view() | scroll()` ties progress to scroll without scroll listeners — progressive enhancement where supported.

### View Transitions API
`document.startViewTransition(() => update DOM)` + `view-transition-name` morphs shared elements across DOM updates/navigations (single-page apps). CSS `::view-transition-old/new(*)` styles the snapshots.

**Cross-document (MPA) transitions** use a declarative at-rule instead of JS — no `startViewTransition()` call at all. Opt in on **both** the outgoing and incoming pages:

```css
@view-transition {
  navigation: auto; /* enables the transition for same-origin navigations */
}
```

The browser automatically captures old/new snapshots across the full page navigation; the same `view-transition-name` + `::view-transition-old/new()` pseudo-elements style the morph. This is the only way to get view transitions for traditional multi-page sites (Next.js/Astro MPA routes, server-rendered navigations) without wiring JS on every link.

### `will-change` & `contain`
Hints for optimization; overuse wastes memory (extra layers). Prefer adding `will-change` only during interaction if needed.

---

## 2. Real-World Engineering Scenario

**Scenario**: Accordion Janks When Opening.
Team animated `height: auto` with JS measuring scrollHeight every frame — layout thrash on mobile. Replacement: grid `grid-template-rows: 0fr` → `1fr` transition (modern pattern) or animate `transform: scaleY` only for decorative panels; for content accordions accept discrete open or use WAAPI with measured height once. `prefers-reduced-motion` disables non-essential motion.

---

## 3. Production-Grade Code Example

```css
@media (prefers-reduced-motion: no-preference) {
  .fade-in {
    animation: fade-in 200ms ease-out both;
  }
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(0.25rem); }
  to   { opacity: 1; transform: none; }
}

/* Compositor-friendly hover */
.card {
  transition: transform 160ms ease, box-shadow 160ms ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
}

/* Modern accordion height animation */
.accordion__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 200ms ease;
}
.accordion__panel.is-open {
  grid-template-rows: 1fr;
}
.accordion__panel > .inner {
  overflow: hidden;
  min-height: 0;
}

/* Scroll-driven progress (progressive) */
@supports (animation-timeline: view()) {
  .progress {
    transform-origin: inline-start;
    animation: grow linear both;
    animation-timeline: scroll(root);
  }
  @keyframes grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
}

/* View transition names for shared element morphs */
.hero-title { view-transition-name: hero-title; }

/* Cross-document (MPA) opt-in — no JS required, put on every page */
@view-transition {
  navigation: auto;
}
::view-transition-old(hero-title),
::view-transition-new(hero-title) {
  animation-duration: 240ms;
}

@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
  .fade-in { animation: none; }
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Animating Layout Properties at 60fps
`top`, `height`, `margin` cause layout. Prefer `transform`/`opacity`, or animate sparingly with containment.

### ⚠️ Pitfall 2: Permanent `will-change: transform` on Many Nodes
Memory and layer explosion. Set on interaction (`:hover` / class) and remove after.

### ⚠️ Pitfall 3: Ignoring Reduced Motion
Vestibular disorders — non-essential motion must gate on `prefers-reduced-motion`.

### ⚠️ Pitfall 4: Transform Creating Containing Blocks
`transform` on parent breaks `position: fixed` and creates stacking contexts — overlays misbehave.

### ⚠️ Pitfall 5: Infinite Animations on Battery
Decorative loops drain mobile batteries; pause offscreen (`content-visibility` / Intersection Observer) or avoid.

### ⚠️ Pitfall 6: `@view-transition` Needs Both Pages Opted In
For cross-document transitions, the rule must be present in **both** the outgoing and incoming document's CSS or the browser does a normal navigation with no morph — silent, no error. Also gate the whole feature on `prefers-reduced-motion` (skip or shorten `::view-transition-*` durations) same as any other motion.
