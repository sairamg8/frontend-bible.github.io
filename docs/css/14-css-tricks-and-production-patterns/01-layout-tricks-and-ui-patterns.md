# ✨ CSS Tricks & Production Layout Patterns

## 1. Under-The-Hood Mechanics

"Tricks" that survive code review are usually **compositions of solid primitives** (Grid/Flex/logical props), not brittle hacks. This section catalogs patterns you will actually ship.

| Pattern | Core technique |
|---|---|
| Intrinsic centering | Grid `place-items: center` or flex + auto margins |
| App shell / holy grail | Grid areas or column flex + `flex: 1` main |
| Equal-height cards | Grid/Flex stretch + internal column flex footers |
| Fluid card grid | `auto-fit` + `minmax(min(100%, X), 1fr)` |
| Aspect-ratio media | `aspect-ratio` + `object-fit` |
| Sticky table header | `thead th { position: sticky; top: 0 }` |
| Full-bleed in constrained prose | breakout column / negative margins carefully |
| Truncation | ellipsis / line-clamp |
| Skeleton shimmer | animated gradient background-position |
| Gradient border | background clip padding-box + border-box |
| Debug outlines | temporary universal outline |

---

## 2. Real-World Engineering Scenario

**Scenario**: Design QA Flags Uneven Card Footers and Layout Shift on Images.
Card titles wrap differently so buttons don't line up; hero images load and shove content. Engineers switch card grid to CSS Grid, make each card a column flex with `margin-top: auto` on the footer, and set `aspect-ratio` + width/height attributes on images. CLS drops; visual rhythm holds without JS measuring heights.

---

## 3. Production-Grade Code Example

```css
/* Centering */
.center { display: grid; place-items: center; min-height: 100dvh; }

/* Holy grail / app shell */
.shell {
  min-height: 100dvh;
  display: grid;
  grid-template:
    "header header" auto
    "nav    main"   1fr
    "footer footer" auto
    / 16rem 1fr;
}
.shell > header { grid-area: header; }
.shell > nav    { grid-area: nav; overflow: auto; }
.shell > main   { grid-area: main; min-width: 0; overflow: auto; }
.shell > footer { grid-area: footer; }

/* Card grid + footer pin */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: 1rem;
  align-items: stretch;
}
.card {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.card__footer { margin-block-start: auto; padding-top: 1rem; }

/* Media object */
.media {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.media__img { flex: 0 0 auto; }
.media__body { flex: 1 1 auto; min-width: 0; }

/* Sticky table header */
.table-wrap { overflow: auto; max-height: 70vh; }
.table-wrap th {
  position: sticky;
  top: 0;
  background: var(--surface);
  z-index: 1;
}

/* Full-bleed band inside .prose (centered column) */
.prose {
  --content: 65ch;
  display: grid;
  grid-template-columns:
    1fr min(var(--content), 100%) 1fr;
}
.prose > * { grid-column: 2; }
.prose > .full-bleed {
  grid-column: 1 / -1;
}

/* Skeleton */
.skeleton {
  background: linear-gradient(
    90deg,
    color-mix(in oklch, CanvasText 8%, transparent) 25%,
    color-mix(in oklch, CanvasText 14%, transparent) 37%,
    color-mix(in oklch, CanvasText 8%, transparent) 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 0.25rem;
}
@keyframes shimmer {
  to { background-position: -400% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}

/* Debug (dev only) */
/* * { outline: 1px solid rgb(255 0 0 / 0.2); } */
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: `100vw` Full-Bleed Causing Horizontal Scroll
Prefer the grid full-bleed column pattern over `width: 100vw; margin-left: calc(50% - 50vw)`.

### ⚠️ Pitfall 2: Sticky Table Headers Without Background
Content scrolls underneath and looks broken — set opaque `background` on sticky cells.

### ⚠️ Pitfall 3: Skeleton Animation Without Reduced Motion
Always gate shimmer.

### ⚠️ Pitfall 4: Overusing Absolute Positioning for Layout
Absolute removes flow — fragile for responsive. Prefer Grid/Flex; absolute for badges/overlays only.

### ⚠️ Pitfall 5: Glassmorphism Everywhere
`backdrop-filter` is a battery/GPU tax. Reserve for small chrome surfaces.
