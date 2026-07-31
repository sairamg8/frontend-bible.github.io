# 🔷 Interfaces & Type Aliases: Declaration Merging, `readonly`, Optional Props & Index Signatures

## 1. Under-The-Hood Mechanics

Object shape definitions carry several qualifiers that each encode a distinct compile-time-only contract — none of them exist once the code is transpiled to JS, but each catches a real class of bug during development.

```typescript
interface UserRecord {
  readonly id: string;         // assignable ONCE (at construction), any later write is a compile ERROR
  name: string;
  nickname?: string;             // OPTIONAL — may be omitted entirely, distinct from being `undefined`
  [key: string]: unknown;          // INDEX SIGNATURE — allows any additional string-keyed property
}
```

### `readonly`: Compile-Time-Only Immutability
`readonly` prevents **reassignment** through that specific type's reference — it does not deep-freeze the object at runtime (nothing stops a `readonly` array's elements from being mutated in place via `.push()`, since `readonly` on an array type only blocks reassigning the array reference itself and index-based writes, not all mutation methods depending on the exact type used). True runtime immutability requires an actual runtime mechanism (`Object.freeze()`), which TypeScript's `readonly` does not provide on its own.

### Optional (`?`) vs Explicitly `| undefined`
```typescript
interface Config { timeout?: number; }        // `timeout` key may be ENTIRELY ABSENT from the object
interface Config2 { timeout: number | undefined; }  // `timeout` key MUST be present, but its value may be undefined
```
These are subtly different: `Object.keys()` on a `Config` missing `timeout` won't include the key at all, while a `Config2` object must always have the key present (even if its value is `undefined`) — a distinction that matters for `JSON.stringify` output, spread-merging behavior, and `in` operator checks.

### Declaration Merging: `interface`-Only
As covered in the [core type system doc](../01-core-type-system/01-foundations-and-inference.md), multiple `interface` declarations with the same name automatically combine — this is the mechanism behind augmenting third-party/global types.

### Index Signatures: Dynamic-Keyed Objects
`[key: string]: T` types an object whose keys aren't known in advance (a lookup table, a dictionary) — but it comes with a real safety tradeoff: **every** access via that index signature is typed as `T`, even for keys that were never actually set, meaning `obj['nonexistent']` type-checks fine but is `undefined` at runtime unless `noUncheckedIndexedAccess` is enabled to force `T | undefined` instead.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Feature-Flag Lookup Table Where a Missing Key Silently Produced a Runtime Crash.
A feature-flags object was typed with a plain index signature (`{ [key: string]: boolean }`), and code read `flags[flagName]` assuming it always resolved to a real boolean — a typo'd flag name (checked against a flag that had since been renamed/removed) resolved to `undefined` at runtime, which then failed a strict `=== true` check silently rather than throwing, masking the actual bug (a missing flag) as "the feature is just off." Enabling `noUncheckedIndexedAccess` in `tsconfig.json` would have forced the type to `boolean | undefined`, surfacing the unhandled `undefined` case as a compile error instead of a silent runtime surprise.

---

## 3. Production-Grade Code Example

```typescript
// Declaration merging: augmenting a third-party interface from your own app code
// (see also the core type system doc's Express.Request example)
interface Window {
  __APP_CONFIG__: { apiUrl: string; env: 'dev' | 'staging' | 'prod' }; // merges into the global lib.dom.d.ts Window
}

const config = window.__APP_CONFIG__; // fully typed, no `any` cast needed anywhere in the app

// readonly properties — compile-time immutability contract
interface AuditLogEntry {
  readonly id: string;
  readonly timestamp: number;
  message: string; // mutable — only id/timestamp are protected
}

function createEntry(message: string): AuditLogEntry {
  return { id: crypto.randomUUID(), timestamp: Date.now(), message };
}

const entry = createEntry('User logged in');
entry.message = 'Updated message'; // ✅ fine — message isn't readonly
entry.id = 'new-id'; // ❌ Cannot assign to 'id' because it is a read-only property

// Optional vs required-but-possibly-undefined — a genuine semantic difference
interface ApiResponse {
  data?: unknown;          // key MAY be absent entirely (e.g. a 204 No Content response)
  error: string | null;      // key is ALWAYS present, but its value may be null (explicit "no error")
}

// Index signatures with noUncheckedIndexedAccess enabled (tsconfig.json: "noUncheckedIndexedAccess": true)
interface FeatureFlags {
  [flagName: string]: boolean;
}

function isEnabled(flags: FeatureFlags, name: string): boolean {
  const value = flags[name]; // typed as `boolean | undefined` WITH noUncheckedIndexedAccess enabled
  return value ?? false;       // forced to explicitly handle the missing-key case
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Assuming `readonly` Provides Runtime Immutability
```typescript
// ❌ WRONG: readonly is COMPILE-TIME ONLY — this array's elements are still mutable at runtime
interface Config { readonly tags: string[]; }
const config: Config = { tags: ['a', 'b'] };
config.tags.push('c'); // ✅ COMPILES FINE — readonly only blocked reassigning `config.tags` itself, not mutating it

// ✅ CORRECT: for genuine runtime immutability, use ReadonlyArray<T> (blocks push/pop/etc. at the TYPE level)
// PLUS Object.freeze() at runtime if actual immutability enforcement is required
interface Config2 { readonly tags: ReadonlyArray<string>; }
const config2: Config2 = Object.freeze({ tags: Object.freeze(['a', 'b']) });
```

### ⚠️ Pitfall 2: Conflating Optional Properties With Nullable Properties
```typescript
// ❌ MISMATCH: an API that returns { data: null } when there's no data should NOT be typed
// with an optional `data?:` — the key IS always present, just possibly null; the wrong choice
// here can hide real bugs in objects built via spread/Object.keys() assumptions
interface Response { data?: unknown; } // implies the key can be ABSENT, but the real API always includes it as null

// ✅ CORRECT: match the actual runtime shape precisely
interface Response { data: unknown | null; }
```

### ⚠️ Pitfall 3: Using a Broad Index Signature Without `noUncheckedIndexedAccess`
```typescript
// ❌ RISKY (default tsconfig): flags[name] types as `boolean`, not `boolean | undefined` —
// a typo'd or removed flag name silently type-checks as if it always resolves to a real value
function isEnabled(flags: { [k: string]: boolean }, name: string) {
  return flags[name]; // typed `boolean` — but could genuinely be undefined at runtime
}

// ✅ CORRECT: enable "noUncheckedIndexedAccess": true in tsconfig.json — forces every index
// access to be `T | undefined`, making the missing-key case a compile-time-visible concern
```
