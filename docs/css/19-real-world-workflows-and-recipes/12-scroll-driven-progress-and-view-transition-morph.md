# 🃏 Recipe: Scroll-Driven Progress Bar & View-Transition Page Morph 🟡 `[O]`

> **Priority Badges:** 🟢 `[D]` Daily · 🟡 `[O]` Occasional · 🔴 `[R]` Rare-but-critical

---

## 1. Under-The-Hood Mechanics

Both patterns replace a JS scroll/route listener with a declarative CSS
timeline. `animation-timeline: scroll(root)` ties an animation's progress
directly to the scrollbar position — no `scroll` event, no `requestAnimationFrame`
throttling. View Transitions (covered in depth in
[Transforms, Transitions & Animations](../12-transforms-transitions-and-animations/01-motion-and-compositor.md))
morph shared elements between two DOM states (SPA route change) or two full
documents (`@view-transition` at-rule, MPA navigation) by snapshotting old/new
and cross-fading/animating the pair. Both are **progressive enhancement**:
gate behind `@supports` and always keep the page fully usable without them.

---

## 2. Real-World Engineering Scenario

**Scenario**: Long-Form Article Wants a Read-Progress Bar and a Smooth Cover-Image Morph Into the Article Page.
The product previously used a scroll-listener + `requestAnimationFrame` loop
to update a progress bar's width, plus a client-side router animation library
for the "card grows into hero image" transition on article open. Both add JS
weight and main-thread work. Swapping to `animation-timeline: scroll(root)`
for the progress bar and `view-transition-name` + `document.startViewTransition`
for the morph removes both dependencies — the browser drives both animations
off its own compositor, not the main thread.

---

## 3. Production-Grade Code Example

```css
/* Scroll-driven read-progress bar */
@supports (animation-timeline: scroll(root)) {
  .progress-bar {
    position: fixed;
    top: 0;
    inset-inline: 0;
    height: 4px;
    background: var(--color-primary, oklch(0.6 0.18 255));
    transform-origin: inline-start;
    transform: scaleX(0);
    animation: progress-scale linear both;
    animation-timeline: scroll(root);
  }
  @keyframes progress-scale {
    to { transform: scaleX(1); }
  }
}
@supports not (animation-timeline: scroll(root)) {
  /* Fallback: no bar at all is fine, or wire the old JS listener here */
  .progress-bar { display: none; }
}
```

```css
/* Shared-element morph: card -> article hero (SPA) */
.article-card__image {
  view-transition-name: var(--vt-name, none);
}
```

```js
// Only tag the specific card being opened, not every card at once —
// duplicate view-transition-names in the same document is invalid.
function openArticle(cardEl, articleId) {
  cardEl.querySelector(".article-card__image")
    .style.setProperty("--vt-name", `article-image-${articleId}`);

  if (!document.startViewTransition) {
    navigateToArticle(articleId);
    return;
  }
  document.startViewTransition(() => navigateToArticle(articleId));
}
```

```css
/* MPA equivalent: no JS at all, opt in on both pages */
@view-transition {
  navigation: auto;
}
.hero-image {
  view-transition-name: article-hero;
}
```

```css
@media (prefers-reduced-motion: reduce) {
  .progress-bar { animation: none; transform: none; }
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Duplicate `view-transition-name` in One Document
Two elements sharing a name at the same time throws and **skips the whole
transition** (not just that element). Clear or randomize the name on elements
that aren't the active transition target, as shown above.

### ⚠️ Pitfall 2: Scroll Timeline Without a Support Fallback
`animation-timeline` support isn't universal — always pair it with
`@supports not (...)` so unsupported browsers get a sane default (usually
"no progress bar") instead of a static bar frozen at 0% or 100%.

### ⚠️ Pitfall 3: Forgetting `prefers-reduced-motion` on View Transitions
The morph is exactly the kind of large, screen-filling motion that
`prefers-reduced-motion: reduce` users need suppressed — disable the
`::view-transition-*` animations, not just decorative `@keyframes`.

### ⚠️ Pitfall 4: Expecting `scroll()` to Track Anything but the Nearest Scroller
`animation-timeline: scroll(root)` explicitly targets the document scroller.
If the progress bar should track a scrollable panel instead of the whole
page, name that panel a scroll-timeline source and reference it — don't
assume `scroll()` finds "the right" container automatically.
