# 🃏 Recipe: Container-Query Card + Theme Tokens With `@property` 🟡 `[O]`

> **Priority Badges:** 🟢 `[D]` Daily · 🟡 `[O]` Occasional · 🔴 `[R]` Rare-but-critical

---

## 1. Under-The-Hood Mechanics

**Container queries** make a component respond to its parent's size, not the viewport — essential for design-system cards reused in sidebars and main columns. **Theme tokens** as custom properties let the same component rules serve light/dark (or white-label) by reassigning semantics on a root selector. `@property` is optional but unlocks animating token-driven values (e.g. hue, angle) safely.

```
.card-wrap { container-type: inline-size }
@container (width >= 28rem) { /* horizontal card */ }

:root { --color-surface: … }
[data-theme="dark"] { --color-surface: … }
```

---

## 2. Real-World Engineering Scenario

**Scenario**: Same `FeatureCard` in Marketing Grid and App Sidebar.
Viewport breakpoints made sidebar cards look like "desktop" (horizontal image) while only 240px wide — cramped text. Container queries switch layout at **component width**. Simultaneously, dark mode only flipped a few hardcoded colors; migrating to semantic tokens (`--surface`, `--text`, `--accent`) fixed dozens of one-off dark styles.

---

## 3. Production-Grade Code Example

```css
@property --accent-hue {
  syntax: "<number>";
  inherits: true;
  initial-value: 255;
}

:root {
  color-scheme: light dark;
  --accent-hue: 255;
  --color-accent: oklch(0.62 0.18 var(--accent-hue));
  --color-surface: light-dark(oklch(0.99 0 0), oklch(0.22 0.02 255));
  --color-text: light-dark(oklch(0.25 0.02 255), oklch(0.95 0.01 255));
  --color-muted: color-mix(in oklch, var(--color-text) 65%, transparent);
  --color-border: color-mix(in oklch, var(--color-text) 15%, transparent);
  --radius: 0.75rem;
}

.card-wrap {
  container-type: inline-size;
  container-name: feature-card;
}

.card {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}
.card__title { margin: 0; font-size: 1.125rem; text-wrap: balance; }
.card__body  { margin: 0; color: var(--color-muted); }
.card__media {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: calc(var(--radius) - 0.25rem);
  background: color-mix(in oklch, var(--color-accent) 20%, var(--color-surface));
}
.card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.card__cta {
  justify-self: start;
  margin-block-start: 0.25rem;
  color: var(--color-accent);
}

@container feature-card (width >= 28rem) {
  .card {
    grid-template-columns: 10rem 1fr;
    align-items: center;
  }
  .card__media {
    aspect-ratio: 1;
    grid-row: 1 / span 3;
  }
}

/* White-label: host sets hue once */
:root[data-brand="lime"] { --accent-hue: 140; }
```

```html
<div class="card-wrap">
  <article class="card">
    <div class="card__media"><img src="…" alt="" /></div>
    <h3 class="card__title">Deploy in minutes</h3>
    <p class="card__body">Same card in sidebar or main — layout follows container width.</p>
    <a class="card__cta" href="#">Learn more</a>
  </article>
</div>
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Forgetting `container-type` on the Wrapper
Queries never fire. Put `container-type` on a **parent** of the element you style (often a wrap div), not only on the card if the card's size is what you're querying — query the box that represents available width.

### ⚠️ Pitfall 2: Using Viewport Breakpoints "Because Container Queries Are New"
Ship CQ with a simple single-column default; enhancement is the horizontal layout.

### ⚠️ Pitfall 3: Mixing Hard-Coded Hex With Tokens
Dark mode misses spots. All component colors should reference semantic variables.

### ⚠️ Pitfall 4: Animating Unregistered Custom Props
If you transition `--accent-hue`, register it with `@property` or the animation won't interpolate.
