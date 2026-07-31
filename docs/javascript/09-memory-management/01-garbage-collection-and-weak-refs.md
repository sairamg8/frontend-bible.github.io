# ⚡ Memory Management: Mark-and-Sweep, Common Leaks & `WeakMap`/`WeakSet`/`WeakRef`

## 1. Under-The-Hood Mechanics

JavaScript engines manage memory automatically via **garbage collection** — but "automatic" doesn't mean "impossible to leak"; it means the engine reclaims memory it can **prove** is unreachable, and code that accidentally keeps a reference alive defeats that proof entirely.

```
Mark-and-Sweep Algorithm (the standard approach, used by V8's Orinoco collector and others):
        │
        ├── 1. MARK: starting from a set of "roots" (global object, currently-executing call stack's
        │       local variables), traverse EVERY reachable object, marking each one visited
        │
        └── 2. SWEEP: any object NOT marked (i.e., unreachable from any root) is reclaimed
```
The critical implication: an object is only eligible for collection when it is **genuinely unreachable** from any root — not when a developer "logically" considers it done with. A single lingering reference anywhere (a forgotten array entry, an event listener, a closure) keeps the entire object graph reachable from it alive indefinitely.

### Common Memory Leak Patterns
- **Forgotten timers/listeners** — a `setInterval` or event listener that's never cleared keeps its callback (and everything that callback's closure references) alive for the lifetime of the page/process, even after the code that set it up is otherwise done.
- **Detached DOM references** — holding a JS reference to a DOM node that's been removed from the document prevents that entire subtree from being collected, since the JS reference itself counts as a root-reachable reference.
- **Unbounded closures over large scope** — as covered in the [execution context doc](../02-execution-context-and-scope/01-hoisting-closures-and-call-stack.md), a closure retains its ENTIRE defining scope, not just the specific variables it references.

### `WeakMap`/`WeakSet`: Keys That Don't Prevent Collection
A regular `Map`'s keys are **strong references** — as long as the Map exists, every key it holds stays reachable (and therefore alive), even if nothing else references that key anymore. `WeakMap`/`WeakSet` hold their keys **weakly** — the key's presence in a WeakMap does NOT prevent it from being garbage collected if nothing else references it, making them ideal for metadata/caches keyed by objects whose lifecycle you don't want to control or extend.

### `WeakRef`: An Explicit, Opt-In Weak Reference
`WeakRef` wraps a single object in a holder whose `.deref()` may return `undefined` at any point after the referenced object becomes otherwise unreachable — a low-level primitive, rarely needed directly (most use cases are better served by `WeakMap`/`WeakSet`), reserved for advanced caching scenarios where even the wrapping structure itself shouldn't keep anything alive.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Single-Page App's Memory Usage Growing Unboundedly Over a Long Session.
A SPA's memory profile showed steady, unbounded growth the longer a user stayed on the page — eventually causing the tab to slow down and, on some devices, crash. Profiling with Chrome DevTools' heap snapshot tool revealed thousands of detached DOM nodes: a component's cleanup logic removed elements from the document but never called `removeEventListener` on their listeners first, and a separate analytics module kept an array of "recently interacted elements" that was never pruned — both patterns kept entire detached DOM subtrees reachable indefinitely. Fixing both (proper listener cleanup on unmount, switching the analytics tracking array to a `WeakSet`) let the garbage collector actually reclaim that memory as elements were removed.

---

## 3. Production-Grade Code Example

```javascript
// The detached-DOM-node leak pattern, and its fix
class Widget {
  constructor(element) {
    this.element = element;
    this.handleClick = () => console.log('clicked');
    this.element.addEventListener('click', this.handleClick);
  }

  // ❌ WITHOUT this, removing `this.element` from the DOM does NOT free it — the listener
  // (and this Widget instance's closure over it) keeps the whole subtree reachable forever
  destroy() {
    this.element.removeEventListener('click', this.handleClick);
    this.element = null; // release the JS-side reference too
  }
}

const widget = new Widget(document.getElementById('panel'));
// ... later, when removing the element:
document.getElementById('panel').remove();
widget.destroy(); // ✅ MUST be called — otherwise the removed element leaks indefinitely
```

```javascript
// WeakMap for object-keyed metadata that shouldn't extend an object's lifetime
const elementMetadata = new WeakMap(); // metadata cache keyed by DOM elements

function trackInteraction(element) {
  elementMetadata.set(element, { lastClicked: Date.now() });
}

// When `element` is later removed from the DOM and has no other references,
// it (AND its entry in elementMetadata) becomes eligible for garbage collection automatically —
// no manual cleanup of elementMetadata is ever needed, unlike a regular Map
```

```javascript
// A regular Map vs WeakMap — the actual leak difference, made concrete
const regularMapCache = new Map(); // ❌ STRONG references — entries never auto-expire
const weakMapCache = new WeakMap(); // ✅ WEAK references — entries can be collected once the key is unreachable

function cacheData(key, value) {
  regularMapCache.set(key, value); // if `key` (an object) is discarded elsewhere, THIS map still holds it alive forever
  weakMapCache.set(key, value);      // if `key` is discarded elsewhere, THIS entry can be collected along with it
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Forgetting to Remove Event Listeners on Cleanup
```javascript
// ❌ WRONG: the listener (and everything its closure captures) keeps `element` reachable
// forever, even after it's removed from the document — a leak that compounds over a long session
element.addEventListener('click', handleClick);
// ... element removed from DOM later, but listener was NEVER removed

// ✅ CORRECT: always pair addEventListener with a corresponding removeEventListener in cleanup logic
element.removeEventListener('click', handleClick);
```

### ⚠️ Pitfall 2: Using a Regular `Map`/Array for Object-Keyed Caches That Should Expire
```javascript
// ❌ WRONG: a plain array/Map holding references to DOM elements (or any objects) as a
// "recently used" cache grows unboundedly and prevents those elements from EVER being collected,
// even long after they're removed from the document and otherwise unreferenced
const recentlyClicked = [];
function trackClick(element) { recentlyClicked.push(element); } // NEVER pruned, NEVER weak

// ✅ CORRECT: WeakSet/WeakMap for exactly this pattern — no manual pruning needed,
// and no risk of extending an object's actual lifetime
const recentlyClickedWeak = new WeakSet();
function trackClick2(element) { recentlyClickedWeak.add(element); }
```

### ⚠️ Pitfall 3: Relying on `WeakRef`/`FinalizationRegistry` for Deterministic Cleanup Timing
```javascript
// ❌ WRONG: garbage collection timing is NEVER guaranteed or deterministic — code that relies
// on a WeakRef.deref() becoming undefined, or a FinalizationRegistry callback firing, at any
// SPECIFIC time (or even firing at all before process exit) is relying on an explicitly
// unspecified behavior per the language spec
const ref = new WeakRef(largeObject);
setTimeout(() => { if (!ref.deref()) console.log('collected!'); }, 100); // NOT guaranteed to have run by then, or ever

// ✅ AWARENESS: WeakRef/FinalizationRegistry are for OPTIMIZATION (freeing memory EVENTUALLY,
// opportunistically) — never for correctness-critical or timing-dependent cleanup logic
```
