# 🔷 Core Type System: Primitives, Unions, Inference & `type` vs `interface`

## 1. Under-The-Hood Mechanics

TypeScript's type system is fundamentally **structural** (covered in depth in the [next doc](../02-structural-typing/01-duck-typing-and-variance.md)) and exists **only at compile time** — every type annotation is erased entirely by the time code actually runs; there is no runtime type-checking overhead, and no runtime representation of a `type` or `interface` at all.

```
string, number, boolean, null, undefined, symbol, bigint    ── the 7 primitive types
        │
        ▼
Literal types  ──►  'left' | 'right'   (narrows a primitive DOWN to one exact value, or a finite set)
        │
        ▼
Union (A | B)  ──►  "could be shape A OR shape B" — must narrow before accessing A-only or B-only members
Intersection (A & B) ──►  "has BOTH shapes' members simultaneously" — a single combined shape
```

### Type Inference: The Compiler Guesses So You Don't Have To
```typescript
let count = 5;              // inferred: number (not the literal 5 — `let` widens to the general type)
const label = 'active';       // inferred: 'active' (const DOESN'T widen — it's the literal type itself)
const items = [1, 'two'];       // inferred: (string | number)[] — "best common type" across array elements
```
This distinction (`let` widening vs `const` preserving the literal) is why swapping `let` for `const` can occasionally change what a value is assignable to elsewhere, independent of any actual runtime behavior change.

### `type` vs `interface`: Not Interchangeable Despite Similar Syntax
Both can describe an object's shape, but only `interface` supports **declaration merging** (two `interface Foo` declarations with the same name automatically combine into one) — the mechanism libraries use to let consumers augment a built-in type (e.g. extending Express's `Request` interface with custom properties). `type` aliases, by contrast, can name union/intersection/primitive/mapped/conditional types that `interface` syntax cannot express at all — `type` is strictly more expressive for non-object shapes, while `interface` is preferred idiomatically for plain object shapes specifically because of merging and generally clearer extension error messages.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Third-Party Express Middleware Needing to Attach Custom Data to Every Request.
An auth middleware needs to attach a `user` property to Express's `Request` object so every downstream route handler can read `req.user` with full type safety — but `Request` is defined in a `node_modules` package, not something the app owns. Declaration merging (`interface`-only) lets the app's own `.d.ts` file **augment** the existing `Request` interface from within `@types/express`, adding the `user` property globally across the whole codebase's usage of `Request`, without ever needing to fork or wrap the library's own type definitions.

---

## 3. Production-Grade Code Example

```typescript
// types/express.d.ts — declaration merging to augment a third-party interface
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: 'admin' | 'member' }; // MERGED into the existing Express.Request interface
    }
  }
}
export {}; // required to make this a module, not a global script, while still applying the merge
```

```typescript
// A union type modeling a real API response shape, requiring narrowing before use
type ApiResult<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

function handleResult(result: ApiResult<{ id: string }>) {
  if (result.status === 'success') {
    console.log(result.data.id); // narrowed: TypeScript knows `data` exists ONLY in this branch
  } else {
    console.log(result.message); // narrowed: `message` only exists in the error branch
  }
}
```

```typescript
// Intersection types combining two independent, orthogonal shapes into one
type Timestamped = { createdAt: Date; updatedAt: Date };
type Named = { name: string };

type AuditedEntity = Timestamped & Named; // has ALL FOUR properties simultaneously

const entity: AuditedEntity = {
  name: 'Acme Corp',
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

```typescript
// const vs let widening — a real source of "why doesn't this type match" confusion
function move(direction: 'left' | 'right') { /* ... */ }

let dir = 'left';          // inferred as `string` (widened) — NOT 'left'
move(dir); // ❌ Argument of type 'string' is not assignable to parameter of type '"left" | "right"'

const dir2 = 'left';         // inferred as the LITERAL type 'left' — narrow, preserved
move(dir2); // ✅ works — 'left' is assignable to 'left' | 'right'
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Assuming `type` and `interface` Are Fully Interchangeable
```typescript
// ❌ WRONG: type aliases CANNOT be re-opened/merged — this is a compile ERROR, not a merge
type User = { name: string };
type User = { age: number }; // Error: Duplicate identifier 'User'

// ✅ CORRECT: use interface specifically when merging/augmentation is needed
interface User { name: string; }
interface User { age: number; } // merges into { name: string; age: number }
```

### ⚠️ Pitfall 2: Expecting `let` to Preserve a Literal Type Like `const` Does
```typescript
// ❌ SURPRISING: this widens to `string`, breaking assignability to a literal-typed parameter
let status = 'active';
updateStatus(status); // fails if updateStatus expects 'active' | 'inactive'

// ✅ CORRECT: use const when the value won't be reassigned, or annotate explicitly
const status: 'active' | 'inactive' = 'active';
```

### ⚠️ Pitfall 3: Forgetting That All Types Are Erased at Runtime
```typescript
// ❌ WRONG: this is a common beginner mistake — types don't exist at runtime, so this check is meaningless
function process(value: string | number) {
  if (typeof value === MyType) { /* MyType doesn't exist as a runtime value at all — compile error */ }
}

// ✅ CORRECT: runtime narrowing must use ACTUAL runtime checks (typeof, instanceof, custom guards) —
// see the dedicated type narrowing & guards doc for the full pattern set
if (typeof value === 'string') { /* ... */ }
```
