# 🧭 Recipe: Holy-Grail Page With a Sticky Footer 🟢 `[D]`

> **Priority Badges:** 🟢 `[D]` Daily · 🟡 `[O]` Occasional · 🔴 `[R]` Rare-but-critical

---

## 1. Under-The-Hood Mechanics

"Sticky footer" here means: pinned to the bottom of the **viewport** when page
content is shorter than the screen, but pushed down normally (not overlapping
content) once content grows past a screen height. That's a min-height shell
with one flexible middle track — either column Flex (`flex: 1` on main) or
Grid (`1fr` middle row) both solve it in one rule, no JS height measuring and
no absolute-positioned footer with a magic negative margin.

---

## 2. Real-World Engineering Scenario

**Scenario**: Marketing Pages With Wildly Different Content Lengths.
A pricing page has three sentences; a docs page has ten screens of content.
An older `position: absolute; bottom: 0` footer overlapped the pricing page's
short content and looked broken. One shell layout (Grid or Flex) handles both
cases with the same CSS — footer sits at the bottom of the viewport when
short, and after the content when long.

---

## 3. Production-Grade Code Example

```css
/* Grid version */
.page {
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr auto; /* header / main / footer */
}
.page > header { grid-row: 1; }
.page > main   { grid-row: 2; min-height: 0; }
.page > footer { grid-row: 3; }
```

```css
/* Flex version — equivalent, pick one convention per codebase */
.page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
.page > header,
.page > footer {
  flex: 0 0 auto;
}
.page > main {
  flex: 1 0 auto;
}
```

```html
<div class="page">
  <header>…</header>
  <main>…</main>
  <footer>…</footer>
</div>
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: `100vh` Instead of `100dvh`
On mobile Safari/Chrome, `100vh` includes space the collapsible URL bar will
later occupy, so the footer sits partly offscreen until the user scrolls.
`100dvh` tracks the actual visible viewport.

### ⚠️ Pitfall 2: Forgetting `flex: 0 0 auto` on Header/Footer
Without it, the default `flex: 0 1 auto` still works for most cases, but any
percentage-height children inside header/footer can misbehave — being
explicit costs nothing and documents intent.

### ⚠️ Pitfall 3: Nested Scroll Containers Breaking the Shell
If `main` also needs its own internal scroll (chat apps, dashboards), add
`overflow: auto; min-height: 0` on `main` — otherwise the whole page (not just
main) scrolls and the footer stops being "sticky" to the viewport bottom.

### ⚠️ Pitfall 4: Confusing This With `position: sticky` Footers
This recipe pins the footer to the bottom of a **short page**. A footer that
stays visible while scrolling **through** long content is a different pattern
(`position: sticky; bottom: 0` on the footer itself) — don't reach for this
recipe when that's actually what's being asked for.
