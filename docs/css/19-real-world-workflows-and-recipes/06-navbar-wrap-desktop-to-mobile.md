# 🧭 Recipe: Navbar That Wraps Cleanly From Desktop to Mobile 🟢 `[D]`

> **Priority Badges:** 🟢 `[D]` Daily · 🟡 `[O]` Occasional · 🔴 `[R]` Rare-but-critical

---

## 1. Under-The-Hood Mechanics

A logo + nav links + action cluster is a 1D main-axis problem — Flex, not
Grid. `justify-content: space-between` pushes the three groups apart;
`flex-wrap: wrap` lets the nav links drop to their own line instead of
squeezing or overflowing; `gap` replaces manual margin bookkeeping between
wrapped items. The nav link list is itself a nested flex row so it can wrap
independently of the outer three-group layout.

---

## 2. Real-World Engineering Scenario

**Scenario**: Product Nav With a Variable Number of Top-Level Links.
Marketing adds/removes nav items regularly; a fixed hamburger-at-768px
breakpoint either shows a cramped desktop nav on tablets or hides links too
early on wide phones. Flex-wrap lets the **content**, not an arbitrary pixel
breakpoint, decide when links drop to a second line — fewer "looks broken at
900px" bug reports.

---

## 3. Production-Grade Code Example

```css
.navbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
  padding: 0.75rem 1rem;
}

.navbar__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 0 auto;
}

.navbar__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.25rem;
  flex: 1 1 auto;
  min-width: 0; /* let the group shrink instead of shoving actions off */
  list-style: none;
  margin: 0;
  padding: 0;
}
.navbar__links a {
  white-space: nowrap;
  padding-block: 0.25rem;
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 0 auto;
  margin-inline-start: auto; /* pin to the end once wrapping starts */
}
```

```html
<nav class="navbar" aria-label="Primary">
  <div class="navbar__brand">…</div>
  <ul class="navbar__links">…</ul>
  <div class="navbar__actions">…</div>
</nav>
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: `margin-inline-start: auto` Fighting `justify-content`
`space-between` already spreads the three top-level groups — the `auto`
margin on `.navbar__actions` only matters once `.navbar__links` wraps and
`space-between` no longer has a clean three-way split. Test both states.

### ⚠️ Pitfall 2: No `min-width: 0` on the Links Group
Without it, a long unbroken link label can force the whole links group past
its flex-basis, overflowing the navbar horizontally instead of wrapping.

### ⚠️ Pitfall 3: Reaching for a Hamburger Menu Too Early
Wrapping to a second line is often fine for 4-6 links — a hidden hamburger
menu adds a tap and hides navigation. Reserve the hamburger pattern for cases
where two lines of nav would push content below the fold on small screens.

### ⚠️ Pitfall 4: If You Do Add a Hamburger, Keep It Keyboard-Operable
A toggled `.navbar__links` needs `aria-expanded` on the trigger button and
`:focus-visible` styling — see [Accessibility, i18n & Print](../16-accessibility-i18n-and-print/01-a11y-preferences-rtl-and-print.md).
