# 🔷 Template Literal Types: String Pattern Types

## 1. Under-The-Hood Mechanics

Template literal types apply the same `` `${...}` `` syntax JS developers already know from template strings — but at the **type** level, generating a union of every possible string combination rather than a single runtime string value.

```typescript
type Direction = 'left' | 'right';
type Event = `move-${Direction}`;   // 'move-left' | 'move-right' — the UNION expands across every combination

type EventName = `on${Capitalize<Direction>}`;  // 'onLeft' | 'onRight'
```

### Intrinsic String Manipulation Types
TypeScript provides four built-in type-level string transformations, each operating purely on the type, with no runtime equivalent needed since they only affect literal string **types**:
- `Uppercase<T>` / `Lowercase<T>` — case-transform an entire string literal type.
- `Capitalize<T>` / `Uncapitalize<T>` — transform only the first character.

### Pattern-Matching API Strings at the Type Level
Combined with `infer` (see [advanced generics](../05-advanced-generics/01-conditional-types-and-infer.md)), template literal types can **destructure** a string literal type into its component parts — e.g. extracting a route's dynamic segment names directly from a URL pattern string, entirely at compile time.

```typescript
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type Params = ExtractParams<'/users/:userId/posts/:postId'>; // 'userId' | 'postId'
```

---

## 2. Real-World Engineering Scenario

**Scenario**: A Type-Safe Router Where a Route String Literal Automatically Determines Which Params Object Is Required.
A routing library wants `navigate('/users/:userId/posts/:postId', { userId: '1', postId: '2' })` to be fully type-checked — the exact keys required in the params object should be **derived from the route string itself**, not hand-declared separately (which would drift out of sync the moment a route's dynamic segments change). Template literal types combined with `infer` extract `'userId' | 'postId'` directly from the route pattern string, and a mapped type turns that union into the exact required params object shape — changing the route string automatically and correctly changes what params are required, with zero separate type declaration to keep in sync.

---

## 3. Production-Grade Code Example

```typescript
// Extracting param names from a route pattern string via infer + template literals
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

// Turning the extracted param-name union into a required params object shape
type RouteParams<T extends string> = { [K in ExtractParams<T>]: string };

function navigate<T extends string>(route: T, params: RouteParams<T>) {
  const url = route.replace(/:(\w+)/g, (_, key) => params[key as keyof typeof params]);
  console.log(url);
}

navigate('/users/:userId/posts/:postId', { userId: '1', postId: '2' }); // ✅ correctly requires BOTH keys
navigate('/users/:userId/posts/:postId', { userId: '1' }); // ❌ Error: missing required property 'postId'
```

```typescript
// Generating strongly-typed CSS custom property names from a design token object
interface DesignTokens { primaryColor: string; spacingUnit: number; borderRadius: string; }

type CSSVarName<T> = { [K in keyof T as `--${string & K}`]: T[K] };
type CSSVars = CSSVarName<DesignTokens>;
// { '--primaryColor': string; '--spacingUnit': number; '--borderRadius': string }
```

```typescript
// Pattern-matching event handler prop names — a common React + TS idiom
type EventHandlerName<T extends string> = `on${Capitalize<T>}`;

type ClickHandler = EventHandlerName<'click'>; // 'onClick'
type HoverHandler = EventHandlerName<'hover'>;   // 'onHover'
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Template Literal Types Producing Combinatorially Huge Unions
```typescript
// ❌ RISKY: combining several multi-member unions in one template literal type multiplies
// the total number of generated string combinations — this can silently balloon compile
// times or hit the compiler's union-size limits for large enough input unions
type Size = 'sm' | 'md' | 'lg' | 'xl';
type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple';
type Variant = 'solid' | 'outline' | 'ghost';
type ClassName = `${Size}-${Color}-${Variant}`; // 4 × 5 × 3 = 60 generated string literals — still fine here,
// but this pattern scales MULTIPLICATIVELY, not additively, as more axes are combined

// ✅ AWARENESS: for large combinatorial spaces, consider a plain `string` type with runtime
// validation instead of an exhaustively enumerated template literal union
```

### ⚠️ Pitfall 2: Forgetting `string &` When Using a Generic Key in a Template Literal
```typescript
// ❌ WRONG: keyof T can include number/symbol keys, which aren't directly usable in a template
// literal type position without narrowing to string first — this is a real compile error
type Getter<T> = { [K in keyof T]: () => T[K] } & { [K in keyof T as `get${Capitalize<K>}`]: () => T[K] };
// Error: Type 'K' is not assignable to type 'string | number | bigint | boolean | null | undefined'

// ✅ CORRECT: intersect with `string` to narrow K to only its string-compatible members first
type Getter2<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };
```

### ⚠️ Pitfall 3: Assuming Template Literal Types Validate Content, Not Just Shape
```typescript
// ❌ MISUNDERSTANDING: this type only checks the STRUCTURAL pattern (has a colon-prefixed segment),
// not that the route is otherwise well-formed (e.g. doesn't catch a double slash, trailing colon, etc.)
type Route = `/${string}:${string}`;
const route: Route = '/users/:'; // ✅ "valid" per the type, despite being a nonsensical empty param name

// ✅ AWARENESS: template literal types provide compile-time PATTERN matching, not full semantic
// validation — genuinely malformed-but-pattern-matching strings still need a runtime check
```
