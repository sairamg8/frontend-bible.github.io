# 🔷 Advanced Generics: Conditional Types, `infer` & Distribution

## 1. Under-The-Hood Mechanics

Conditional types let a type **branch** based on a compile-time check — the type-system equivalent of an `if/else`, evaluated entirely by the compiler, never at runtime.

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>; // true
type B = IsString<42>;         // false
```

### `infer`: Extracting a Type From Within a Conditional
`infer` introduces a **new type variable** inside a conditional type's `extends` clause, capturing whatever type appears in that position — the mechanism behind "unwrap this generic wrapper type."

```typescript
type Unwrap<T> = T extends Promise<infer U> ? U : T;

type A = Unwrap<Promise<string>>; // string — infer captured the `string` inside Promise<...>
type B = Unwrap<number>;            // number — didn't match the Promise<...> shape, falls to the else branch
```
This is precisely how TypeScript's own built-in `Awaited<T>` utility type works (see [utility types](../06-utility-types/01-built-in-transformations.md)) — it's a conditional type using `infer` recursively to unwrap arbitrarily nested Promises.

### Distributive Conditional Types: Unions Auto-Distribute
When a conditional type's checked type is a **bare type parameter** (not wrapped in anything, e.g. not `[T]`), and the actual type substituted for it is a union, the conditional **distributes** — evaluating separately for each union member and combining the results, rather than checking the union as one single unit.

```typescript
type ToArray<T> = T extends any ? T[] : never;

type Result = ToArray<string | number>; // string[] | number[] — DISTRIBUTED, evaluated per-member
// NOT (string | number)[] — that would be the result WITHOUT distribution
```

---

## 2. Real-World Engineering Scenario

**Scenario**: A Type-Safe Event Emitter Needing to Extract a Handler's Payload Type Automatically.
An event system defines handlers as `(payload: T) => void` for various event types, and a `subscribe` function needs to correctly type its callback's `payload` parameter based on which event name was passed — without requiring every call site to manually re-specify the payload type. A conditional type using `infer` extracts the exact payload type from the handler's own function signature, so `subscribe('user-created', (payload) => ...)` gets `payload` typed correctly and automatically, purely from how `'user-created'`'s handler type was originally declared.

---

## 3. Production-Grade Code Example

```typescript
// Extracting the payload type from an event map's handler signatures via infer
interface EventMap {
  'user-created': (payload: { userId: string; email: string }) => void;
  'order-placed': (payload: { orderId: string; total: number }) => void;
}

type PayloadOf<K extends keyof EventMap> = EventMap[K] extends (payload: infer P) => void ? P : never;

function subscribe<K extends keyof EventMap>(event: K, handler: (payload: PayloadOf<K>) => void) {
  // ... registers the handler
}

subscribe('user-created', (payload) => {
  console.log(payload.userId); // fully typed as { userId: string; email: string } — inferred, not manually annotated
});
```

```typescript
// Distributive conditional types building a "flatten this union of arrays" utility
type ElementType<T> = T extends (infer U)[] ? U : T;

type Result = ElementType<string[] | number[]>; // string | number — distributed per union member, then infer captured each element type
```

```typescript
// Recursive conditional type — unwrapping arbitrarily NESTED Promises (mirrors built-in Awaited<T>)
type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T;

type A = DeepAwaited<Promise<Promise<Promise<string>>>>; // string — recurses until no more Promise wrapping remains
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Expecting Distribution When the Type Parameter Isn't "Bare"
```typescript
// ❌ SURPRISING: wrapping T in a tuple ([T]) SUPPRESSES distribution — a common technique used
// deliberately, but confusing when encountered unexpectedly in library type definitions
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;
type Result = ToArrayNonDistributive<string | number>; // (string | number)[] — NOT distributed, one combined array type

// ✅ AWARENESS: [T] extends [...] is the standard idiom to deliberately OPT OUT of distribution
// when a union should be treated as one unit rather than evaluated member-by-member
```

### ⚠️ Pitfall 2: Overly Deep Recursive Conditional Types Hitting the Compiler's Recursion Limit
```typescript
// ❌ RISKY: TypeScript enforces a maximum recursion depth (currently 50) for recursive conditional
// types — a type recursing over a sufficiently large/deeply-nested real-world input can hit
// "Type instantiation is excessively deep and possibly infinite," a genuine compile error, not a warning
type DeepUnwrap<T> = T extends Array<infer U> ? DeepUnwrap<U> : T; // fine for reasonable nesting depths,
// but a deeply/infinitely self-referential input type can exceed the limit

// ✅ AWARENESS: for genuinely deep/unbounded structures, consider a depth-limited recursive type
// (an explicit counter type parameter) or accept `any`/`unknown` at some bounded depth
```

### ⚠️ Pitfall 3: Using `infer` Without Understanding It Only Captures Within Its Own Conditional's Structure
```typescript
// ❌ WRONG: infer must appear WITHIN the extends clause's structural position — this doesn't compile,
// since U isn't being matched against any specific structural position of T
type Bad<T> = T extends infer U ? U : never; // technically valid syntax, but USELESS — U just equals T itself

// ✅ CORRECT: infer is only meaningful when placed at a SPECIFIC structural position to extract
// from, e.g. inside Promise<infer U>, (infer U)[], (...args: infer U[]) => any, etc.
type Good<T> = T extends Promise<infer U> ? U : never; // U captures specifically the Promise's inner type
```
