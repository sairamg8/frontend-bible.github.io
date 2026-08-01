# 🧩 Custom Properties, Functions, Nesting & At-Rules

## 1. Under-The-Hood Mechanics

### Custom Properties
`--name: value` are inherited by default. `var(--name, fallback)` substitutes at **computed-value** time. Invalid substitutions can invalidate entire declarations at computed-value-time (property falls back as unset).

### `@property`
Registers a typed custom property (`syntax`, `inherits`, `initial-value`) so the engine can **animate** it and validate types:

```css
@property --angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}
```

### Math & Values
`calc()`, `min()`, `max()`, `clamp()` cover everyday sizing. CSS Values 4 adds trig and numeric functions for **generative** layouts (angles, ratios, procedural spacing) without a preprocessor or JS:

| Function | Does |
|---|---|
| `sin()` / `cos()` / `tan()` | Standard trig, takes an angle, returns a unitless number |
| `asin()` / `acos()` / `atan()` | Inverse trig, returns an angle |
| `atan2(y, x)` | Angle of a point from origin — handles all four quadrants (unlike `atan`) |
| `abs()` | Absolute value |
| `sign()` | `-1` / `0` / `1` depending on the sign of the argument |
| `round(<strategy>, A, B)` | Rounds `A` to nearest multiple of `B` (`nearest`/`up`/`down`/`to-zero`) |
| `mod(A, B)` | Remainder, result **takes the sign of B** (matches `%` in most languages) |
| `rem(A, B)` | Remainder, result **takes the sign of A** (matches JS `%` / C `fmod`) |

```css
/* Points arranged evenly around a circle, no JS */
.dial {
  --angle: calc(360deg / var(--count) * var(--i));
  --radius: 8rem;
  transform:
    translate(
      calc(cos(var(--angle)) * var(--radius)),
      calc(sin(var(--angle)) * var(--radius))
    );
}

/* Snap a fluid value to a step grid */
.tile {
  width: round(down, var(--available), 4rem);
}

/* mod() vs rem() sign behavior with a negative operand */
width: calc(1px * mod(-3, 4)); /*  1px — sign of divisor (4) */
width: calc(1px * rem(-3, 4)); /* -3px — sign of dividend (-3) */
```

### Nesting
Native nesting mirrors Sass-like structure; `&` denotes parent. Nested rules still participate in specificity as written.

### Feature Queries
`@supports` gates progressive enhancement. Combine with `@media`, `@container`, `@layer`, `@scope`.

---

## 2. Real-World Engineering Scenario

**Scenario**: Theme Tokens Aren't Animatable for a Gradient Spinner.
`--angle: 0deg` toggled to `360deg` with transition did nothing — unregistered custom props often won't interpolate. Registering `@property --angle` with angle syntax makes `transition: --angle 1s linear` work, enabling a pure-CSS conic-gradient spinner driven by one variable.

---

## 3. Production-Grade Code Example

```css
@property --hue {
  syntax: "<number>";
  inherits: true;
  initial-value: 220;
}

:root {
  --brand: oklch(0.62 0.18 var(--hue));
  --radius: 0.5rem;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --header-h: 3.5rem;
  --content-w: min(72rem, 100% - 2rem);
}

.button {
  --_bg: var(--brand);
  background: var(--_bg);
  border-radius: var(--radius);
  padding: var(--space-2) var(--space-3);
  /* local tokens with underscore convention for private */
}

.button--ghost {
  --_bg: transparent;
  color: var(--brand);
  border: 1px solid var(--brand);
}

/* Nesting */
.card {
  padding: var(--space-3);
  & h2 { margin: 0 0 var(--space-2); }
  & .meta { color: color-mix(in oklch, CanvasText 65%, transparent); }
  &:hover { box-shadow: 0 4px 16px rgb(0 0 0 / 0.08); }
  @media (width >= 48rem) {
    padding: calc(var(--space-3) * 1.5);
  }
}

/* Feature query */
@supports (height: 100dvh) {
  .app { min-height: 100dvh; }
}
@supports not (height: 100dvh) {
  .app { min-height: 100vh; }
}

/* Generative spacing */
.stack {
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 0.25rem + 1vw, 1.25rem);
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Invalid `var()` Nuke Whole Property
```css
/* if --pad is invalid/missing without fallback, padding is invalid */
padding: var(--pad);
/* ✅ */
padding: var(--pad, 1rem);
```

### ⚠️ Pitfall 2: Assuming Custom Props Always Inherit
You can set `inherits: false` via `@property`, or reset with `--x: initial` on a subtree.

### ⚠️ Pitfall 3: Circular Dependencies
`--a: var(--b); --b: var(--a)` invalidates. Keep token graphs acyclic (primitive → semantic → component).

### ⚠️ Pitfall 4: Nesting Specificity Footguns
Deep nesting recreates specificity wars. Nest for locality, not for long chains; prefer flat utilities/layers for overrides.

### ⚠️ Pitfall 5: `@import` in Production Apps
Order and performance traps — prefer bundler composition + explicit `@layer` order in one entry file.

### ⚠️ Pitfall 6: `mod()` vs `rem()` Sign Confusion
They only differ when operands have opposite signs. Reaching for the wrong one silently flips a sign in generative layouts (e.g. a dial/gauge landing on the wrong side of zero) — pick based on which operand's sign you want to preserve, not by habit from one language.
