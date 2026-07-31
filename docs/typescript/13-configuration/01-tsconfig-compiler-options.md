# 🔷 Configuration: `tsconfig.json` Compiler Options

## 1. Under-The-Hood Mechanics

`tsconfig.json` controls both **how strictly** the compiler checks code and **what JS it actually emits** (or whether it emits anything at all, in a bundler-only setup) — two genuinely separate concerns bundled into one config file.

```
tsconfig.json
        │
        ├── strict family: strictNullChecks, noImplicitAny, strictFunctionTypes, ...  ── how PICKY the checker is
        │       └── `strict: true` is an UMBRELLA flag enabling ALL of these at once
        │
        ├── target / module / moduleResolution   ── what JS SYNTAX is emitted + how imports are RESOLVED
        │
        ├── paths / baseUrl   ── path ALIAS resolution — MUST mirror the bundler's own alias config
        │
        └── skipLibCheck / isolatedModules   ── build PERFORMANCE + single-file-transpile SAFETY
```

### The `strict` Umbrella Flag
`strict: true` enables a whole family of individually-toggleable checks at once: `strictNullChecks` (the single highest-impact one — without it, `null`/`undefined` are silently assignable to every type, defeating most of the type system's actual safety value), `noImplicitAny` (parameters/variables TypeScript can't infer a type for must be explicitly typed, rather than silently falling back to `any`), `strictFunctionTypes` (enforces the contravariant parameter checking described in the [structural typing doc](../02-structural-typing/01-duck-typing-and-variance.md) for function-type properties), and several others.

### `moduleResolution`: Must Match the Actual Runtime/Bundler Behavior
`'bundler'` (for projects using Vite/webpack/esbuild, which have their own resolution logic), `'node16'`/`'nodenext'` (for Node.js ESM projects, respecting `package.json`'s `exports` field and requiring explicit file extensions in relative imports) — picking the wrong one causes TypeScript to report import errors for code that actually works fine at runtime (or, worse, to silently accept imports that will actually fail at runtime under the real resolution algorithm).

### `paths`/`baseUrl`: Alias Resolution, Compiler-Side Only
`tsconfig.json`'s `paths` only affects **type-checking** — it does NOT make `@/components/Button` actually resolve at runtime or in a bundler's own module resolution. The bundler (Webpack's `resolve.alias`, Vite's `resolve.alias`) needs its **own**, separately-configured alias mapping that matches `tsconfig.json`'s `paths` — the two configs must be kept in sync manually, since neither reads the other.

### `skipLibCheck`/`isolatedModules`
`skipLibCheck: true` skips type-checking of `.d.ts` files (including deep inside `node_modules`) — a significant build-speed win, trading away catching genuine type errors *within* third-party declaration files (rare) for much faster builds. `isolatedModules: true` enforces that every file can be transpiled **independently**, without needing whole-program type information — required by single-file transpilers (Babel, esbuild, SWC) that process one file at a time and have no cross-file type awareness at all (this is why `const enum` and certain re-export patterns are disallowed under this flag, as covered in the [enums doc](../11-enums-and-const-assertions/01-fixed-value-sets.md)).

---

## 2. Real-World Engineering Scenario

**Scenario**: Migrating a Codebase to Vite and Discovering Dozens of New Type Errors With No Code Changes.
A project migrating its build tool from webpack+ts-loader to Vite (which uses esbuild for TS transpilation, a single-file transpiler) needed `isolatedModules: true` set for correctness — turning on that flag surfaced several pre-existing patterns (re-exporting types without `export type`, a couple of `const enum` usages) that had silently worked under whole-program `tsc` compilation but would actually break under esbuild's per-file model. These weren't new bugs introduced by the migration — they were latent correctness issues the previous build setup's whole-program type-checking had been masking all along.

---

## 3. Production-Grade Code Example

```json
// tsconfig.json — a modern, Vite/bundler-oriented configuration
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,

    "noEmit": true
  }
}
```

```javascript
// vite.config.ts — the ALIAS MUST be mirrored here separately; tsconfig's paths alone won't resolve at runtime
import path from 'path';
export default {
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }, // must match tsconfig.json's "paths" entry above
  },
};
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: `paths` Configured in `tsconfig.json` But Not Mirrored in the Bundler
```json
// ❌ WRONG: this makes the IDE/type-checker happy, but at actual RUNTIME (via Vite/webpack),
// `@/components/Button` fails to resolve at all — tsconfig paths are TYPE-CHECKING ONLY
{ "compilerOptions": { "paths": { "@/*": ["src/*"] } } }
// (with no matching alias configured in vite.config.ts/webpack.config.js)

// ✅ CORRECT: the exact same alias mapping must ALSO be configured in whatever actually
// bundles/runs the code — tsconfig and the bundler each need their own copy, kept in sync
```

### ⚠️ Pitfall 2: Omitting `strictNullChecks` (or the `strict` Umbrella) "For Now"
```typescript
// ❌ RISKY: without strictNullChecks, this compiles with ZERO warning — but crashes at runtime
// the moment `user` is actually null, since null is silently assignable to EVERY type without it
function greet(user: { name: string } | null) {
  console.log(user.name); // NO error without strictNullChecks — but a real runtime crash waiting to happen
}

// ✅ CORRECT: strictNullChecks (or the strict umbrella) forces explicit handling —
// arguably the single highest-value compiler flag in the entire strict family
function greet(user: { name: string } | null) {
  if (user) console.log(user.name); // required narrowing, WITH strictNullChecks enabled
}
```

### ⚠️ Pitfall 3: Enabling `isolatedModules` Without Fixing the Patterns It Flags
Turning on `isolatedModules: true` mid-project (often as part of a bundler migration) can surface a wave of pre-existing violations at once (bare `export { SomeType }` re-exports without `export type`, `const enum` usage) — treating these as a "just silence the flag" problem rather than fixing each flagged pattern re-introduces the exact class of single-file-transpile incompatibility the flag exists to catch, defeating the point of having enabled it.
