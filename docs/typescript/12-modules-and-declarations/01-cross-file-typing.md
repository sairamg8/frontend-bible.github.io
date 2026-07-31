# 🔷 Modules & Declarations: `import type`, `declare module` & Ambient `.d.ts`

## 1. Under-The-Hood Mechanics

TypeScript needs to reconcile two separate concerns that JS's own module system doesn't distinguish: **values** (things that exist at runtime) and **types** (compile-time-only annotations, always erased). Several features exist specifically to make that distinction explicit and controllable.

```typescript
import type { User } from './types';    // ERASED ENTIRELY at compile time — zero runtime import, zero bundle impact
import { fetchUser } from './api';        // a REAL runtime import — the actual function is imported and used

export type { User };                       // re-exporting a TYPE — also fully erased, no runtime export exists
```

### `import type`/`export type`: Explicit, Compiler-Enforced Erasure
Without `import type`, TypeScript still usually erases type-only imports automatically (if it can prove the import is never used as a value) — but `verbatimModuleSyntax` (a stricter, modern compiler option) requires **explicit** `import type` for anything that's purely a type, removing any ambiguity about what a given import will or won't exist as at runtime, and preventing subtle bugs where a type-only import accidentally triggers a real (and potentially circular, or side-effect-laden) module evaluation.

### `declare module`: Typing the Untyped
For a JS module with no types at all (an old untyped npm package, or non-JS imports like `.css`/`.svg` files that a bundler handles specially), `declare module 'module-name' { ... }` tells the compiler "trust me, this module exists and has this shape" — without that module needing to actually contain any TypeScript itself.

### Ambient Declarations (`.d.ts`): Types With No Implementation
A `.d.ts` file contains **only** type declarations — no actual runtime code, ever. This is how a plain-JS library ships type information (a separate `.d.ts` file, either bundled with the package or as a separate `@types/package-name` package) without needing its own source rewritten in TypeScript.

### Namespaces: Largely Legacy
Pre-ES-modules, TypeScript's `namespace` construct was the way to organize code into logical groups avoiding global scope pollution. With ES modules now universal, `namespace` is rarely appropriate for new code — it persists mainly in older codebases and in a few specific ambient-declaration-merging patterns (like the `Express.Request` augmentation shown in the [core type system doc](../01-core-type-system/01-foundations-and-inference.md)).

---

## 2. Real-World Engineering Scenario

**Scenario**: Importing SVGs as React Components in a Vite Project, With Full Type Safety.
A Vite-based project imports `.svg` files directly as React components (`import Logo from './logo.svg?react'`) — a bundler-specific convention that plain TypeScript has no built-in knowledge of at all. Without a `declare module` ambient declaration, every such import would either fail to compile or fall back to an untyped `any`. A project-level `.d.ts` file declaring the shape of `*.svg?react` imports gives every one of these imports full type safety (knowing it's a valid React component type) without needing the SVG files themselves to somehow become TypeScript.

---

## 3. Production-Grade Code Example

```typescript
// types/svg.d.ts — ambient declaration for a bundler-specific import convention
declare module '*.svg?react' {
  import type { FunctionComponent, SVGProps } from 'react';
  const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

```typescript
// Consuming the ambient declaration — fully typed despite the imports being non-JS files
import Logo from './logo.svg?react'; // typed as FunctionComponent<SVGProps<SVGSVGElement>>
import styles from './Button.module.css'; // typed as { readonly [key: string]: string }

function Header() {
  return <div className={styles.header}><Logo width={32} height={32} /></div>;
}
```

```typescript
// import type / export type — explicit erasure, avoiding accidental runtime imports
// types.ts
export interface User { id: string; name: string; }

// userService.ts
import type { User } from './types'; // ERASED — no runtime import of types.ts exists in the compiled output
import { apiClient } from './apiClient'; // a REAL runtime import

export async function getUser(id: string): Promise<User> {
  return apiClient.get(`/users/${id}`);
}

export type { User }; // re-exporting the type — ALSO erased, userService.ts's compiled JS has no `User` export at all
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Mixing Type and Value Imports From the Same Module Without `import type`
```typescript
// ❌ RISKY under verbatimModuleSyntax: mixing a type and a value in one plain import can behave
// inconsistently across different build tools (some correctly elide the type portion, others don't)
import { User, fetchUser } from './userModule'; // User is a TYPE, fetchUser is a VALUE — ambiguous to some bundlers

// ✅ CORRECT: separate type-only imports explicitly, removing ANY ambiguity for every tool in the chain
import type { User } from './userModule';
import { fetchUser } from './userModule';
```

### ⚠️ Pitfall 2: A `declare module` Ambient Type That Drifts From the Actual Runtime Shape
```typescript
// ❌ SILENT BUG: nothing checks that this ambient declaration for an untyped JS library actually
// matches the library's REAL exports — a version bump to the library that changes its shape
// produces ZERO compile error, since the declaration is hand-maintained and disconnected from
// the actual implementation entirely
declare module 'legacy-untyped-lib' {
  export function process(input: string): number; // may no longer match the library's actual current signature
}

// ✅ AWARENESS: ambient declarations for third-party code are a TRUST boundary — they need
// manual updates whenever the underlying untyped library changes, since nothing else will catch drift
```

### ⚠️ Pitfall 3: Overusing `namespace` in New Code Where ES Modules Would Be Simpler
```typescript
// ❌ OUTDATED PATTERN: namespace-based organization for genuinely new code adds an extra,
// largely unnecessary layer when plain ES module imports/exports already solve the same problem
namespace Utils { export function formatDate(d: Date): string { return d.toISOString(); } }
Utils.formatDate(new Date());

// ✅ MODERN: a plain module with named exports achieves the same organization with standard,
// more broadly-understood ES module syntax
export function formatDate(d: Date): string { return d.toISOString(); }
```
