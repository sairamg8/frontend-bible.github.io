# 🎛️ Forms, UI Controls, Scrollbars & Interaction

## 1. Under-The-Hood Mechanics

Native form controls are painted with a mix of **UA styles** and limited author styling. Modern hooks:

- `accent-color` — brand tint for checkboxes, radios, range, progress  
- `color-scheme` — light/dark native control chrome  
- `appearance` — reset native look (use carefully for a11y)  
- `:focus-visible`, `:user-invalid`, `:placeholder-shown`, `:autofill`  
- `scrollbar-gutter: stable` — reserve scrollbar space to reduce CLS  
- `scrollbar-width` / `scrollbar-color` — limited nonstandard-ish styling  
- `pointer-events`, `touch-action`, `user-select`, `cursor`  
- **Popover API** + **CSS anchor positioning** — declarative floating UI (support-gated)

Custom controls must keep a real `<input>` (visually hidden or native) for semantics — never replace with pure `<div>` click handlers without roles/keyboard.

### CSS Anchor Positioning
Pairs with Popover for **declarative** floating UI — no JS measuring `getBoundingClientRect()` every frame. Give the target element an `anchor-name`, then position the floating element relative to it with `position-anchor` + `position-area` (or `top`/`left` using the `anchor()` function):

```css
.trigger {
  anchor-name: --menu-trigger;
}
[popover] {
  position-anchor: --menu-trigger;
  position-area: block-end span-inline-end; /* below, aligned to end edge */
  margin-block-start: 0.25rem;
}
/* Manual offsets via anchor() when position-area isn't enough */
.tooltip {
  position: fixed;
  top: anchor(--menu-trigger bottom);
  left: anchor(--menu-trigger left);
}
```

Support is still rolling out (Chromium first); always ship a non-positioned fallback layout (e.g. the popover simply renders in normal flow, or a JS positioning library) behind `@supports (anchor-name: --a)`.

---

## 2. Real-World Engineering Scenario

**Scenario**: Custom Checkbox Divs Fail Accessibility Audit.
Marketing page rebuilt checkboxes as styled divs; keyboard and SR support broke. Team reverts to native `<input type="checkbox">` + `accent-color` for brand alignment, or uses the classic adjacent-label + `:checked` pattern with the input not `display:none` (use visually-hidden that remains focusable). Audit passes; fewer JS bugs.

---

## 3. Production-Grade Code Example

```css
:root { color-scheme: light dark; accent-color: var(--brand, oklch(0.62 0.18 255)); }

.field {
  display: grid;
  gap: 0.35rem;
}
.field input,
.field textarea,
.field select {
  font: inherit;
  color: inherit;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: Canvas;
}
.field input:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
.field:has(:user-invalid) input {
  border-color: var(--danger);
}

/* Visually hidden but available to SR + focus */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Custom checkbox keeping native input */
.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.checkbox input {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: var(--brand);
}

.scroll-panel {
  overflow: auto;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  max-height: 20rem;
}

/* Popover progressive enhancement */
[popover] {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: Canvas;
}
```

```html
<button popovertarget="menu">Open</button>
<div id="menu" popover>…</div>
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: `display: none` on Inputs Used With Custom UI
Removes from a11y tree / can break label activation. Use visually-hidden techniques that preserve focus when needed.

### ⚠️ Pitfall 2: Removing Focus Outlines Globally
`outline: none` without `:focus-visible` replacement is an a11y defect.

### ⚠️ Pitfall 3: Autofill Yellow Background Fights Dark Theme
Style with `:-webkit-autofill` hacks carefully; prefer coherent `color-scheme`.

### ⚠️ Pitfall 4: `pointer-events: none` on Interactive Parents
Accidentally disables clicks on children; use only on decorative overlays.

### ⚠️ Pitfall 5: Anchor/Popover Support Assumptions
Always provide non-positioned fallback layout for unsupported browsers.

### ⚠️ Pitfall 6: `anchor()` Without `@supports` Gating
Referencing an anchor that isn't supported doesn't error — the declaration is just ignored, so the element silently falls back to whatever `position`/`top`/`left` it already has. Wrap anchor-dependent rules in `@supports (anchor-name: --a)` so the fallback path is intentional, not accidental.
