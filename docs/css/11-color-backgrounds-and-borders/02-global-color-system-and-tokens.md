# 🌍 Global Color Handling: Tokens, Themes & Derivation

> **Canonical guide** for how this project (and production apps) should handle color **globally**.  
> Companion: [Color spaces, backgrounds & borders](./01-color-spaces-backgrounds-and-borders.md) (formats, gradients, shadows).  
> Architecture choices (Tailwind vs CSS Modules): [Styling architecture](../../frontend-architecture/06-styling-architecture/01-choosing-and-scaling-a-styling-approach.md).

## 1. Under-The-Hood Mechanics

### Why “global color handling” exists
Hard-coded hex on every component forces a rewrite for dark mode, white-label brands, and hover states. A **global color system** puts all durable color decisions in **CSS custom properties** (tokens) at a known root, then lets components only consume **semantic** names.

```
Primitive tokens     --blue-600, --gray-100 … --gray-900     (raw palette)
        ↓ map once
Semantic tokens      --color-primary, --color-surface, --color-text
        ↓ optional
Component aliases    --button-bg, --input-border            (local, rare)
```

### Resolution order (what actually paints)
1. Component uses `var(--color-text)`.
2. Engine walks inheritance to find `--color-text` (usually on `:root` or `[data-theme]`).
3. Computed value may itself be `light-dark(…)`, `oklch(…)`, or `color-mix(…)`.
4. Used color is converted for the display’s gamut (sRGB / P3).

### Preferred color space for globals
Use **OKLCH** for primitives and semantics:

| Axis | Role |
|---|---|
| **L** (0–1) | Lightness — main lever for gray scales & contrast |
| **C** (≈0–0.4) | Chroma — how “colorful” (0 = gray) |
| **H** (0–360) | Hue — brand / danger / success family |

Even L steps → even-looking neutrals. Fixed C + stepped L → clean brand ramps.

### Theme switching models
| Model | How | Best for |
|---|---|---|
| `light-dark(a, b)` + `color-scheme` | Browser picks pair | Small apps, few tokens |
| `[data-theme="dark"]` reassigns semantics | Explicit control + user toggle | Product apps |
| `@media (prefers-color-scheme)` | OS preference | Defaults only |
| Combined | OS default → user override via `data-theme` | Most SaaS |

### Derivation (don’t hand-pick every state)
Hover, borders, muted text, and overlays should usually be **`color-mix()`** from a base semantic token so brand hue stays consistent:

```css
--color-border: color-mix(in oklch, var(--color-text) 15%, transparent);
--color-primary-hover: color-mix(in oklch, var(--color-primary) 85%, black);
```

### `color-scheme`
`color-scheme: light dark` on `:root` tells the UA to render **native controls** (scrollbars, inputs) for the active scheme and enables correct `light-dark()` behavior.

---

## 2. Real-World Engineering Scenario

**Scenario**: Mid-size app with 80 components and a “quick dark mode.”
Engineers add `.dark .btn { background: #1e293b }` overrides. Half the states miss (hover, disabled, borders); marketing wants a green brand for one customer. Six months later color is unmaintainable.

**Fix:** one global stylesheet (or design-token layer) defines primitives + semantics; dark mode and white-label only reassign tokens on `:root` / `[data-theme]` / `[data-brand]`. Components never mention hex. Dark mode and brand swaps become token reassignment, not component archaeology.

---

## 3. Production-Grade Global Color System

### 3.1 Drop-in token file (copy into app entry CSS)

```css
/* ============================================================
   GLOBAL COLOR SYSTEM
   - Primitives: raw palette (optional public)
   - Semantics: what ALL components must use
   - Themes: reassign semantics only
   ============================================================ */

/* --- Optional: animatable brand hue --- */
@property --brand-hue {
  syntax: "<number>";
  inherits: true;
  initial-value: 255;
}

:root {
  /* Native chrome + light-dark() support */
  color-scheme: light dark;
  --brand-hue: 255;

  /* ---------- PRIMITIVES (palette) ---------- */
  --blue-500: oklch(0.62 0.18 var(--brand-hue));
  --blue-600: oklch(0.55 0.18 var(--brand-hue));
  --blue-700: oklch(0.48 0.16 var(--brand-hue));

  --gray-50:  oklch(0.98 0.005 var(--brand-hue));
  --gray-100: oklch(0.95 0.008 var(--brand-hue));
  --gray-200: oklch(0.90 0.01  var(--brand-hue));
  --gray-300: oklch(0.82 0.012 var(--brand-hue));
  --gray-400: oklch(0.70 0.015 var(--brand-hue));
  --gray-500: oklch(0.55 0.015 var(--brand-hue));
  --gray-600: oklch(0.45 0.015 var(--brand-hue));
  --gray-700: oklch(0.37 0.015 var(--brand-hue));
  --gray-800: oklch(0.28 0.02  var(--brand-hue));
  --gray-900: oklch(0.22 0.02  var(--brand-hue));
  --gray-950: oklch(0.16 0.02  var(--brand-hue));

  --red-500:    oklch(0.60 0.20 25);
  --green-500:  oklch(0.65 0.17 150);
  --amber-500:  oklch(0.78 0.15 85);
  --white:      oklch(1 0 0);
  --black:      oklch(0 0 0);

  /* ---------- SEMANTICS (components use ONLY these) ---------- */
  --color-primary:        var(--blue-600);
  --color-primary-hover:  var(--blue-700);
  --color-primary-fg:     var(--white);

  --color-surface:        var(--gray-50);
  --color-surface-raised: var(--white);
  --color-surface-sunken: var(--gray-100);

  --color-text:           var(--gray-900);
  --color-text-muted:     color-mix(in oklch, var(--color-text) 65%, transparent);
  --color-text-inverse:   var(--white);

  --color-border:         color-mix(in oklch, var(--color-text) 14%, transparent);
  --color-border-strong:  color-mix(in oklch, var(--color-text) 28%, transparent);

  --color-focus:          var(--blue-500);
  --color-danger:         var(--red-500);
  --color-success:        var(--green-500);
  --color-warning:        var(--amber-500);

  --color-overlay:        color-mix(in oklch, var(--black) 45%, transparent);

  /* Derived states (prefer mix over new hex) */
  --color-danger-bg:   color-mix(in oklch, var(--color-danger) 12%, var(--color-surface));
  --color-success-bg:  color-mix(in oklch, var(--color-success) 12%, var(--color-surface));
  --color-primary-bg:  color-mix(in oklch, var(--color-primary) 12%, var(--color-surface));
}

/* ---------- EXPLICIT DARK THEME ---------- */
[data-theme="dark"] {
  color-scheme: dark;

  --color-primary:        var(--blue-500);
  --color-primary-hover:  color-mix(in oklch, var(--blue-500) 85%, var(--white));
  --color-primary-fg:     var(--gray-950);

  --color-surface:        var(--gray-950);
  --color-surface-raised: var(--gray-900);
  --color-surface-sunken: var(--gray-900);

  --color-text:           var(--gray-50);
  --color-text-muted:     color-mix(in oklch, var(--color-text) 65%, transparent);
  --color-text-inverse:   var(--gray-950);

  --color-border:         color-mix(in oklch, var(--color-text) 16%, transparent);
  --color-border-strong:  color-mix(in oklch, var(--color-text) 30%, transparent);

  --color-focus:          var(--blue-500);
  --color-overlay:        color-mix(in oklch, var(--black) 60%, transparent);

  --color-danger-bg:   color-mix(in oklch, var(--color-danger) 18%, var(--color-surface));
  --color-success-bg:  color-mix(in oklch, var(--color-success) 18%, var(--color-surface));
  --color-primary-bg:  color-mix(in oklch, var(--color-primary) 18%, var(--color-surface));
}

/* ---------- OS preference when user has NOT set data-theme ---------- */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;

    --color-primary:        var(--blue-500);
    --color-primary-hover:  color-mix(in oklch, var(--blue-500) 85%, var(--white));
    --color-primary-fg:     var(--gray-950);

    --color-surface:        var(--gray-950);
    --color-surface-raised: var(--gray-900);
    --color-surface-sunken: var(--gray-900);

    --color-text:           var(--gray-50);
    --color-text-muted:     color-mix(in oklch, var(--color-text) 65%, transparent);
    --color-text-inverse:   var(--gray-950);

    --color-border:         color-mix(in oklch, var(--color-text) 16%, transparent);
    --color-border-strong:  color-mix(in oklch, var(--color-text) 30%, transparent);

    --color-overlay:        color-mix(in oklch, var(--black) 60%, transparent);

    --color-danger-bg:   color-mix(in oklch, var(--color-danger) 18%, var(--color-surface));
    --color-success-bg:  color-mix(in oklch, var(--color-success) 18%, var(--color-surface));
    --color-primary-bg:  color-mix(in oklch, var(--color-primary) 18%, var(--color-surface));
  }
}

/* ---------- WHITE-LABEL / BRAND SWAPS ---------- */
:root[data-brand="lime"]  { --brand-hue: 140; }
:root[data-brand="rose"]  { --brand-hue: 10; }
:root[data-brand="violet"]{ --brand-hue: 300; }

/* ---------- PAGE BASELINE ---------- */
html, body {
  background: var(--color-surface);
  color: var(--color-text);
}

/* Optional: simpler dual values without full dark block */
/*
:root {
  --color-surface: light-dark(var(--gray-50), var(--gray-950));
  --color-text:    light-dark(var(--gray-900), var(--gray-50));
}
*/
```

### 3.2 Component rules (correct consumption)

```css
/* ✅ Components only touch semantic tokens */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  background: var(--color-primary);
  color: var(--color-primary-fg);
  transition: background-color 120ms ease, border-color 120ms ease;
}
.btn:hover {
  background: var(--color-primary-hover);
}
.btn:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
.btn--ghost {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-border-strong);
}
.btn--danger {
  background: var(--color-danger);
  color: var(--color-text-inverse);
}

.card {
  background: var(--color-surface-raised);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1rem;
}
.card__meta { color: var(--color-text-muted); }

.input {
  background: var(--color-surface-sunken);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
}
.input:focus-visible {
  outline: 2px solid var(--color-focus);
  border-color: var(--color-focus);
}
.field:has(:user-invalid) .input {
  border-color: var(--color-danger);
  background: var(--color-danger-bg);
}

.modal-backdrop {
  background: var(--color-overlay);
}
```

### 3.3 Theme toggle (minimal JS)

```html
<html lang="en" data-theme="light">
```

```js
// Persist user preference; "system" removes the attribute
function setTheme(mode) {
  const root = document.documentElement;
  if (mode === "system") {
    root.removeAttribute("data-theme");
    localStorage.removeItem("theme");
    return;
  }
  root.setAttribute("data-theme", mode);
  localStorage.setItem("theme", mode);
}

// Boot (run before paint if possible — inline in <head>)
(function () {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") {
    document.documentElement.setAttribute("data-theme", saved);
  }
})();
```

### 3.4 Naming contract (team rules)

| Do | Don't |
|---|---|
| Use `--color-*` in components | Use `--blue-600` in components |
| Reassign semantics for themes | Duplicate `.dark .btn { … }` overrides |
| Derive muted/hover/border with `color-mix` | Invent one-off hex per state |
| Keep primitives on `:root` | Scatter palette values in modules |
| Document token list in one file | “Secret” colors only in Figma |

**Semantic checklist (minimum viable set):**

```text
--color-primary, --color-primary-hover, --color-primary-fg
--color-surface, --color-surface-raised, --color-surface-sunken
--color-text, --color-text-muted, --color-text-inverse
--color-border, --color-border-strong
--color-focus
--color-danger, --color-success, --color-warning
--color-overlay
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Mixing hex in components “just this once”
Breaks dark mode and brand swaps. Lint mental rule: **no raw color literals outside the global token file** (except true one-offs like chart series with documented exceptions).

### ⚠️ Pitfall 2: Only flipping `background` / `color` on `body`
Borders, shadows, muted text, and status backgrounds stay light-themed. Theme blocks must reassign **the full semantic set**.

### ⚠️ Pitfall 3: Using `opacity` for muted text
Fades icons/children too. Prefer:

```css
color: var(--color-text-muted);
/* which is color-mix against transparent */
```

### ⚠️ Pitfall 4: Insufficient contrast after OKLCH ramps
Pretty ≠ accessible. Verify body text vs `--color-surface` (target ~4.5:1) and large text/icons (~3:1). Adjust **L** first.

### ⚠️ Pitfall 5: Forgetting `color-scheme`
Native inputs/scrollbars stay “light” on a dark page. Set `color-scheme: dark` on the dark theme root.

### ⚠️ Pitfall 6: Circular or inverted token graphs
```css
/* ❌ */
--color-text: var(--color-text-muted);
--color-text-muted: color-mix(..., var(--color-text) ...);
```
Keep primitives → semantics → derived one-way.

### ⚠️ Pitfall 7: `light-dark()` without a scheme
Without `color-scheme` / system preference context, pairs may not resolve as you expect. Prefer explicit `[data-theme]` for product apps.

### ⚠️ Pitfall 8: Forced colors (Windows High Contrast)
Custom surfaces can vanish. Add:

```css
@media (forced-colors: active) {
  .btn {
    border: 1px solid ButtonText;
    background: ButtonFace;
    color: ButtonText;
  }
  .card {
    border: 1px solid CanvasText;
    background: Canvas;
    color: CanvasText;
  }
}
```

### ⚠️ Pitfall 9: Animating brand hue without `@property`
`transition: --brand-hue` needs `@property --brand-hue { syntax: "<number>"; … }` or interpolation won’t run.

### ⚠️ Pitfall 10: P3-only brand colors with no fallback
Wide-gamut is progressive enhancement:

```css
@supports (color: oklch(0 0 0)) {
  :root { --color-primary: oklch(0.55 0.18 255); }
}
@media (color-gamut: p3) {
  :root { --color-primary: oklch(0.55 0.22 255); /* richer if display allows */ }
}
```

---

## 5. Color strategy for modern fullstack applications

> **Industry recommendation (not “CSS vs framework”):**  
> Design tokens as **CSS custom properties** (semantic, themeable) → consumed by **Tailwind** or **CSS Modules**.  
> Colors always end up as CSS; the winning pattern is **how you organize and theme them**.  
> Broader styling tradeoffs: [Styling architecture](../../frontend-architecture/06-styling-architecture/01-choosing-and-scaling-a-styling-approach.md).

### 5.1 What “better” means in 2025–2026

| Approach | Fullstack product apps? | Notes |
|---|---|---|
| Random hex/rgb in components | **No** | Breaks dark mode, brands, design drift |
| Global CSS variables + semantic tokens | **Yes — required foundation** | Runtime theme; zero styling-runtime cost |
| Tailwind / shadcn-style UI **on top of** CSS vars | **Yes — most common product path** | Fast DX; must use semantic utilities, not raw `bg-blue-500` as the public API |
| CSS Modules + CSS vars | **Yes — strong alternative** | Great for design systems / multi-app monorepos |
| Runtime CSS-in-JS themes only (Emotion / styled-components) | **Weak default for new apps** | SSR + main-thread cost; industry shifted to zero-runtime |
| Inline styles / JS-only theme objects | **No** (except charts/one-offs) | Weak cascade, FOUC, a11y/`forced-colors` friction |

**Bottom line:** Do not choose between “CSS colors” and “a framework.” Choose:

```text
Figma / design tokens (optional package)
        ↓
CSS custom properties on :root   ← single runtime theme surface
        ↓
Tailwind (mapped to vars)  OR  CSS Modules using var(--color-*)
        ↓
UI components
        ↓
[data-theme] / .dark  only reassigns variables
```

### 5.2 Recommended fullstack stack

1. **One global color layer** (this doc’s §3.1) owns primitives + semantics.  
2. **Components never hard-code brand hex** — only `--color-*` or Tailwind classes that resolve to those vars.  
3. Prefer **OKLCH** + **`color-mix`** for ramps, hover, muted, borders.  
4. **Theme = reassign tokens**, not rewrite components (`.dark .btn { background: #… }` is a smell).  
5. **Next.js / Remix / fullstack SSR:** keep tokens in CSS; apply `data-theme` (or class) **before first paint** (inline boot script / cookie) to avoid FOUC.  
6. If **Tailwind:** map semantic colors → CSS variables; treat palette utilities (`blue-600`) as primitives for the design system, not as what feature code should reach for.  
7. If **CSS Modules only:** still import the same global token file first — Modules own structure, tokens own color.  
8. Avoid **runtime CSS-in-JS** as the *global* color system for new apps; if needed, compile-time CSS-in-JS is closer to Modules/Tailwind.

### 5.3 Tailwind on CSS variables (canonical product pattern)

```css
/* tokens.css — loaded once at app root */
:root {
  --color-primary: oklch(0.55 0.18 255);
  --color-surface: oklch(0.99 0 0);
  --color-text: oklch(0.25 0.02 255);
}
[data-theme="dark"] {
  --color-surface: oklch(0.18 0.02 255);
  --color-text: oklch(0.95 0.01 255);
}
```

```js
// tailwind.config.js (conceptual — Tailwind v3 theme.extend / v4 @theme)
// Utilities resolve to the SAME runtime variables as plain CSS
module.exports = {
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
      },
    },
  },
};
```

```tsx
// ✅ Semantic utilities tied to tokens
<button className="bg-primary text-white hover:opacity-90">Save</button>
<div className="bg-surface text-text">…</div>

// ❌ Palette utility as product API (hard to theme / rebrand)
<button className="bg-blue-600 text-white">Save</button>
```

shadcn/ui-style stacks follow this model: components use `bg-primary` / `bg-background`, and light/dark only swap CSS variables.

### 5.4 CSS Modules path (same tokens)

```css
/* Button.module.css */
.root {
  background: var(--color-primary);
  color: var(--color-primary-fg);
}
.root:hover {
  background: var(--color-primary-hover);
}
```

No second color system in JS. Modules scope **selectors**; the global file scopes **meaning**.

### 5.5 When pure CSS (no Tailwind) is the better product choice

- Documentation / content sites (low component churn)  
- Strict design-system packages with few authors  
- Maximum control and minimal tooling surface  

Still use this page’s token system — “no Tailwind” does **not** mean “hard-code hex.”

### 5.6 Fullstack-specific concerns

| Concern | Practice |
|---|---|
| **SSR / FOUC** | Inline tiny script in `<head>` reading `localStorage` / cookie → set `data-theme` before paint |
| **Native controls** | Set `color-scheme: light dark` (and `dark` on dark root) so inputs/scrollbars match |
| **Email / PDF / canvas** | May need resolved hex at render time — export tokens to JS *from the same source*, don’t fork palettes |
| **Monorepo** | Ship `packages/tokens` CSS (and optional TS export) consumed by web + design tooling |
| **White-label** | `data-brand` / `--brand-hue` on root; never per-tenant component CSS |
| **A11y** | Contrast against semantic surface/text pairs; `forced-colors` fallbacks on core controls |

### 5.7 Decision tree (stack choice)

```text
Building a modern fullstack product UI?
  │
  ├─ Need fast iteration + large team surface?
  │     → Tailwind (or similar) ON TOP OF CSS variable tokens
  │
  ├─ Shipping a shared design system / multi-app monorepo?
  │     → CSS Modules (or Vanilla Extract) + same CSS variable tokens
  │
  ├─ Docs / marketing / low-churn UI?
  │     → Global CSS tokens + structured stylesheets (this bible’s default)
  │
  └─ New app defaulting to runtime styled-components for “theming”?
        → Prefer CSS variables + zero-runtime styling instead
```

```text
Every path still requires:
  semantic CSS custom properties + theme by reassignment + no hex in feature components
```

---

## 6. Quick decision tree (token usage)

```text
Need a color on a component?
  → Is there a semantic token? Use it.
  → Is it a new durable meaning (e.g. "info")?
       → Add semantic token in global file, then use it.
  → Is it a one-off illustration/chart series?
       → Local token on the chart root, documented exception.
  → Theme / brand change?
       → Only edit :root / [data-theme] / [data-brand], never components.
```

---

## Related docs

- [Color spaces, backgrounds & borders](./01-color-spaces-backgrounds-and-borders.md) — OKLCH, gradients, glass, shadows  
- [Custom properties & `@property`](../13-custom-properties-functions-and-at-rules/01-variables-calc-and-at-rules.md)  
- [Container-query card + theme tokens recipe](../19-real-world-workflows-and-recipes/03-container-query-card-and-theme-tokens.md)  
- [A11y preferences & forced colors](../16-accessibility-i18n-and-print/01-a11y-preferences-rtl-and-print.md)  
- [Architecture: scoping & tokens](../18-architecture-touchpoints/01-scoping-tokens-and-tooling.md)  
- [Frontend architecture: styling approach](../../frontend-architecture/06-styling-architecture/01-choosing-and-scaling-a-styling-approach.md) — Tailwind vs Modules vs CSS-in-JS  
- [Storybook: colors, themes & toolbars](../../storybook/17-theming-colors-and-fonts/01-global-colors-themes-and-tokens.md) — same tokens inside the preview iframe  
- [Storybook: custom fonts](../../storybook/17-theming-colors-and-fonts/02-custom-fonts-and-typography.md)  
