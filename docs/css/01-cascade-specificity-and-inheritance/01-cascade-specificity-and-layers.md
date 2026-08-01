# 🎨 Cascade, Specificity, Inheritance & Layers

## 1. Under-The-Hood Mechanics

Every CSS declaration that applies to an element is not "the last rule that matches" — the browser runs a **cascade**: collect all matching declarations, sort them by origin/importance, then specificity, then source order. The winner becomes the **specified value**; inheritance and defaults fill gaps for properties that never got a winning declaration.

```
For each property on each element:
  1. Collect matching declarations (from all stylesheets + inline)
  2. Sort by origin & importance
       user-agent normal  <  user normal  <  author normal
       author !important  <  user !important  <  user-agent !important
  3. Within same origin/importance: higher specificity wins
  4. Tie → later in source order wins (including later @import / later stylesheet link)
  5. No winner → inherit (if property inherits) else initial (or unset/revert semantics)
```

### Specificity (a, b, c)
Roughly: **IDs** (a), **classes / attributes / pseudo-classes** (b), **elements / pseudo-elements** (c). Inline style beats all of those except `!important`. `:where()` always contributes **0**; `:is()`, `:not()`, `:has()` take the **most specific argument** inside them.

### Cascade Layers (`@layer`)
Layers let you declare an explicit priority order *below* specificity wars: unlayered styles beat layered ones (in the normal origin). Inside layers, order is the order you declare them:

```css
@layer reset, base, components, utilities;
```

A rule in `utilities` beats `components` even if the utility selector is less specific — which is how design systems stop "specificity arms races."

### Inheritance & Keywords
- **Inherited properties**: `color`, `font-*`, `line-height`, `visibility`, list styles, etc.
- **Not inherited by default**: box model, most layout (`display`, `margin`, `width`, …).
- Keywords: `inherit` (parent), `initial` (spec default), `unset` (inherit if inherited else initial), `revert` (roll back to user-agent/user), `revert-layer` (previous cascade layer).

### `@scope`
`@scope` limits how far selectors can reach in the tree (and can set a "donut" lower boundary), reducing the need for BEM-long class chains for containment.

---

## 2. Real-World Engineering Scenario

**Scenario**: Design-System Button Styles Keep Losing to App-Level CSS.
A product ships a shared `@company/ui` package. App engineers write `.page .btn { padding: 12px }` and accidentally override the design-system button because of higher specificity / later order. The library migrates component styles into `@layer components` and documents that apps should put overrides in `@layer utilities` (or unlayered intentionally). Specificity stop mattering as much; ownership of the cascade becomes explicit.

---

## 3. Production-Grade Code Example

```css
/* Define layer order once at the top of the app entry CSS */
@layer reset, base, components, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: CanvasText;
    background: Canvas;
  }
  a { color: LinkText; }
}

@layer components {
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    border: 1px solid transparent;
    background: var(--color-primary);
    color: var(--color-primary-fg);
  }

  /* :where keeps "helpers" at zero specificity so utilities can override easily */
  :where(.btn) .icon { flex-shrink: 0; }
}

@layer utilities {
  .mt-4 { margin-top: 1rem; }
  .text-sm { font-size: 0.875rem; }
}

/* Unlayered = highest priority in author normal origin — use sparingly */
.emergency-banner { position: sticky; top: 0; z-index: 1000; }
```

```css
/* @scope: styles apply inside .card, stop at nested .card (donut scope) */
@scope (.card) to (.card .card) {
  :scope { padding: 1rem; border: 1px solid var(--border); }
  h2 { font-size: 1.125rem; margin: 0 0 0.5rem; }
  p { color: var(--muted); }
}
```

```css
/* Specificity traps vs modern fixes */
#nav .link { color: blue; }           /* high specificity */
:where(#nav) .link { color: blue; }   /* same selector intent, 0,1,0-ish via :where on id */

/* :is takes most-specific arg */
:is(#a, .b) span { } /* specificity of #a span if #a is present in the matching branch */
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Fighting With Specificity Instead of Layers/Order
```css
/* ❌ Arms race */
.btn.btn.btn { padding: 1rem !important; }

/* ✅ Own the cascade: layers + source order + low-specificity base components */
@layer components { .btn { padding: 0.5rem 1rem; } }
@layer utilities { .p-4 { padding: 1rem; } }
```

### ⚠️ Pitfall 2: Assuming `!important` Always Wins
`!important` only wins *within its origin story*. An author `!important` loses to a user stylesheet `!important` (accessibility zoom tools, high-contrast extensions). Prefer layers; reserve `!important` for truly intentional utilities (e.g. `.hidden { display: none !important; }` in a utilities layer).

### ⚠️ Pitfall 3: Inheritance Surprises on Form Controls
Form controls often take **user-agent** styles that do not fully inherit `font`/`color` the way a `div` does. Explicitly set `font: inherit; color: inherit;` on inputs/buttons in your reset/base layer.

### ⚠️ Pitfall 4: `@import` Order vs Bundlers
Native `@import` is render-blocking and reorders cascade by insertion point. In apps, let Vite/Webpack/PostCSS own imports; keep a single entry that only declares `@layer` order, then composes modules so cascade order is deterministic.
