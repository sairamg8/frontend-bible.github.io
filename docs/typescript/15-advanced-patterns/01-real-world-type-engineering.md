# 🔷 Advanced Patterns: Branded Types, Builder Patterns, Schema Inference & `satisfies`

## 1. Under-The-Hood Mechanics

These patterns each solve a real-world gap that the core type system, taken in isolation, doesn't cover — they're combinations of the primitives covered elsewhere in this bible, applied to specific, recurring engineering problems.

### Branded/Nominal Types: Simulating Nominal Typing in a Structural System
As shown in the [structural typing doc](../02-structural-typing/01-duck-typing-and-variance.md), two structurally-identical types (`Celsius`/`Fahrenheit`, both `{ value: number }`) are freely interchangeable — a real correctness gap for domain concepts that are structurally identical to `string`/`number` but semantically distinct (a `UserId` vs a `ProductId`, both plain strings). A **brand** — an unused, never-actually-populated property acting as a compile-time-only tag — breaks that accidental interchangeability:

```typescript
type UserId = string & { readonly __brand: 'UserId' };
type ProductId = string & { readonly __brand: 'ProductId' };

function getUser(id: UserId) { /* ... */ }
getUser('abc' as ProductId); // ❌ Error — even though both are "just strings" underneath
```

### Type-Safe Builder Patterns: Progressively Narrowing Generic State
A fluent builder API can use a generic type parameter to track **which methods have already been called**, making it a compile error to call `.build()` before all required steps have been completed — the type parameter itself changes shape with each chained call.

### Schema-Inferred Types: `z.infer<typeof schema>`
Runtime validators (zod, and similar libraries) let a **single schema definition** serve as both the runtime validation logic AND the compile-time type — via a `z.infer<typeof schema>` utility — eliminating the classic "the TypeScript interface and the runtime validator drifted out of sync" class of bug, since there's only one source of truth for both.

### `satisfies`: Validating Without Widening
`satisfies` checks a value against a type **without** changing the value's own inferred type the way an explicit annotation would — preserving literal-type precision while still getting the safety check.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Codebase Where a `UserId` Was Accidentally Passed to a Function Expecting a `ProductId`.
A checkout function accidentally received a user ID where a product ID was expected — both were typed as plain `string`, so nothing caught it at compile time; the bug only surfaced as a confusing runtime 404 from the products API. Introducing branded types for every ID type in the domain model made this exact class of mistake a compile error going forward — the two types are structurally `string` underneath (zero runtime cost, zero serialization change) but are no longer freely interchangeable at the type level.

---

## 3. Production-Grade Code Example

```typescript
// Branded types — zero runtime cost, compile-time-only nominal distinction
type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, 'UserId'>;
type ProductId = Brand<string, 'ProductId'>;

function createUserId(raw: string): UserId { return raw as UserId; } // the ONLY sanctioned way to produce one
function addToCart(userId: UserId, productId: ProductId) { /* ... */ }

const userId = createUserId('u_123');
addToCart(userId, userId as unknown as ProductId); // requires an EXPLICIT, visible double-cast to misuse — no accidental mixups
```

```typescript
// Type-safe builder — the generic tracks which steps have been completed
class QueryBuilder<HasWhere extends boolean = false> {
  private clauses: string[] = [];

  where(condition: string): QueryBuilder<true> {
    this.clauses.push(`WHERE ${condition}`);
    return this as unknown as QueryBuilder<true>;
  }

  build(this: QueryBuilder<true>): string { // `this` parameter REQUIRES HasWhere to be true
    return this.clauses.join(' ');
  }
}

new QueryBuilder().where('id = 1').build(); // ✅ where() was called first — build() is now callable
// new QueryBuilder().build(); // ❌ Error — build() requires QueryBuilder<true>, but this is QueryBuilder<false>
```

```typescript
// Schema-inferred types — one source of truth for both runtime validation AND the static type
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
});

type User = z.infer<typeof UserSchema>; // { id: string; email: string; role: 'admin' | 'member' } — DERIVED, never hand-written

function parseUser(data: unknown): User {
  return UserSchema.parse(data); // runtime validation AND the return type are both driven by the SAME schema
}
```

```typescript
// satisfies — validates against a type WITHOUT widening the value's own inferred type
const routes = {
  home: '/',
  userProfile: '/users/:id',
} satisfies Record<string, string>;

// Without satisfies (using a type annotation instead), routes.home would widen to `string`.
// WITH satisfies, routes.home retains its LITERAL type '/' — useful for downstream template-literal-type work
type HomeRoute = typeof routes.home; // '/' — the precise literal, not just `string`
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Forgetting Branded Types Still Require an Explicit Cast Somewhere
```typescript
// ❌ INCONVENIENT (but intentional): branded types can't be produced from a plain string literal
// directly — SOME cast is always required at the boundary where raw data becomes a branded type
const id: UserId = 'u_123'; // ❌ Error — plain string isn't assignable to the branded type

// ✅ CORRECT: funnel all creation through one explicit, well-named factory function (as shown above) —
// the goal is preventing ACCIDENTAL mixing, not eliminating casts altogether
const id: UserId = createUserId('u_123'); // ✅ the ONE sanctioned entry point
```

### ⚠️ Pitfall 2: Using a Type Annotation Instead of `satisfies` When Literal Precision Matters
```typescript
// ❌ WRONG: an explicit type annotation WIDENS routes.home to `string` — losing the literal '/'
const routes: Record<string, string> = { home: '/', userProfile: '/users/:id' };
type HomeRoute = typeof routes.home; // string — NOT '/', precision lost

// ✅ CORRECT: satisfies validates the shape WITHOUT widening the inferred literal types
const routes2 = { home: '/', userProfile: '/users/:id' } satisfies Record<string, string>;
type HomeRoute2 = typeof routes2.home; // '/' — precise literal preserved
```

### ⚠️ Pitfall 3: Letting the Zod Schema and a Hand-Written Interface Drift Out of Sync
```typescript
// ❌ WRONG: maintaining BOTH a hand-written interface AND a separate zod schema for "the same"
// shape reintroduces exactly the drift problem schema-inference was meant to eliminate
interface User { id: string; email: string; role: 'admin' | 'member'; } // hand-written, can drift
const UserSchema = z.object({ id: z.string(), email: z.string(), role: z.enum(['admin', 'member']) }); // separate, can also drift

// ✅ CORRECT: derive the TYPE from the schema — one source of truth, impossible to drift apart
const UserSchema2 = z.object({ id: z.string(), email: z.string().email(), role: z.enum(['admin', 'member']) });
type User2 = z.infer<typeof UserSchema2>;
```
