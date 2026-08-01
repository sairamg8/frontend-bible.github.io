# 🧭 Recipe: Horizontal Snap Carousel With `scroll-snap` 🟢 `[D]`

> **Priority Badges:** 🟢 `[D]` Daily · 🟡 `[O]` Occasional · 🔴 `[R]` Rare-but-critical

---

## 1. Under-The-Hood Mechanics

`scroll-snap-type` (on the scroll container) declares an axis (`x`/`y`/`both`) and strictness
(`mandatory` always settles on a snap point; `proximity` only snaps if the scroll was already
coming to rest nearby). `scroll-snap-align` (on each child) marks where that child's
`start`/`center`/`end` edge becomes a snap point. `scroll-padding-*` shifts the effective
snap boundary inward (useful when a sticky header/button overlaps part of the scroller).
`scroll-snap-stop: always` forces the scroller to stop at *every* snap point even under a
fast fling, instead of letting momentum carry it past several.

The key architectural win: this runs on a **native scroll container** (`overflow-x: auto`),
so momentum scrolling, touch swipe, trackpad, keyboard (`PageUp`/`PageDown`/arrow keys once
focused), and scrollbar dragging all work for free — a JS carousel library has to
hand-reimplement all of that physics and input handling from scratch.

---

## 2. Real-World Engineering Scenario

**Scenario**: Product Gallery / Testimonial Carousel Without a JS Carousel Dependency.
Product wants touch-swipeable image galleries and a testimonial strip on mobile. Pulling in a
carousel library (Swiper, Slick, etc.) costs bundle size, its own re-render/resize event
wiring, and usually re-implements accessibility worse than the browser's native scroll
container does. `scroll-snap` on a flex row gets swipe, momentum, and snapping natively; JS
is only needed for optional prev/next buttons, which just call `scrollBy`.

---

## 3. Production-Grade Code Example

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 1rem; /* keep snapped item clear of edge affordances */
  gap: 1rem;
  padding-inline: 1rem;
  scrollbar-width: thin; /* keep a visible "there's more" cue; see Pitfall 4 */
}

.carousel__item {
  flex: 0 0 clamp(14rem, 80%, 20rem); /* leaves a peek of the next item */
  scroll-snap-align: start;
  scroll-snap-stop: always; /* fast flicks still land on each item */
  aspect-ratio: 4 / 3; /* reserve space — see the aspect-ratio deep dive */
}
```

```js
// Optional prev/next buttons — the scroller does the rest natively.
function scrollByOneItem(carousel, direction = 1) {
  const item = carousel.querySelector('.carousel__item');
  const step = item.getBoundingClientRect().width + 16; // width + gap
  carousel.scrollBy({ left: step * direction, behavior: 'smooth' });
}
```

```html
<div class="carousel" role="region" aria-label="Product gallery" tabindex="0">
  <figure class="carousel__item">…</figure>
  <figure class="carousel__item">…</figure>
  <figure class="carousel__item">…</figure>
</div>
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: `mandatory` Fighting Fast Flicks
`mandatory` forces a snap after *every* gesture, even mid-fling — a fast trackpad swipe meant
to skip three items can feel like it's fighting back. `proximity` only snaps when the scroll
naturally comes to rest near a point, closer to a native app carousel feel. Reserve
`mandatory` for small, deliberate sequences (onboarding steps) where skipping is undesirable.

### ⚠️ Pitfall 2: Nothing Snaps — Wrong Element or Wrong Axis
`scroll-snap-type` must live on the actual scrolling element (the one with `overflow-x` set
on that axis), not a non-scrolling wrapper around it. `x`/`y`/`both` must match the real
scroll direction, or snapping silently does nothing.

### ⚠️ Pitfall 3: Zero-Size Items Before Images Load
If items size from content (`flex: 0 0 auto` with no basis) and hold only an `<img>`, they can
be 0-width before the image decodes, so the browser computes wrong/zero snap positions.
Reserve size up front — an explicit `flex-basis` or `aspect-ratio` on the item, not on the
image alone.

### ⚠️ Pitfall 4: Hiding the Scrollbar Removes the "More Content" Cue
`scrollbar-width: none` / `::-webkit-scrollbar { display: none }` is common for a cleaner
look, but it removes the one native signal mouse/trackpad users have that more items exist
off-screen. Compensate with a deliberate partial-next-item peek (the `clamp(..., 80%, ...)`
basis above) or visible prev/next buttons — don't hide the scrollbar *and* size items at
exactly 100% width.

### ⚠️ Pitfall 5: Keyboard/Screen-Reader Users Silently Skipped
A scroll container isn't reachable by keyboard by default unless it's programmatically
focusable. Add `tabindex="0"` and `role="region" aria-label="…"` on the scroller itself so
keyboard and AT users can scroll it directly rather than only tabbing through inner links one
at a time with no sense of the container's boundaries.
