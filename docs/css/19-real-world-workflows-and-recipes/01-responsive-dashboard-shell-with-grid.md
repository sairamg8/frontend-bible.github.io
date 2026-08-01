# 🧭 Recipe: Responsive Dashboard Shell With CSS Grid 🟢 `[D]`

> **Priority Badges:** 🟢 `[D]` Daily · 🟡 `[O]` Occasional · 🔴 `[R]` Rare-but-critical

---

## 1. Under-The-Hood Mechanics

A dashboard shell is a **2D** problem: header spans full width; sidebar + main share a row; footer optional. CSS Grid `grid-template-areas` names regions so HTML order can stay accessibility-friendly while visual placement stays declarative. On small viewports, redefine areas to a single column without changing markup.

`minmax(0, 1fr)` on the main track and `min-width: 0` / `min-height: 0` on the main pane are required so nested overflow scrolls instead of blowing the page width.

---

## 2. Real-World Engineering Scenario

**Scenario**: SaaS App Chrome Shared Across 40 Routes.
Every page reimplemented header/sidebar spacing with utility soup; mobile nav order was inconsistent. One shell grid in the layout component owns chrome; routes only render into `main`. Breakpoint flips areas so main content comes before nav in the visual stack on mobile while DOM keeps skip-link → main landmark first if desired.

---

## 3. Production-Grade Code Example

```html
<div class="shell">
  <header class="shell__header">…</header>
  <nav class="shell__nav" aria-label="Primary">…</nav>
  <main class="shell__main" id="main">…</main>
  <footer class="shell__footer">…</footer>
</div>
```

```css
.shell {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 16rem minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr) auto;
  grid-template-areas:
    "header header"
    "nav    main"
    "footer footer";
}
.shell__header { grid-area: header; }
.shell__nav    { grid-area: nav; overflow: auto; border-inline-end: 1px solid var(--border); }
.shell__main   { grid-area: main; overflow: auto; padding: 1rem; min-width: 0; min-height: 0; }
.shell__footer { grid-area: footer; }

@media (max-width: 48rem) {
  .shell {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    grid-template-areas:
      "header"
      "nav"
      "main"
      "footer";
  }
  .shell__nav {
    border-inline-end: 0;
    border-block-end: 1px solid var(--border);
    overflow: auto;
  }
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Main Content Can't Scroll Independently
Missing `minmax(0,1fr)` row or `overflow: auto` on main → whole page scrolls awkwardly with sticky headers fighting.

### ⚠️ Pitfall 2: Fixed Sidebar Height With `100vh` on Mobile
Use `100dvh` and flex/grid minmax so mobile browser chrome doesn't clip the footer.

### ⚠️ Pitfall 3: Hiding Nav With `display: none` Only
Provide an accessible open pattern (details/summary, dialog, or button + aria-expanded) when collapsing nav on small screens.
