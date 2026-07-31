# 🔷 Migration Recipe: Incrementally Adopting TypeScript in an Existing JS Codebase

## 1. Under-The-Hood Mechanics

The core insight that makes incremental adoption possible: TypeScript can type-check `.js` files **in place**, using either inferred types or JSDoc comments as the type source — you get real error-catching before a single file is renamed or a single line of syntax changes.

```text
allowJs: true    ──► .js files are INCLUDED in the compilation, but NOT type-checked (syntax only)
checkJs: true    ──► .js files ARE now type-checked too (using JSDoc annotations + inference)
// @ts-check     ──► per-FILE opt-in to checking, independent of the global checkJs setting
.ts extension    ──► ALWAYS fully type-checked, unconditionally — no flag gates this
```

This gives four escalating levels of strictness, and a real migration moves through them **file by file**, not as one global flag flip:

```text
Level 0: plain .js, allowJs only          — TS ignores type errors entirely, just parses syntax
Level 1: .js + // @ts-check (per file)    — THIS file is checked; everything else untouched
Level 2: .js + JSDoc types + checked      — real type safety, ZERO syntax conversion needed
Level 3: renamed to .ts                   — full strict-mode-eligible checking, TS syntax now available
```

---

## 2. Real-World Engineering Scenario

**Scenario**: A 400-File Express + React Monorepo Where a Big-Bang TS Rewrite Isn't Approved.
A team wants type safety but can't get budget approved for a multi-week "stop all feature work, rewrite everything in TS" project — and even if they could, a 400-file rewrite done in one pass would be an enormous, hard-to-review, high-risk PR. Instead, they enable `allowJs` + `checkJs` project-wide, immediately catching real bugs (implicit-any parameters, wrong argument types) in the EXISTING `.js` files with zero renaming — then convert files to real `.ts` opportunistically, one PR at a time, whenever someone is already touching that file for a feature or bugfix, rather than as a dedicated migration effort competing with product work.

---

## 3. Production-Grade Migration Sequence

```jsonc
// Step 1: tsconfig.json — the entry point. allowJs lets .js files into the compilation graph at all.
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,      // start OFF project-wide — see Step 2 for why
    "strict": false,       // start OFF — see Step 4 for the incremental rollout
    "noEmit": true          // type-check only; your existing build tool (Babel/esbuild/etc.) still emits JS
  },
  "include": ["src"]
}
```

```javascript
// Step 2: opt in ONE file at a time via a per-file pragma, before flipping checkJs globally.
// This is the safest entry point — zero blast radius, one file, reviewable in isolation.
// @ts-check
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

```javascript
// Step 3: add JSDoc types to the checked file — this is REAL type checking, not decoration
/**
 * @param {{ price: number }[]} items
 * @returns {number}
 */
// @ts-check
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Verified: calling this with the wrong shape is now a real compile error —
// calculateTotal([{ price: "10" }])
// -> error TS2322: Type 'string' is not assignable to type 'number'.
//    (flagged at the "10" literal itself, inside the array argument)
```

```bash
# Step 4: once enough files have # @ts-check and are clean, flip checkJs project-wide —
# every file WITHOUT its own errors keeps compiling; files with real bugs now surface them
# Change tsconfig.json: "checkJs": true

# Step 5: convert the file to REAL TypeScript syntax when next touched — rename only
git mv src/calculateTotal.js src/calculateTotal.ts
```

```typescript
// AFTER rename: JSDoc types become real TS syntax — usually a mechanical translation
export function calculateTotal(items: { price: number }[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

```jsonc
// Step 6: roll out `strict` incrementally, flag by flag, NOT as one big switch —
// each flag surfaces a wave of errors to fix before moving to the next
{
  "compilerOptions": {
    "noImplicitAny": true,      // fix first — usually the single biggest error wave
    // once clean, add the next:
    // "strictNullChecks": true,
    // once clean, add the next:
    // "strict": true              // the umbrella flag — only flip this once every individual
                                    // strict-family flag has ALREADY been enabled and is clean
  }
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Flipping `checkJs: true` Project-Wide on Day One
```text
❌ On a 400-file codebase with zero prior type annotations, this can surface THOUSANDS of
implicit-any errors simultaneously — an unreviewable, un-mergeable wall of red that gets the
whole initiative abandoned as "too disruptive"

✅ CORRECT: per-file `// @ts-check` opt-in first (Step 2), on files people are already
touching, until enough of the codebase is individually clean that flipping checkJs globally
adds few NEW errors rather than thousands
```

### ⚠️ Pitfall 2: Flipping `strict: true` Directly Instead of Its Component Flags
```text
❌ `strict: true` is an umbrella enabling ~8 separate flags at once (noImplicitAny,
strictNullChecks, strictFunctionTypes, ...) — flipping it in one PR on an existing codebase
usually produces an error count too large to fix in one sitting, and the PR sits unmerged
for weeks while conflicting with everyone else's in-flight work

✅ CORRECT: enable ONE strict-family flag at a time (noImplicitAny first — verified above,
it's usually the largest single wave but the most mechanical to fix), get it fully clean and
merged, then the next flag, then the next — only flip the `strict` umbrella once every
individual flag it implies is ALREADY enabled and clean
```

### ⚠️ Pitfall 3: Assuming a `.js` File Needs JSDoc Types Before It Can Be Renamed to `.ts`
```text
❌ Believing conversion order MUST be: add JSDoc types -> verify clean -> THEN rename to .ts

Reality (verified): a renamed .ts file with ZERO type annotations compiles cleanly under
strict: false, exactly like an unchecked .js file — the rename itself doesn't force you to
add types immediately. What renaming DOES do is make the file ALWAYS checked going forward
(no flag gates .ts files the way checkJs gates .js), and immediately expose it to whatever
strict-family flags are already enabled project-wide at that point.
```
So the actually-safe order is flexible: some teams add JSDoc types before renaming (Step 3 before Step 5, shown above); others rename first and let inference + gradually-enabled strict flags surface gaps over time. Neither is wrong — what actually matters is doing **one file at a time**, not the exact JSDoc-vs-rename ordering.

### ⚠️ Pitfall 4: Forgetting Type-Only Packages Still Need Installing
A `.js`-only codebase importing an untyped npm package (or a package that ships no `.d.ts` at all) compiles fine under `checkJs: false`. The moment that file is checked (per-file pragma, `checkJs: true`, or a `.ts` rename), a missing-types error surfaces for that import — install the package's community types (`npm install -D @types/<package>`) or, if none exist, write a minimal `declare module '<package>'` ambient declaration rather than reaching for a blanket `// @ts-ignore` that silences the whole file's checking for that import going forward.
