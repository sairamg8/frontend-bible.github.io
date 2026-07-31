# 🔷 Functions & Generics: Type Expressions, Constraints & Overloads

## 1. Under-The-Hood Mechanics

Generics let a function/type be written **once** while remaining fully type-safe across many different concrete types — the alternative (`any`, or hand-duplicating the function per type) either loses type safety entirely or violates DRY.

```typescript
function identity<T>(arg: T): T { return arg; }
//                 │           │
//                 │           └── the RETURN type is tied to whatever T was inferred/passed as
//                 └── T is a TYPE PARAMETER — filled in per call-site, either explicitly or by inference

identity('hello');     // T inferred as 'hello' (or string, contextually)
identity<number>(5);     // T explicit — bypasses inference entirely
```

### Constrained Generics: `T extends X`
```typescript
function getLength<T extends { length: number }>(item: T): number {
  return item.length; // safe — T is GUARANTEED to have a `.length` property, whatever else it has
}
```
`extends` here means "T can be anything, as long as it at least has this shape" — not class inheritance; this is a **constraint**, narrowing which types are valid for T without fixing T to one specific type.

### Function Overloads: Multiple Signatures, One Implementation
```typescript
function parseInput(value: string): string[];      // overload signature 1
function parseInput(value: number): number[];         // overload signature 2
function parseInput(value: string | number): unknown[] {  // implementation signature — NOT itself callable externally
  return typeof value === 'string' ? value.split('') : [value];
}
```
The implementation signature is intentionally broader/looser and invisible to callers — only the specific overload signatures above it are what callers actually see and get type-checked against, letting a single runtime function expose several distinct, precise call shapes.

### Default Generic Parameters
`<T = DefaultType>` lets a generic be omitted at the call site, falling back to a sensible default — useful for generic utility types/functions where the common case shouldn't require every caller to specify every type parameter explicitly.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Generic API Client Function Reused Across Dozens of Differently-Shaped Endpoints.
An API client's `request<T>(url: string): Promise<T>` function is called from dozens of places, each expecting a different response shape (`request<User>(...)`,  `request<Product[]>(...)`) — without generics, this would require either a separate hand-written function per endpoint (massive duplication) or returning `any` (losing all type safety at every call site). The generic version, combined with a constraint ensuring `T` is always a JSON-serializable shape, gives every call site full type inference on the resolved data with zero per-endpoint boilerplate.

---

## 3. Production-Grade Code Example

```typescript
// A generic, constrained API client function
interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

async function request<T>(url: string, options: ApiClientOptions = {}): Promise<T> {
  const res = await fetch(url, {
    method: options.method ?? 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

interface User { id: string; name: string; }
const user = await request<User>('/api/users/1'); // user: User — fully typed, zero per-call duplication
const products = await request<Product[]>('/api/products'); // products: Product[]
```

```typescript
// Constrained generics — ensuring T always has what the function body actually needs
function sortByKey<T, K extends keyof T>(items: T[], key: K): T[] {
  return [...items].sort((a, b) => (a[key] > b[key] ? 1 : -1));
}

interface Product { id: string; price: number; name: string; }
sortByKey<Product, 'price'>(products, 'price'); // ✅ 'price' is a valid key of Product
sortByKey(products, 'nonexistent'); // ❌ Error: 'nonexistent' is not assignable to keyof Product
```

```typescript
// Function overloads — one implementation, multiple precise external call shapes
function createElement(tag: 'button'): HTMLButtonElement;
function createElement(tag: 'input'): HTMLInputElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

const btn = createElement('button'); // typed as HTMLButtonElement — .disabled, .type autocomplete correctly
const input = createElement('input'); // typed as HTMLInputElement — .value, .checked autocomplete correctly
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Using `any` Instead of a Generic, Losing Type Safety at Every Call Site
```typescript
// ❌ WRONG: works, but every caller loses all type information about what comes back
async function request(url: string): Promise<any> { /* ... */ }
const user = await request('/api/users/1');
user.nam; // ❌ typo, but NO compile error — `any` disables checking entirely

// ✅ CORRECT: a generic preserves full type safety per call site
async function request<T>(url: string): Promise<T> { /* ... */ }
const user = await request<User>('/api/users/1');
user.nam; // ✅ compile error: Property 'nam' does not exist on type 'User' — caught immediately
```

### ⚠️ Pitfall 2: An Unconstrained Generic That Should Have Been Constrained
```typescript
// ❌ WRONG: T is completely unconstrained — nothing stops calling this with a type that has NO length property
function getLength<T>(item: T): number {
  return (item as any).length; // forced into an `any` cast to even compile — the generic provided no real safety
}

// ✅ CORRECT: constrain T to guarantee the shape the function body actually depends on
function getLength<T extends { length: number }>(item: T): number {
  return item.length; // no cast needed — T is guaranteed to have .length
}
```

### ⚠️ Pitfall 3: Overload Signatures That Don't Match the Implementation Signature's Actual Behavior
```typescript
// ❌ DANGEROUS: the overload PROMISES a string[] for string input, but the implementation
// doesn't actually guarantee that — TypeScript trusts the overload signatures without verifying
// the implementation body truly satisfies each one beyond basic type compatibility
function parse(value: string): string[];
function parse(value: unknown): unknown {
  return value; // returns the value AS-IS, not actually split into a string[] — a runtime lie the types don't catch
}

// ✅ CORRECT: ensure the implementation genuinely fulfills what each overload signature promises,
// since TypeScript's overload checking is a DECLARED contract, not a runtime-verified one
```
