# ⚡ Functions In-Depth: Declarations, Arrow Functions, Defaults/Rest, IIFEs & Currying

## 1. Under-The-Hood Mechanics

JavaScript offers several distinct function forms, each with genuinely different hoisting behavior, `this` binding, and capability — the choice between them is rarely cosmetic.

```
function declaration     ──► fully hoisted (callable before its line), has its OWN `this`/arguments/prototype
function expression        ──► NOT hoisted as callable (only the variable binding is, per var/let/const rules)
arrow function                ──► NOT hoisted as callable, NO own `this`, NO arguments object, NO .prototype
```

### Named Function Expressions: A Self-Reference Without Polluting the Enclosing Scope
```javascript
const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1); // `fact` is usable INSIDE the function body for recursion,
};                                        // but is NOT accessible from outside — only `factorial` is
```

### Default & Rest Parameters
```javascript
function createUser(name, role = 'member', ...permissions) {
  // role defaults ONLY when the argument is undefined (or omitted) — NOT for null/0/''/false
  // permissions collects ALL remaining arguments into a real Array (unlike the legacy `arguments` object)
}
```

### IIFE (Immediately Invoked Function Expression): Historical Scope Isolation
```javascript
(function () {
  var privateVar = 'isolated'; // pre-ES6, this was THE way to avoid polluting global scope
})();
```
With `let`/`const`/ES modules providing real block/module scoping natively, IIFEs are largely a legacy pattern now — though they still appear in bundled library output and certain "run once at load time" patterns.

### Higher-Order Functions, Currying & Partial Application
A **higher-order function** accepts and/or returns another function. **Currying** transforms a multi-argument function into a chain of single-argument function calls, each returning the next function in the chain until all arguments are supplied — enabling partial application (fixing some arguments now, supplying the rest later).

---

## 2. Real-World Engineering Scenario

**Scenario**: A Logging Utility Needing Pre-Configured, Reusable Loggers Without Repeating Configuration Everywhere.
A team wanted `logger('API')('User created')` — a curried logging function where the first call fixes the module name ('API'), returning a reusable, pre-configured logging function that any part of the API module could import and call repeatedly with just the message, without re-specifying 'API' at every single call site. Currying turned a two-argument function into exactly this reusable, partially-applied shape with a small, general-purpose `curry` utility rather than hand-writing a bespoke closure-returning function for every new configurable utility the team needed.

---

## 3. Production-Grade Code Example

```javascript
// Named function expression enabling clean, encapsulated recursion
const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1); // self-reference via 'fact', invisible outside this expression
};
console.log(typeof fact); // ReferenceError-safe context: 'fact' isn't defined OUTSIDE the expression at all
```

```javascript
// Default + rest parameters together
function createUser(name, role = 'member', ...permissions) {
  return { name, role, permissions };
}

createUser('Alex');                                    // { name: 'Alex', role: 'member', permissions: [] }
createUser('Sam', 'admin', 'delete', 'invite');         // { name: 'Sam', role: 'admin', permissions: ['delete', 'invite'] }
createUser('Jordan', undefined, 'read');                  // { name: 'Jordan', role: 'member', permissions: ['read'] } — undefined triggers the default
createUser('Casey', null, 'read');                          // { name: 'Casey', role: null, permissions: ['read'] } — null does NOT trigger the default!
```

```javascript
// A general-purpose curry utility, and the logging scenario it enables
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...more) => curried(...args, ...more);
  };
}

const logMessage = curry((module, message) => console.log(`[${module}] ${message}`));

const apiLogger = logMessage('API'); // partial application — module fixed, message still pending
apiLogger('User created');   // "[API] User created"
apiLogger('User deleted');    // "[API] User deleted" — reused, no need to repeat 'API' anywhere else
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Assuming Default Parameters Trigger for Any "Empty" Value
```javascript
// ❌ MISUNDERSTANDING: default parameters ONLY activate when the argument is literally `undefined`
// (or omitted) — null, 0, '', and false all count as "explicitly provided" and skip the default
function connect(timeout = 5000) { return timeout; }
connect(null); // null — NOT 5000! null is a real, explicit value, not "missing"
connect(0);       // 0 — also NOT 5000, even though 0 might have been intended as "unset"

// ✅ CORRECT: if null/0/'' should also trigger a fallback, handle it explicitly in the function body
function connect2(timeout) { return timeout ?? 5000; } // ?? only falls back on null/undefined, not 0/''
```

### ⚠️ Pitfall 2: Using an Arrow Function Where `arguments` or a Constructor Was Needed
```javascript
// ❌ WRONG: arrow functions have NO `arguments` object of their own — this either throws or
// (worse) silently resolves to an OUTER function's `arguments`, if one lexically encloses it
const sum = (...nums) => { console.log(arguments); }; // ReferenceError: arguments is not defined (in a module/strict context)

// ❌ ALSO WRONG: arrow functions cannot be used with `new` — they have no [[Construct]] internal method
const Person = (name) => { this.name = name; };
new Person('Alex'); // ❌ TypeError: Person is not a constructor

// ✅ CORRECT: use a regular function/rest parameters for either capability
function sum2(...nums) { return nums.reduce((a, b) => a + b, 0); } // rest params, not `arguments`, is the modern approach anyway
```

### ⚠️ Pitfall 3: Deep Currying Chains Producing Confusing, Hard-to-Debug Stack Traces
Heavily curried, point-free-style code (chaining many single-argument partial applications) can produce stack traces and error messages that are significantly harder to read than a straightforward multi-argument function call, since the actual error surfaces several layers of returned closures deep. Currying is a genuinely valuable tool for specific reuse patterns (as in the logging scenario above), but applying it pervasively across a codebase purely for stylistic "functional purity" reasons trades real debuggability for a marginal ergonomic gain.
