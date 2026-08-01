# 🧭 Recipe: Media Object & Split-Button Patterns in Pure Flex 🟢 `[D]`

> **Priority Badges:** 🟢 `[D]` Daily · 🟡 `[O]` Occasional · 🔴 `[R]` Rare-but-critical

---

## 1. Under-The-Hood Mechanics

The **media object** (fixed-size image/icon + flexible text body, classic
comment/notification row) and the **split button** (label + chevron acting as
two visually-joined controls) are both solved by a single flex axis with one
`flex: 0 0 auto` element and one `flex: 1 1 auto; min-width: 0` element —
no absolute positioning, no fixed pixel offsets for the text column.

---

## 2. Real-World Engineering Scenario

**Scenario**: Notification Feed With Variable Avatar Sizes and Long Body Text.
Comments/notifications mix short one-liners and long paragraphs; some rows
have an avatar, some have an icon badge instead. A media-object flex row
keeps the avatar/icon column a fixed size while the text column absorbs all
remaining width and wraps or truncates on its own — the row height is always
driven by content, never hardcoded.

---

## 3. Production-Grade Code Example

```css
/* Media object */
.media {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}
.media__figure {
  flex: 0 0 auto;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
}
.media__body {
  flex: 1 1 auto;
  min-width: 0; /* required so long text truncates instead of overflowing */
}
.media__title {
  margin: 0;
  font-weight: 600;
}
.media__text {
  margin: 0.25rem 0 0;
  color: var(--color-text-muted, currentColor);
}

/* Split button: label + chevron, one visual control, two hit targets */
.split-btn {
  display: inline-flex;
  border: 1px solid var(--color-border, currentColor);
  border-radius: 0.375rem;
  overflow: hidden; /* keeps the shared border-radius clean at the seam */
}
.split-btn__main {
  flex: 1 1 auto;
  padding: 0.5rem 1rem;
}
.split-btn__toggle {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  padding-inline: 0.5rem;
  border-inline-start: 1px solid var(--color-border, currentColor);
}
```

```html
<article class="media">
  <div class="media__figure"><img src="…" alt="" /></div>
  <div class="media__body">
    <p class="media__title">Jordan commented</p>
    <p class="media__text">Long comment text that should wrap and never push the timestamp column off the card…</p>
  </div>
</article>

<div class="split-btn" role="group" aria-label="Deploy options">
  <button class="split-btn__main" type="button">Deploy</button>
  <button class="split-btn__toggle" type="button" aria-haspopup="menu" aria-expanded="false">▾</button>
</div>
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Missing `min-width: 0` on the Media Body
Same family of bug as every other flex overflow issue in this bible — a long
unbroken URL or word in `.media__text` pushes the row wider than its
container without it.

### ⚠️ Pitfall 2: Two `<button>`s Announced as One Control
A split button is **two** separate interactive elements (`role="group"` with
an accessible label ties them together conceptually) — never build it as one
button with a nested clickable chevron `<span>`, which breaks keyboard access
to the toggle.

### ⚠️ Pitfall 3: `align-items: flex-start` Forgotten on Tall Bodies
Default `align-items: stretch` makes a short avatar stretch to match a tall
text body's height, distorting circular avatars. Set `align-items: flex-start`
(or `center` for single-line rows) explicitly.

### ⚠️ Pitfall 4: `overflow: hidden` on the Split Button Clipping Focus Rings
The shared-radius trick clips the toggle button's focus outline at the seam.
Use `outline-offset: -2px` (inset ring) or move focus styling to `box-shadow`
inset if outer rings get clipped.
