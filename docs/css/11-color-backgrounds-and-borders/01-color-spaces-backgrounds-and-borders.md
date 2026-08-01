# 🎨 Color Spaces, Backgrounds, Borders & Shadows

> **Global color system (tokens, themes, light/dark, team rules):**  
> [Global color handling: tokens, themes & derivation](./02-global-color-system-and-tokens.md) — use that page as the canonical app-wide color guide.

## 1. Under-The-Hood Mechanics

CSS colors live in color spaces. **sRGB** is the classic default; **OKLCH** is perceptually uniform (better for scales and alpha-consistent UI). `color-mix()` blends in a chosen space; `light-dark()` picks by color scheme.

Backgrounds paint **behind** content: color, images, gradients can layer (comma-separated, first = top). Borders occupy layout space; **outlines** and **box-shadows** do not (usually). `border-radius` + `overflow: hidden` clips descendants to the curve.

Filters (`filter`, `backdrop-filter`) can be expensive (new stacking contexts, GPU). Blend modes (`mix-blend-mode`) require isolation control (`isolation: isolate`) to avoid blending with unintended ancestors.

---

## 2. Real-World Engineering Scenario

**Scenario**: Dark Mode Grays Look Muddy and Inconsistent.
Hex grays picked by eye in sRGB don't step evenly in perceived lightness. Team regenerates neutrals in OKLCH with fixed chroma and evenly spaced L, stores them as tokens (`--gray-100`…`900`), and derives hover/active with `color-mix(in oklch, var(--accent) 12%, transparent)`. Light/dark switch only reassigns semantic tokens (`--surface`, `--text`), not every component rule.

---

## 3. Production-Grade Code Example

```css
:root {
  color-scheme: light dark;
  --accent: oklch(0.62 0.18 255);
  --surface: light-dark(oklch(0.99 0 0), oklch(0.22 0.02 255));
  --text: light-dark(oklch(0.25 0.02 255), oklch(0.95 0.01 255));
  --border: color-mix(in oklch, var(--text) 15%, transparent);
  --danger: oklch(0.6 0.2 25);
}
body {
  background: var(--surface);
  color: var(--text);
}

.btn-primary {
  background: var(--accent);
  color: oklch(0.99 0 0);
  border: 1px solid color-mix(in oklch, var(--accent) 80%, black);
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
}
.btn-primary:hover {
  background: color-mix(in oklch, var(--accent) 85%, black);
}

/* Layered background hero */
.hero {
  background:
    linear-gradient(to block-end, rgb(0 0 0 / 0.55), transparent 55%),
    url("/hero.webp") center / cover no-repeat;
  color: white;
}

/* Gradient border trick */
.chip {
  border: 1px solid transparent;
  background:
    linear-gradient(var(--surface), var(--surface)) padding-box,
    linear-gradient(135deg, var(--accent), oklch(0.7 0.15 320)) border-box;
  border-radius: 999px;
}

/* Glass — know the cost */
.glass {
  background: color-mix(in oklch, var(--surface) 70%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border);
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Low Contrast "Pretty" Grays
Always check WCAG contrast for text/icon on surface. OKLCH helps pick L values deliberately.

### ⚠️ Pitfall 2: `box-shadow` vs `filter: drop-shadow`
`drop-shadow` follows alpha shape (good for irregular PNGs) but can be costlier; `box-shadow` follows the border box.

### ⚠️ Pitfall 3: `backdrop-filter` Performance & Safari Quirks
Limit to small surfaces (nav, modal chrome). Test mobile GPUs; provide solid fallback background.

### ⚠️ Pitfall 4: Border-Box Radius Clipping Focus Rings
`overflow: hidden` + radius clips outlines inside; use `outline-offset` or outer wrappers for focus.

### ⚠️ Pitfall 5: Assuming P3 Always Displays
Use wide-gamut only with fallbacks: `@media (color-gamut: p3) { … }` progressive enhancement.
