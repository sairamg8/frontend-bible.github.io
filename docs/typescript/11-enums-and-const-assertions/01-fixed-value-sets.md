# 🔷 Enums & Const Assertions: Fixed Value Sets

## 1. Under-The-Hood Mechanics

TypeScript offers two genuinely different mechanisms for modeling "a fixed set of allowed values" — `enum` (a real, compiled JS construct) and `as const` (a purely type-level annotation) — with different runtime footprints and different idiomatic use in modern codebases.

```typescript
enum Direction { Up, Down, Left, Right }        // compiles to an ACTUAL JS object at runtime
// { 0: "Up", 1: "Down", 2: "Left", 3: "Right", Up: 0, Down: 1, Left: 2, Right: 3 } — note the REVERSE mapping

const directions = ['up', 'down', 'left', 'right'] as const;  // NO runtime object generated — purely narrows the TYPE
type Direction2 = typeof directions[number]; // 'up' | 'down' | 'left' | 'right' — a union, derived from the array
```

### Numeric vs String Enums: Reverse Mapping Only Exists for Numeric
A numeric `enum` compiles with a **bidirectional** mapping (`Direction.Up === 0` AND `Direction[0] === 'Up'`) — a genuine runtime object with both directions populated. A **string** enum (`enum Status { Active = 'ACTIVE' }`) compiles WITHOUT reverse mapping (`Status['ACTIVE']` is `undefined`) — only the forward `Status.Active === 'ACTIVE'` direction exists, since reverse-mapping string values would risk key collisions with the enum's own member names.

### `const enum`: Inlined, No Runtime Object At All
`const enum Direction { Up, Down }` is **fully erased** — every usage (`Direction.Up`) is replaced with its literal value (`0`) directly at the call site during compilation, with no enum object ever emitted to the output JS at all. This trades away runtime introspection (you can't iterate over a `const enum`'s members at runtime, since no object exists) for zero runtime footprint.

### `as const`: Freezing Literal Types, the Modern Preference
`as const` on an array/object literal prevents TypeScript from **widening** its elements to their general types (`string` instead of `'active'`) and marks every property `readonly` — increasingly preferred over `enum` in modern codebases specifically because it produces zero extra runtime code, works naturally with plain string/number values (no special enum-specific syntax to learn), and integrates more cleanly with `keyof`/mapped types.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Team Standardizing on `as const` Objects Instead of Enums for a New Public API Package.
A team building an npm package consumed by external users chose `as const` objects over TypeScript `enum` for status codes, specifically because `enum` types don't exist in plain JavaScript — a consumer writing plain JS (not TypeScript) importing the package could reference the compiled enum object fine, but any TypeScript-authored internal enum comparison logic assuming enum-specific behavior (like reverse mapping) wouldn't translate to how a JS-only consumer would naturally interact with the values. An `as const` object of status strings compiles to a completely ordinary plain JS object, works identically for TS and plain-JS consumers alike, and avoids the well-known cross-module enum comparison pitfalls entirely.

---

## 3. Production-Grade Code Example

```typescript
// as const: the modern, zero-runtime-overhead preferred pattern
const OrderStatus = {
  Pending: 'PENDING',
  Shipped: 'SHIPPED',
  Delivered: 'DELIVERED',
  Cancelled: 'CANCELLED',
} as const;

type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus]; // 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

function updateStatus(status: OrderStatus) { /* ... */ }
updateStatus(OrderStatus.Shipped); // ✅ fully typed, autocompletes, zero enum-specific runtime object needed
```

```typescript
// const enum: fully inlined, zero runtime footprint — but no runtime iteration/introspection possible
const enum LogLevel { Debug, Info, Warn, Error }

function log(level: LogLevel, message: string) {
  console.log(`[${level}] ${message}`); // `level` is INLINED to its numeric literal at compile time
}
log(LogLevel.Warn, 'Low disk space'); // compiles to: log(2, 'Low disk space') — LogLevel itself never exists at runtime
```

```typescript
// String enum vs numeric enum reverse-mapping difference
enum NumericStatus { Active, Inactive } // numeric — has reverse mapping
console.log(NumericStatus[0]); // 'Active' — reverse mapping WORKS

enum StringStatus { Active = 'ACTIVE', Inactive = 'INACTIVE' } // string — NO reverse mapping
console.log(StringStatus['ACTIVE']); // undefined — string enums don't generate a reverse map at all
console.log(StringStatus.Active); // 'ACTIVE' — only the forward direction exists
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Forgetting `enum` Members Are Structurally Compatible With Their Underlying Primitive, But NOT Vice Versa
```typescript
// ❌ SURPRISING: a plain number CANNOT be passed where an enum type is expected, even though
// the enum member itself IS just a number under the hood — this catches real bugs, but confuses
// engineers expecting enums to be "just numbers" bidirectionally
enum Direction { Up, Down }
function move(dir: Direction) { /* ... */ }
move(0); // ❌ Error (for STRING enums; NUMERIC enums actually DO allow this, an inconsistency worth knowing)
move(Direction.Up); // ✅ correct
```

### ⚠️ Pitfall 2: Using `const enum` in a Codebase With Isolated Module Compilation
```typescript
// ❌ BREAKS: const enum requires the compiler to see the ENUM'S OWN DECLARATION at the point
// of use to inline its value — this is fundamentally incompatible with `isolatedModules: true`
// (required by single-file transpilers like Babel/esbuild/swc, which process files independently)
export const enum Status { Active, Inactive } // fails to compile with isolatedModules enabled

// ✅ CORRECT: use a regular enum or an `as const` object in any codebase using a single-file
// transpiler (Vite, most modern bundler setups) instead of tsc's full-program compilation
```

### ⚠️ Pitfall 3: Forgetting `as const` Needs `keyof typeof` to Derive a Union From an Object
```typescript
// ❌ WRONG: typeof OrderStatus alone gives the OBJECT's type (all its keys AND value types combined),
// not the union of its VALUES — a common mistake when first switching from enum to as const
type Wrong = typeof OrderStatus; // { readonly Pending: "PENDING"; readonly Shipped: "SHIPPED"; ... } — the whole object shape

// ✅ CORRECT: index by keyof typeof to get the union of VALUES specifically
type Correct = typeof OrderStatus[keyof typeof OrderStatus]; // "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
```
