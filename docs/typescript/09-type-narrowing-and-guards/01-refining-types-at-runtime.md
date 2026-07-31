# 🔷 Type Narrowing & Guards: Refining Types at Runtime Boundaries

## 1. Under-The-Hood Mechanics

Narrowing is how TypeScript reconciles its static, compile-time type system with genuinely dynamic runtime values (API responses, user input, unknown external data) — a sequence of **control-flow-sensitive** checks that progressively refine a broad type down to a specific one, purely by analyzing the code's structure.

```typescript
function process(value: string | number) {
  if (typeof value === 'string') {
    value.toUpperCase(); // narrowed to `string` HERE, inside this branch only
  } else {
    value.toFixed(2);        // narrowed to `number` HERE — the ELSE branch of a two-member union check
  }
}
```

### The Narrowing Operators
- **`typeof`** — narrows primitives (`string`, `number`, `boolean`, `symbol`, `bigint`, `undefined`, `function`, `object`).
- **`instanceof`** — narrows based on prototype chain membership, for class instances.
- **`in`** — narrows a union of object shapes based on which one actually has a given property key.

### User-Defined Type Guards: `value is X`
When built-in narrowing can't express a check (e.g. validating a complex object shape from an untyped API response), a function with a `parameterName is Type` return type annotation tells the compiler: "if this function returns `true`, narrow the argument to `Type` from this point forward, wherever this function was called as a condition."

```typescript
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value && 'name' in value;
}
```

### Discriminated Unions & Exhaustiveness Checking
A **discriminated union** — several object shapes sharing one common literal-typed field (a "tag"/"kind"/"type") — lets a `switch` on that field narrow each branch to its specific variant automatically. Adding a `default` branch that assigns the (by-then, if all cases were handled, impossible) remaining value to a variable typed `never` turns "did I forget to handle a new union member" into a **compile-time** error the moment a new variant is added to the union, rather than a runtime surprise discovered much later.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Payment Processing System Where Adding a New Payment Method Must Force Every Switch Statement to Be Updated.
A payment system models payment methods as a discriminated union (`{ type: 'card', ... } | { type: 'paypal', ... } | { type: 'bank_transfer', ... }`). Every place in the codebase that switches on `payment.type` uses an exhaustiveness check with a `never`-typed default branch. When a new `'crypto'` payment method is added to the union, **every** switch statement across the codebase that hadn't yet been updated to handle it now fails to compile — turning what would otherwise be a silent, easy-to-miss runtime gap (a new payment type falling through to unhandled default behavior in production) into an immediate, impossible-to-ignore compile error at the exact moment the union was extended.

---

## 3. Production-Grade Code Example

```typescript
// Discriminated union + exhaustiveness checking
type PaymentMethod =
  | { type: 'card'; last4: string }
  | { type: 'paypal'; email: string }
  | { type: 'bank_transfer'; iban: string };

function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

function describePayment(payment: PaymentMethod): string {
  switch (payment.type) {
    case 'card':
      return `Card ending in ${payment.last4}`; // narrowed: only `last4` exists in this branch
    case 'paypal':
      return `PayPal (${payment.email})`;           // narrowed: only `email` exists here
    case 'bank_transfer':
      return `Bank transfer (${payment.iban})`;        // narrowed: only `iban` exists here
    default:
      return assertNever(payment); // if a new variant is added and NOT handled above, THIS becomes a compile error
  }
}
```

```typescript
// User-defined type guard validating an untrusted API response
interface User { id: string; name: string; }

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value && typeof (value as any).id === 'string' &&
    'name' in value && typeof (value as any).name === 'string'
  );
}

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const data: unknown = await res.json(); // correctly typed `unknown` — never trust external data as `any`
  if (!isUser(data)) {
    throw new Error('API returned malformed user data');
  }
  return data; // narrowed to `User` from this point on
}
```

```typescript
// `in` operator narrowing across a union of unrelated object shapes
type Shape = { kind: 'circle'; radius: number } | { kind: 'square'; side: number };

function area(shape: Shape): number {
  if ('radius' in shape) {
    return Math.PI * shape.radius ** 2; // narrowed via the `in` check itself, not just `kind`
  }
  return shape.side ** 2;
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Trusting External Data as `any` Instead of `unknown` + a Type Guard
```typescript
// ❌ DANGEROUS: `any` disables ALL type checking on the API response — a malformed/unexpected
// shape from the backend silently propagates through the entire app with zero compile-time signal
async function fetchUser(id: string): Promise<any> {
  return (await fetch(`/api/users/${id}`)).json();
}

// ✅ CORRECT: type external data as `unknown`, then narrow it explicitly via a real type guard —
// forces every consumer to actually validate the shape before using it
async function fetchUser(id: string): Promise<unknown> { /* ... */ }
```

### ⚠️ Pitfall 2: A Type Guard That Doesn't Actually Verify What It Claims To
```typescript
// ❌ DANGEROUS: this "type guard" ALWAYS returns true regardless of the actual value shape —
// TypeScript trusts the DECLARED `is User` return type, not the function body's actual correctness
function isUser(value: unknown): value is User {
  return true; // compiles fine — TypeScript does NOT verify the guard's logic matches its claim
}

// ✅ CORRECT: the guard's runtime logic must genuinely verify every property the target type requires —
// a type guard is a promise to the compiler; an incorrect one produces confidently-wrong narrowing
```

### ⚠️ Pitfall 3: Forgetting Exhaustiveness Checking Requires the `never` Default, Not Just a Switch
```typescript
// ❌ WRONG: a switch WITHOUT the never-typed default provides ZERO protection against a
// newly-added union member being silently unhandled — this compiles fine even after adding 'crypto'
function describePayment(payment: PaymentMethod): string {
  switch (payment.type) {
    case 'card': return `Card`;
    case 'paypal': return `PayPal`;
    // no default at all — a new 'bank_transfer' variant silently falls through to `undefined` return
  }
}

// ✅ CORRECT: the `default: return assertNever(payment)` pattern is what actually converts a missed
// case into a COMPILE error — omitting it silently reduces this to a runtime gap instead
```
