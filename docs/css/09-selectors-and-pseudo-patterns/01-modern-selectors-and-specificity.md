# 🎯 Selectors, Pseudo-Classes & Pseudo-Elements

## 1. Under-The-Hood Mechanics

Selectors match elements; the cascade then picks winning declarations. Combinators relate nodes:

| Combinator | Meaning |
|---|---|
| ` ` (descendant) | any depth |
| `>` | direct child |
| `+` | adjacent sibling |
| `~` | subsequent siblings |
| `||` | column combinator (tables) |

### Attribute Selectors
Match on presence or substring of an attribute value — no extra classes needed for state hooks:

| Selector | Matches |
|---|---|
| `[attr]` | Attribute present, any value |
| `[attr=val]` | Exact value |
| `[attr^=val]` | Value **starts with** `val` |
| `[attr$=val]` | Value **ends with** `val` |
| `[attr*=val]` | Value **contains** `val` anywhere |
| `[attr~=val]` | `val` is one whitespace-separated word in the value |
| `[attr\|=val]` | Value equals `val` or starts with `val-` (language subcode style) |

Append `i` before the closing bracket for a case-**in**sensitive match (`[attr=val i]`), or `s` to force case-**sensitive** matching in contexts (like HTML) that are normally insensitive.

```css
a[href^="https://"] { }               /* external-style links */
a[href$=".pdf"]::after { content: " (PDF)"; }
[class*="col-"] { }                    /* any class containing "col-" */
input[type="email" i] { }              /* case-insensitive attribute value */
```

### Modern Functional Pseudo-Classes
- **`:is(a, b)`** — match any; specificity = most specific argument.
- **`:where(a, b)`** — same matching, **zero specificity** (ideal for resets/base).
- **`:not(a)`** — negation; specificity from argument.
- **`:has(a)`** — relational/"parent" selector: element matches if relative selector matches in its subtree/siblings (powerful, can be expensive if abused).

### Structural & Form State
`:nth-child(An+B of S)`, `:first-child`, `:focus-visible`, `:focus-within`, `:user-invalid`, `:placeholder-shown`, `:autofill`, `:disabled`.

### Pseudo-Elements
`::before` / `::after` (need `content`), `::marker`, `::selection`, `::backdrop`, `::placeholder`, `::file-selector-button`.

---

## 2. Real-World Engineering Scenario

**Scenario**: Highlight a Card When Any Nested Input Is Invalid.
Previously required JS class toggles on every input event. `:has()` enables `.card:has(:user-invalid) { border-color: var(--danger); }` and `.form-row:has(:checked) { … }` for pure-CSS progressive enhancement. Team still keeps JS for submit logic; CSS owns visual state.

---

## 3. Production-Grade Code Example

```css
/* Zero-specificity base with :where */
:where(h1, h2, h3) { line-height: 1.2; text-wrap: balance; }
:where(a) { color: inherit; }

/* Group without specificity inflation */
:is(header, footer) a:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

/* Parent state via :has */
.card:has(a:focus-visible) {
  box-shadow: 0 0 0 2px var(--focus);
}
.field:has(:user-invalid) .field__hint {
  color: var(--danger);
}

/* nth with "of" syntax — only count .item siblings */
.list > .item:nth-child(odd of .item) {
  background: var(--stripe);
}

/* Empty state without extra class when possible */
.list:not(:has(.item))::before {
  content: "No items yet";
  color: var(--muted);
}

/* Pseudo-element icon bullet */
.feature::before {
  content: "";
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  margin-inline-end: 0.5rem;
  border-radius: 50%;
  background: var(--color-primary);
  vertical-align: 0.15em;
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Overusing `:has()` on Hot Paths
Deep/complex `:has` can increase style recalculation cost. Prefer class hooks for high-frequency toggles (open menus every frame); use `:has` for form/validation/layout state.

### ⚠️ Pitfall 2: `:is()` Specificity Surprises
`:is(#id, .class)` is as specific as an ID when that branch matches — can unexpectedly beat utilities. Use `:where` when you want soft defaults.

### ⚠️ Pitfall 3: `::before` Without `content`
No box is generated if `content` is missing (or `none`).

### ⚠️ Pitfall 4: Styling Only `:focus` (Mouse Users Get Rings Everywhere)
Prefer `:focus-visible` for keyboard-oriented rings; keep high contrast.

### ⚠️ Pitfall 5: Attribute Selectors vs Classes
`[data-state=open]` is fine for state machines; remember specificity equals a class (0,1,0) for simple attribute selectors — not free of cascade impact.
