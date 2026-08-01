# 🏗️ Architecture Touchpoints: Scoping, Tokens & Tooling

> **Scope note:** Full styling *decisions* (when to pick Tailwind vs CSS Modules vs CSS-in-JS, monorepo package layout) live in the [Frontend Architecture Bible — Styling Architecture](../../frontend-architecture/06-styling-architecture/01-choosing-and-scaling-a-styling-approach.md). This page only covers how those choices interact with the **CSS language** features from this bible.

## 1. Under-The-Hood Mechanics

### Scoping Strategies vs the Cascade
| Approach | How styles stay local |
|---|---|
| BEM / naming conventions | Human discipline; global cascade |
| CSS Modules | Build-time unique class hashes |
| Shadow DOM | Native encapsulation boundary |
| `@layer` + `@scope` | Cascade ownership + tree limits |
| Utility-first (Tailwind) | Mostly single-purpose classes; few custom rules |

### Design Tokens as Custom Properties
Primitive → semantic → component:

```text
--blue-600 (primitive)
   → --color-primary (semantic)
      → --button-bg (component)
```

Implemented with CSS variables so runtime theme switches (dark mode, white-label) don't rebuild CSS.

**Canonical global color playbook (drop-in token file, theme toggle, pitfalls):**  
[Global color handling: tokens, themes & derivation](../11-color-backgrounds-and-borders/02-global-color-system-and-tokens.md).

### Runtime CSS-in-JS
Injects rules at runtime (cost, SSR style hydration complexity). Zero-runtime approaches (Linaria, compiled CSS, Tailwind) push work to build time — prefer for large apps unless runtime theming requires it.

---

## 2. Real-World Engineering Scenario

**Scenario**: Three Teams Ship Conflicting Global Button Classes.
`.button` in marketing, app shell, and admin fight in the cascade. Platform introduces `@layer reset, base, components, utilities`, moves each package into `components` with namespaced classes or CSS Modules, and exposes tokens only via `:root` / `[data-theme]` custom properties. Conflicts drop; overrides intentionally go to `utilities` layer.

---

## 3. Production-Grade Code Example

```css
/* Token tiers */
:root {
  /* primitive */
  --blue-600: oklch(0.55 0.18 255);
  --gray-100: oklch(0.97 0 0);
  --gray-900: oklch(0.25 0 0);
  /* semantic */
  --color-primary: var(--blue-600);
  --color-surface: var(--gray-100);
  --color-text: var(--gray-900);
}
[data-theme="dark"] {
  --color-surface: oklch(0.22 0.02 255);
  --color-text: oklch(0.95 0.01 255);
}

@layer components {
  .btn {
    background: var(--color-primary);
    color: white;
    /* component-level private tokens */
    --_pad-x: 1rem;
    padding: 0.5rem var(--_pad-x);
  }
}
```

```css
/* CSS Modules mindset (composes to hashed classes at build) */
/* Button.module.css */
.root { /* … */ }
.primary { composes: root; background: var(--color-primary); }
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Duplicating Architecture Bible Content
Don't re-litigate Tailwind vs Modules here — link out and document language mechanics only.

### ⚠️ Pitfall 2: Tokens Only in JS Theme Objects
If CSS can't read tokens, you lose progressive styling and DevTools editability. Mirror tokens into CSS variables at the root.

### ⚠️ Pitfall 3: Shadow DOM + Inherited Fonts/Colors Surprises
Some properties inherit into shadow trees; others don't. Test design-system components in light DOM hosts.

### ⚠️ Pitfall 4: Global Resets Fighting Third-Party Widgets
Layer resets low; isolate third-party roots; avoid `* { all: unset }` nuclear options without a plan.

### ⚠️ Pitfall 5: Utility Classes for Complex 2D Page Shells
Utilities shine for spacing/typography; app shells and bento layouts often stay more readable as a small Grid stylesheet. Mix deliberately.
