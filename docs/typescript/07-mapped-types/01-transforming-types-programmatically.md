# 🔷 Mapped Types: `keyof`/`in`, `as` Remapping & +/- Modifiers

## 1. Under-The-Hood Mechanics

A mapped type generates a new object type by **iterating over another type's keys** — the type-level equivalent of a `for...in` loop, evaluated entirely by the compiler.

```typescript
type Mapped<T> = { [P in keyof T]: T[P] };   // "for each key P in T, keep the same value type" — an identity mapping

type Keys = keyof T;    // a UNION of T's key names (as string/number/symbol literals)
```
Every built-in utility type (`Partial`, `Readonly`, `Pick`, etc. — see [utility types](../06-utility-types/01-built-in-transformations.md)) is itself just a mapped type over `keyof T`, which is why understanding this primitive directly demystifies what those utilities actually do.

### The `as` Clause: Remapping Keys During Iteration
```typescript
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P]
};

interface Person { name: string; age: number; }
type PersonGetters = Getters<Person>; // { getName: () => string; getAge: () => number }
```
The `as` clause lets a mapped type **rename** (or entirely filter out, by mapping a key to `never`) keys during the iteration — combined with template literal types (see the [next doc](../08-template-literal-types/01-string-pattern-types.md)), this is how "generate a getter/setter/event-handler name per property" patterns are built at the type level.

### `+`/`-` Modifiers: Explicitly Adding or Removing `readonly`/`?`
```typescript
type Mutable<T> = { -readonly [P in keyof T]: T[P] };    // explicitly REMOVES readonly (built-in Required-like flip)
type AllOptional<T> = { [P in keyof T]+?: T[P] };            // explicitly ADDS optional (the default Partial<T> behavior)
```
`-readonly`/`-?` are how TypeScript's own built-in `Required<T>` (removes `?`) is actually implemented — without a `-` modifier available, there would be no way to write a mapped type that **strips** an existing modifier, only ones that add one.

---

## 2. Real-World Engineering Scenario

**Scenario**: Auto-Generating a Type-Safe Form State Object With `error`/`touched` Fields Per Original Field.
A form library needs, for any given form data shape (`{ email: string; password: string }`), a parallel `FormState` type where each original field gets wrapped with its own `{ value, error, touched }` tracking object — without the form library's consumers ever hand-writing that wrapper shape per form. A mapped type transforms the original shape's keys into the same keys, each now typed as the tracking wrapper, staying automatically in sync with the original form data type if a field is ever added or removed.

---

## 3. Production-Grade Code Example

```typescript
// Mapped type generating a "form state" wrapper around each field automatically
type FormState<T> = {
  [P in keyof T]: { value: T[P]; error: string | null; touched: boolean };
};

interface LoginForm { email: string; password: string; }
type LoginFormState = FormState<LoginForm>;
// { email: { value: string; error: string | null; touched: boolean };
//   password: { value: string; error: string | null; touched: boolean } }

const initialState: LoginFormState = {
  email: { value: '', error: null, touched: false },
  password: { value: '', error: null, touched: false },
};
```

```typescript
// `as` clause: generating event-handler-name keys from a props shape, filtering out non-matching keys
interface ButtonEvents { click: MouseEvent; focus: FocusEvent; }

type Handlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}`]?: (event: T[K]) => void;
};

type ButtonProps = Handlers<ButtonEvents>;
// { onClick?: (event: MouseEvent) => void; onFocus?: (event: FocusEvent) => void }
```

```typescript
// +/- modifiers: building a DeepMutable utility that strips readonly recursively
type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

interface Config { readonly api: { readonly url: string; readonly timeout: number }; }
type MutableConfig = DeepMutable<Config>; // { api: { url: string; timeout: number } } — readonly stripped at EVERY level
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Forgetting Mapped Types Preserve Modifiers by Default
```typescript
// ❌ SURPRISING (to some): a naive mapped type over an ALREADY-optional/readonly source
// preserves those modifiers by default — this ISN'T resetting them, it's an identity mapping
interface Config { readonly timeout?: number; }
type Copy<T> = { [P in keyof T]: T[P] };
type CopiedConfig = Copy<Config>; // STILL { readonly timeout?: number } — modifiers carried through unchanged

// ✅ AWARENESS: to actually strip readonly/optional, the +/- modifiers must be used explicitly
type Stripped<T> = { -readonly [P in keyof T]-?: T[P] }; // NOW genuinely mutable and required
```

### ⚠️ Pitfall 2: Using `as` Remapping Without Handling the "Filter Out" Case Correctly
```typescript
// ❌ WRONG: intending to exclude a specific key, but forgetting `as never` is what actually removes it
type WithoutId<T> = { [P in keyof T as P extends 'id' ? P : P]: T[P] }; // does NOTHING — 'id' still included

// ✅ CORRECT: mapping a key to `never` in the `as` clause is what genuinely excludes it from the result
type WithoutId2<T> = { [P in keyof T as P extends 'id' ? never : P]: T[P] }; // 'id' correctly removed
```

### ⚠️ Pitfall 3: Deeply Recursive Mapped Types on Very Large/Circular Object Shapes
A `DeepMutable`/`DeepPartial`-style recursive mapped type applied to a type with circular references (e.g. a tree node type referencing its own parent) can cause the compiler to either hit its recursion depth limit or produce extremely slow type-checking on large real-world API response shapes — recursive mapped types are powerful but carry a genuine compile-time performance cost that scales with the input type's actual structural complexity, not just its apparent simplicity in source code.
