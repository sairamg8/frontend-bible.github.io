# ⚡ Execution Context & Scope: Hoisting, the Scope Chain, Closures & the Call Stack

## 1. Under-The-Hood Mechanics

Every function invocation creates a new **Execution Context**, pushed onto the **Call Stack** — understanding this two-phase, stack-based model explains hoisting, closures, and stack overflows as three facets of the same underlying mechanism.

```
[Global Execution Context]
   └── [Function A's Execution Context]  (pushed when A() is called, popped when A returns)
          └── [Function B's Execution Context]  (pushed when B() is called INSIDE A)
                 └── B retains access to A's variables via the SCOPE CHAIN — this is a closure
```

### Creation Phase vs Execution Phase
Every execution context is built in two steps, **before** any line of that function's code actually runs:
1. **Creation phase**: `var` declarations are hoisted and pre-initialized to `undefined`; `let`/`const` are hoisted but left uninitialized (the Temporal Dead Zone — see the [core fundamentals doc](../01-core-language-fundamentals/01-variables-types-and-coercion.md)); function declarations are hoisted **fully** (including their body), which is why calling a function declaration before its line in the source works fine; `this` and the `arguments` object are bound.
2. **Execution phase**: code runs top to bottom, assigning actual values.

### The Scope Chain: Lexical, Not Dynamic
Identifier resolution walks **outward** through each enclosing function's scope, determined entirely by **where functions are written in the source** (lexical scoping) — not by which function happened to call which at runtime (dynamic scoping, which JS does not use for variable lookup, though `this` behaves differently — see the [`this` keyword doc](../03-the-this-keyword/01-binding-rules.md)).

### Closures: A Function Retaining Its Defining Scope
A closure is what happens when an inner function is returned or passed elsewhere, yet retains access to its outer function's variables via an internal `[[Environment]]` reference — this reference **prevents those outer variables from being garbage collected**, even after the outer function has already returned, for as long as the closure itself remains reachable.

### The Call Stack & Recursion Limits
Each function call pushes a new **stack frame** (return address, local variables, arguments); returning pops it. A recursive function with no base case (or simply too many legitimate recursive levels) exhausts the stack's fixed size, producing a `RangeError: Maximum call stack size exceeded` — a hard ceiling on recursion depth that iterative approaches don't share.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Memory Leak Traced to an Unintentionally Retained Closure Over a Large Object.
A component's event handler closure referenced only a single small field of a much larger, multi-megabyte cached dataset object — yet profiling revealed the **entire** dataset object remained in memory long after it should have been garbage collected, for as long as that handler (and its closure) stayed attached. The root cause: the closure's `[[Environment]]` reference retains the **entire** enclosing scope, not just the specific variables actually referenced inside the inner function — the fix was restructuring the code to extract only the needed field into its own narrower-scoped variable *before* the closure captured it, letting the rest of the large object become collectible.

---

## 3. Production-Grade Code Example

```javascript
// Closures as private state — a rate limiter with NO exposed mutable global state
function createRateLimiter(maxCalls, timeFrameMs) {
  let callTimestamps = []; // retained in the closure's [[Environment]], invisible/inaccessible from outside

  return function checkLimit() {
    const now = Date.now();
    callTimestamps = callTimestamps.filter((t) => now - t < timeFrameMs);
    if (callTimestamps.length >= maxCalls) return false;
    callTimestamps.push(now);
    return true;
  };
}

const rateLimiter = createRateLimiter(3, 1000);
rateLimiter(); // true
rateLimiter(); // true
rateLimiter(); // true
rateLimiter(); // false — blocked, state persisted purely via closure, no global variable involved
```

```javascript
// Hoisting in the creation phase — function declarations vs var vs let, side by side
console.log(typeof hoisted); // 'function' — fully hoisted, callable before its line
console.log(varDeclared);      // undefined — hoisted, pre-initialized, but not yet ASSIGNED
try {
  console.log(letDeclared);      // throws — TDZ, hoisted but NOT initialized at all
} catch (e) {
  console.log(e.message); // "Cannot access 'letDeclared' before initialization"
}

function hoisted() { return 'I work before my declaration line'; }
var varDeclared = 'assigned now';
let letDeclared = 'also assigned now';
```

```javascript
// Avoiding the "unintentionally retained large object" leak pattern from the scenario above
function attachHandler(largeDataset) {
  // ❌ retains the ENTIRE largeDataset via the closure, even though only `.summary` is ever used
  // element.addEventListener('click', () => console.log(largeDataset.summary));

  // ✅ extract ONLY what's needed into its own narrow-scoped variable BEFORE the closure captures it
  const summary = largeDataset.summary;
  element.addEventListener('click', () => console.log(summary)); // largeDataset itself can now be GC'd
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Assuming Closures Only Retain the Specific Variables Referenced
```javascript
// ❌ WRONG ASSUMPTION: this closure references only `.summary`, but V8 retains the ENTIRE
// largeDataset object (and its whole enclosing scope) reachable through [[Environment]] —
// not a hand-picked subset of "only what's used"
function attachHandler(largeDataset) {
  return () => console.log(largeDataset.summary); // the WHOLE largeDataset stays alive, not just .summary
}

// ✅ AWARENESS: extract only the needed value into a fresh binding BEFORE closing over it,
// as shown in the production example above, if the outer object is large and long-lived matters
```

### ⚠️ Pitfall 2: Deep, Unbounded Recursion Without a Base Case Guard
```javascript
// ❌ WRONG: no verification that `n` actually decreases toward a base case — crashes the call
// stack on sufficiently large/malformed input, an easy-to-miss bug for recursive tree/graph traversal
function sumRange(n) {
  return n + sumRange(n - 1); // no base case at all here — RangeError: Maximum call stack size exceeded
}

// ✅ CORRECT: always include an explicit, reachable base case
function sumRange2(n) {
  if (n <= 0) return 0;
  return n + sumRange2(n - 1);
}
// For VERY large n even with a correct base case, prefer an iterative loop — JS has no
// guaranteed tail-call optimization in most engines, so deep-but-correct recursion can still overflow
```

### ⚠️ Pitfall 3: Confusing Lexical Scope With Dynamic "Call-Site" Scope
```javascript
// ❌ MISUNDERSTANDING: `value` resolves based on WHERE innerFn is DEFINED (lexically, inside outer),
// NOT based on where/how it's eventually CALLED — a common point of confusion for engineers
// coming from dynamically-scoped languages
let value = 'global';
function outer() {
  let value = 'outer';
  function innerFn() { console.log(value); } // 'outer' — resolved via the SCOPE CHAIN at definition time
  return innerFn;
}
const fn = outer();
function callFromDifferentContext() {
  let value = 'different context'; // irrelevant — innerFn was already lexically bound to `outer`'s scope
  fn(); // still logs 'outer', regardless of where fn() is actually invoked from
}
```
