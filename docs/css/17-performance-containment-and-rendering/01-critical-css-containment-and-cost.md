# ⚡ CSS Performance, Containment & Rendering Cost

## 1. Under-The-Hood Mechanics

### Render Path
Stylesheets (especially render-blocking CSS in `<head>`) delay first paint. Critical CSS inlines above-the-fold rules; the rest loads async (`media="print" onload="this.media='all'"` pattern or bundler split).

### Invalidation Cost
Changing layout-triggering properties forces reflow of affected subtrees. **Containment** tells the engine what a subtree can't affect outside:

```css
.card { contain: layout paint style; }
/* or */
.card { content-visibility: auto; contain-intrinsic-size: auto 320px; }
```

`content-visibility: auto` skips rendering off-screen content (major win for long docs/feeds).

### Selector Cost Reality
Modern engines are fast; pathological patterns still hurt: deep universal selectors, expensive frequent `:has`, huge unused CSS. Prefer shallow selectors + classes; delete dead CSS.

### Layout Thrashing (CSS + JS)
Interleaved JS reads (`offsetHeight`) and writes thrash. CSS-wise, avoid animating layout props; use compositor-friendly transforms.

---

## 2. Real-World Engineering Scenario

**Scenario**: Documentation Site With 200+ Pages Feels Sluggish Scrolling.
Each page ships the entire design-system CSS + page CSS; long API reference pages paint thousands of nodes. Fixes: route-level CSS code splitting, `content-visibility: auto` on article sections with `contain-intrinsic-size`, purge unused utilities in prod, and defer non-critical highlight.js themes. LCP and scroll jank improve without rewriting content.

---

## 3. Production-Grade Code Example

```css
/* Section-level rendering budget for long pages */
.doc-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;
}

/* Isolate widgets */
.widget {
  contain: layout paint;
}

/* Avoid layout-triggering hover */
.list-item {
  transition: background-color 120ms ease; /* paint-only-ish */
}
/* ❌ .list-item:hover { height: 3rem; } */

/* Critical: keep above-the-fold CSS small */
/* In HTML: inline critical shell styles; load the rest async via bundler */
```

```html
<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin />
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Huge Utility CSS Without Purge
Ship only used classes in production builds (Tailwind content scanning, etc.).

### ⚠️ Pitfall 2: `content-visibility` Without Intrinsic Size
Scrollbars jump as sections materialize — set `contain-intrinsic-size`.

### ⚠️ Pitfall 3: Over-Containment Breaking Sticky/Fixed/Tooltips
`contain: paint` can clip descendants and sticky behaviors. Test overlays.

### ⚠️ Pitfall 4: Myth-Driven Selector Micro-optimization
Readable `.card__title` beats `#app div div span` — clarity + smaller stylesheets matter more than micro selector hacks.

### ⚠️ Pitfall 5: Blocking Web Fonts on Critical Path
Preload only the LCP font; subset; `font-display: optional/swap` deliberately.
