# 🧭 Recipe: Form Layout With Subgrid-Aligned Labels/Fields 🟢 `[D]`

> **Priority Badges:** 🟢 `[D]` Daily · 🟡 `[O]` Occasional · 🔴 `[R]` Rare-but-critical

---

## 1. Under-The-Hood Mechanics

A form is usually a repeated `label | field` two-column pattern, but grouped
into fieldsets/sections the naive way (`.field { display: grid; ... }` per
row) means each row's grid tracks are computed **independently** — label
columns across different rows don't line up unless every label happens to be
the same width. `subgrid` makes each `.field` row **adopt the parent's column
tracks** instead of creating its own, so labels stay aligned across grouped
sections without measuring anything.

---

## 2. Real-World Engineering Scenario

**Scenario**: Multi-Section Settings Form With Fieldsets.
A settings page groups fields into `<fieldset>` sections ("Profile",
"Notifications", "Billing"). Each fieldset used to be its own 2-column grid,
so label columns drifted — "Email" in one section didn't line up with "Phone"
in the next. Making each fieldset's row `grid-template-columns: subgrid`
against one outer form grid fixes the alignment without hardcoding a label
width anywhere, and it still reflows correctly if a fieldset is added/removed.

---

## 3. Production-Grade Code Example

```css
.form {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 0.75rem 1rem;
}

.form fieldset {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  gap: inherit;
  border: 0;
  padding: 0;
  margin: 0;
}
.form legend {
  grid-column: 1 / -1;
  font-weight: 600;
  padding-block: 0.5rem;
}

.field {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid; /* adopts the outer 2-col tracks */
  align-items: baseline;
}
.field label {
  grid-column: 1;
}
.field .control {
  grid-column: 2;
  min-width: 0;
}
```

```html
<form class="form">
  <fieldset>
    <legend>Profile</legend>
    <div class="field"><label for="name">Name</label><input class="control" id="name" /></div>
    <div class="field"><label for="email">Email</label><input class="control" id="email" type="email" /></div>
  </fieldset>
  <fieldset>
    <legend>Notifications</legend>
    <div class="field"><label for="freq">Frequency</label><select class="control" id="freq"></select></div>
  </fieldset>
</form>
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Forgetting `grid-column: 1 / -1` on the Subgrid Container
`subgrid` only adopts parent tracks across the span the element itself
occupies. A `fieldset` or `.field` that's only 1 column wide has nothing to
subgrid into — it must first span the full track range with `grid-column: 1 / -1`.

### ⚠️ Pitfall 2: No Fallback for Unsupported Browsers
Subgrid support is solid in current evergreen browsers but not universal on
older engines. Provide a simple 2-column grid/flex fallback (misaligned
labels is a cosmetic degrade, not a functional break) rather than blocking
form rendering on subgrid support.

### ⚠️ Pitfall 3: `gap: inherit` Omitted on Nested Subgrids
Without it, nested subgrid containers default to `gap: normal` (0), so rows
inside a fieldset visually collapse together even though the outer form has
a `gap` set.

### ⚠️ Pitfall 4: Mixing Subgrid Rows With Non-Subgrid Siblings
If one `.field` isn't marked `subgrid` (e.g. a full-width textarea row), give
it `grid-column: 1 / -1` explicitly too — otherwise it silently lands in
column 1 only, at whatever width `max-content` resolved to for the label
column.
