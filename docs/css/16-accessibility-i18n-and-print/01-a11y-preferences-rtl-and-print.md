# ♿ Accessibility, Preferences, RTL & Print

## 1. Under-The-Hood Mechanics

CSS is an accessibility surface: contrast, focus visibility, motion, color-only state, and reading order all live here.

### Preference Media Queries
- `prefers-reduced-motion`  
- `prefers-contrast` / `prefers-color-scheme`  
- `forced-colors` (Windows High Contrast / forced colors mode) — use system colors (`Canvas`, `LinkText`, `Highlight`, …)

### Focus
Never remove outlines without a visible `:focus-visible` replacement. Ensure focus order matches visual order (avoid `order` / dense grid for critical flows).

### Internationalization
Logical properties + `dir="rtl"` flip start/end automatically. Physical `left/right` and directional icons need explicit RTL rules (`transform: scaleX(-1)` for arrows).

### Print
`@media print` — hide chrome, expand collapsed content, control breaks (`break-before`, `break-inside: avoid`), optionally show link URLs via `::after { content: " (" attr(href) ")"; }`.

---

## 2. Real-World Engineering Scenario

**Scenario**: Enterprise Customer Enables Windows High Contrast.
Custom button backgrounds disappear; icons vanish; focus rings gone. Team adds `forced-colors` styles: `border: 1px solid ButtonText`, `forced-color-adjust: none` only where necessary, and ensures text uses system color keywords. Same release gates animations with `prefers-reduced-motion`.

---

## 3. Production-Grade Code Example

```css
/* Focus visible ring */
:focus { outline: none; }
:focus-visible {
  outline: 2px solid var(--focus, Highlight);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  html:focus-within { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Forced colors */
@media (forced-colors: active) {
  .btn {
    border: 1px solid ButtonText;
    background: ButtonFace;
    color: ButtonText;
  }
  .btn:focus-visible { outline: 2px solid Highlight; }
}

/* RTL-aware icon */
[dir="rtl"] .icon-arrow { transform: scaleX(-1); }

/* Print */
@media print {
  .app-nav, .app-footer, .no-print { display: none !important; }
  a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.85em; }
  h2, h3 { break-after: avoid; }
  figure, table { break-inside: avoid; }
  body { color: #000; background: #fff; }
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Color-Only Error States
Red borders alone fail color-blind users — add icons/text.

### ⚠️ Pitfall 2: `order` / Absolute Visual Reshuffles
Keyboard users tab in DOM order; keep DOM aligned with reading sequence for primary tasks.

### ⚠️ Pitfall 3: Low-Contrast Placeholders as Labels
Placeholders are not labels; contrast often fails WCAG.

### ⚠️ Pitfall 4: Print CSS Forgotten Until Exec Demo
Charts/nav waste paper; test Print Preview in CI for critical docs/export pages.

### ⚠️ Pitfall 5: Hard-Coded Physical Spacing in RTL Products
Audit `margin-left`, `padding-right`, `left:` in components — migrate to logical properties.
