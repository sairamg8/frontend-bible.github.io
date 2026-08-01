# 🔤 Typography, Text Layout & Internationalization

## 1. Under-The-Hood Mechanics

Text layout uses font metrics (ascent, descent, line gap), **line boxes**, and the inline formatting context. `line-height` multiplies (unitless preferred) or sets absolute leading. Long words break per `overflow-wrap` / `word-break` / `hyphens`.

### Font Loading
`font-display: swap | optional | block | fallback` trades FOIT (invisible text) vs FOUT (unstyled text) and CLS. Variable fonts reduce file count; `unicode-range` subsets per script.

### Modern Text Controls
- `text-wrap: balance` — even headline lines  
- `text-wrap: pretty` — avoid orphans  
- `line-clamp` / `-webkit-line-clamp` — multi-line ellipsis  
- `text-overflow: ellipsis` — single-line with `overflow: hidden; white-space: nowrap`

### Writing Modes & Bidi
`direction`, `unicode-bidi`, and **logical properties** keep alignment correct for RTL. Avoid physical `left/right` for start/end concepts.

---

## 2. Real-World Engineering Scenario

**Scenario**: Marketing Headlines Jump Layout When Brand Font Loads.
Custom font swaps late, line breaks change, hero CLS spikes. Fix: preload critical woff2, `font-display: optional` for body (or swap with metric-adjusted fallback via `size-adjust` / `@font-face` descriptors), reserve space with stable `line-height`, and avoid late-loading display fonts on LCP text when possible.

---

## 3. Production-Grade Code Example

```css
@font-face {
  font-family: "InterVar";
  src: url("/fonts/Inter.var.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
  unicode-range: U+0000-00FF;
}

:root {
  --font-sans: "InterVar", system-ui, -apple-system, "Segoe UI", sans-serif;
  --lh: 1.5;
}
body {
  font-family: var(--font-sans);
  /* --step-0 etc. are the fluid type scale tokens — see
     ../08-responsive-and-container-queries/01-media-queries-fluid-type-and-containers.md
     for how they're derived, so sizes never need per-screen overrides here */
  font-size: var(--step-0, 1rem);
  line-height: var(--lh);
  text-rendering: optimizeLegibility;
}

h1, h2, h3 {
  line-height: 1.2;
  text-wrap: balance;
}

.prose {
  max-width: 65ch;
  overflow-wrap: anywhere;
}
.prose p { text-wrap: pretty; }

.truncate-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.truncate-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
}

/* Logical text alignment */
.caption { text-align: start; }
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Unitless vs Absolute `line-height` Inheritance
`line-height: 1.5` multiplies child font sizes; `line-height: 24px` inherits as 24px and breaks nested small text. Prefer unitless.

### ⚠️ Pitfall 2: Truncation Without Accessible Full Text
Ellipsis hides content — provide title tooltip, expand control, or ensure SR text remains available when needed.

### ⚠️ Pitfall 3: `word-break: break-all` Destroying Readability
Use `overflow-wrap: anywhere` / `break-word` first; `break-all` is harsh (URLs, CJK exceptions).

### ⚠️ Pitfall 4: Ignoring `lang` / `hyphens`
Hyphenation needs language; set `lang` on HTML and `hyphens: auto` carefully for body copy only.
