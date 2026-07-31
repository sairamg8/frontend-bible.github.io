# ⚡ Core Language Fundamentals: `var`/`let`/`const`, Hoisting, TDZ & Coercion

## 1. Under-The-Hood Mechanics

JavaScript's variable declarations and type coercion rules are frequent sources of subtle bugs precisely because the engine performs work **before** your code visibly executes — a "creation phase" that hoists declarations in ways that differ meaningfully between `var` and `let`/`const`.

```
Creation Phase (before any code runs, top of the enclosing scope):
  var x;              ──► hoisted AND initialized to `undefined` immediately — safely readable (as undefined) before its line
  let y;               ──► hoisted but NOT initialized — exists in the "Temporal Dead Zone" until its declaration line executes
  function f() {}         ──► hoisted AND fully initialized — callable even before its declaration line

Execution Phase:
  console.log(x); // undefined — no error, var was pre-initialized
  console.log(y); // ReferenceError: Cannot access 'y' before initialization — TDZ
  let y = 5;
```

### `var`: Function-Scoped, Re-Declarable, Re-Assignable
`var` ignores block boundaries entirely — a `var` declared inside an `if` block or `for` loop is scoped to the enclosing **function** (or global scope), not the block, which is the source of the classic "loop variable captured by closures all shares one value" bug (see [closures](../02-execution-context-and-scope/01-hoisting-closures-and-call-stack.md)).

### `let`/`const`: Block-Scoped, TDZ-Protected
Both are scoped to the nearest enclosing `{ }` block. `const` additionally prevents **reassignment** of the binding itself — critically, this does NOT mean the value is immutable (`const arr = []; arr.push(1)` is perfectly legal; only `arr = []` would be rejected).

### Type Coercion & `==` vs `===`
`==` (abstract equality) performs type coercion **before** comparing, following a specific, occasionally surprising algorithm (`null == undefined` is `true`, but `null == 0` is `false`; `'' == 0` is `true` via string-to-number coercion). `===` (strict equality) never coerces — the types must already match, or it's immediately `false`.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Legacy Codebase's `var`-Based Loop Silently Attaching Every Click Handler to the Same Final Value.
A loop attaching click handlers to a list of buttons, using `var i` as the loop counter, resulted in every single button's click handler logging the SAME final index (the array's length), rather than each button's own distinct index — because `var` doesn't create a new binding per iteration, all closures captured a reference to the exact same, single `i` variable, whose value had already reached its final state by the time any click actually happened. Switching `var` to `let` (which creates a genuinely fresh binding per loop iteration) fixed the bug with a one-character change, since each iteration's closure now captured its own distinct `i`.

---

## 3. Production-Grade Code Example

```javascript
// The var-in-a-loop closure bug, and its one-line fix
const buttons = document.querySelectorAll('.item-button');

// ❌ BUG: every handler logs the SAME final value of i (buttons.length)
for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', () => console.log(`Clicked button ${i}`));
}

// ✅ FIX: let creates a NEW binding per iteration — each closure captures its OWN i
for (let j = 0; j < buttons.length; j++) {
  buttons[j].addEventListener('click', () => console.log(`Clicked button ${j}`));
}
```

```javascript
// const does NOT mean immutable — only the BINDING is protected, not the referenced value
const user = { name: 'Alex' };
user.name = 'Sam'; // ✅ perfectly legal — mutating the object, not reassigning the binding
user = { name: 'Jordan' }; // ❌ TypeError: Assignment to constant variable — REASSIGNING the binding itself
```

```javascript
// Coercion pitfalls that === avoids entirely
console.log(0 == '');      // true  — '' coerces to 0
console.log(0 == '0');     // true  — '0' coerces to 0
console.log('' == '0');    // false — both are strings, no coercion happens, and they differ
console.log(null == undefined); // true — a SPECIAL CASE in the abstract equality algorithm
console.log(null === undefined); // false — different types, no coercion with ===

// The safe default: always prefer === unless coercion is DELIBERATELY, explicitly wanted
function isEmpty(value) {
  return value === null || value === undefined; // explicit, no reliance on coercion quirks
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Reading a `let`/`const` Variable Before Its Declaration Line
```javascript
// ❌ WRONG: this THROWS, it does not silently return undefined like var would
console.log(config); // ReferenceError: Cannot access 'config' before initialization
let config = { env: 'production' };

// ✅ AWARENESS: this TDZ behavior is actually a SAFETY feature — it catches genuine
// use-before-declare bugs that var's silent `undefined` would have masked entirely
```

### ⚠️ Pitfall 2: Relying on `==` for "Convenient" Null/Undefined Checks Broadly
```javascript
// ❌ RISKY: while `value == null` IS a common, intentional idiom (catches both null AND undefined),
// using == more broadly for other comparisons reintroduces the FULL coercion algorithm's surprises
if (userInput == 0) { /* ... */ } // also true for '', false, '0', [] — probably NOT all intended

// ✅ CORRECT: use === for everything except the one deliberate `== null` idiom, which should
// be used consciously (and ideally with a comment) specifically BECAUSE of its dual-catching behavior
if (userInput === 0) { /* ... */ }
if (value == null) { /* intentionally catches both null and undefined */ }
```

### ⚠️ Pitfall 3: Assuming `const` Prevents Deep Mutation in Nested Objects/Arrays
```javascript
// ❌ MISUNDERSTANDING: const only protects the TOP-LEVEL binding — nested structures remain
// fully mutable, a common source of unintended shared-state bugs when a "constant" config
// object is passed around and mutated deep inside by different parts of a codebase
const config = { retries: { max: 3 } };
someFunction(config); // if someFunction does config.retries.max = 10, this MUTATES the "constant" silently

// ✅ CORRECT: use Object.freeze() (shallow) or a deep-freeze utility for genuine runtime immutability,
// since const alone provides zero protection against nested mutation
const config2 = Object.freeze({ retries: Object.freeze({ max: 3 }) });
```
