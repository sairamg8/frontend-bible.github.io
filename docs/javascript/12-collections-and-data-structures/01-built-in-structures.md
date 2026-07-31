# ⚡ Collections & Data Structures: `Map`/`Set`, Array Methods & `TypedArray`s

## 1. Under-The-Hood Mechanics

Beyond plain objects and arrays, JS provides purpose-built collection types each solving a specific gap plain objects/arrays leave open.

```
Map      ──► keyed collection, ANY value as a key (objects, functions — not just strings),
                 guaranteed insertion-order iteration, genuine .size property
Set      ──► unique-value collection, ANY value type, guaranteed insertion order
WeakMap/WeakSet ──► object-keyed-only, weakly-held (see the memory management doc)
TypedArray/ArrayBuffer ──► fixed-size, fixed-type binary data buffers — for performance-critical/binary work
```

### `Map` vs Plain Object as a Dictionary
A plain object's keys are always coerced to strings (or Symbols) — `obj[someObjectKey]` silently stringifies `someObjectKey` to `"[object Object]"`, colliding with any other object used as a key the same way. A `Map` uses the **actual value** (including object references) as the key, with no coercion — genuinely distinct object keys stay genuinely distinct. `Map` also has an accurate, O(1) `.size` property (a plain object requires `Object.keys(obj).length`, an O(n) operation) and guarantees iteration order matches insertion order (a plain object's key order has some historical edge cases around integer-like keys).

### Array Methods: Functional Composition, Not Just Convenience
`.map()`/`.filter()`/`.reduce()`/`.flatMap()`/`.find()`/`.some()`/`.every()` each return either a new array or a single derived value, **without mutating the original** — composable into pipelines (`arr.filter(...).map(...).reduce(...)`) in a way that manually-written `for` loops accumulating into a mutable variable don't naturally express as clearly.

### `TypedArray`/`ArrayBuffer`: Raw Binary Memory
An `ArrayBuffer` is a fixed-length raw binary buffer; a `TypedArray` (`Uint8Array`, `Float64Array`, etc.) is a **view** over that buffer, interpreting its bytes as a specific numeric type — used for performance-critical binary data (WebGL buffers, audio/video processing, WebSocket binary frames) where a regular JS array's per-element boxing/type-flexibility overhead would be wasteful.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Cache Keyed by DOM Elements, Where a Plain Object Would Have Silently Collided Every Entry.
A UI library needed to cache computed layout data per DOM element — using a plain object with elements as keys (`cache[element] = data`) coerced every single element to the identical string `"[object HTMLDivElement]"`, meaning every element's cache entry silently overwrote the previous one, with only the last-cached element's data surviving. Switching to a `Map` (using the actual element object references as keys, no coercion) fixed this immediately — each distinct element correctly got its own, independently-retrievable cache entry.

---

## 3. Production-Grade Code Example

```javascript
// Map vs plain object — the object-key coercion bug, made concrete
const cache = {}; // ❌ plain object
const el1 = document.createElement('div');
const el2 = document.createElement('div');
cache[el1] = { height: 100 };
cache[el2] = { height: 200 }; // OVERWRITES the el1 entry — both coerced to "[object HTMLDivElement]"
console.log(Object.keys(cache).length); // 1 — NOT 2!

const mapCache = new Map(); // ✅ Map — no key coercion
mapCache.set(el1, { height: 100 });
mapCache.set(el2, { height: 200 }); // genuinely distinct entries
console.log(mapCache.size); // 2 — correct
```

```javascript
// Array method composition — a real data-processing pipeline
const orders = [
  { id: 1, status: 'shipped', total: 45.5 },
  { id: 2, status: 'pending', total: 12.0 },
  { id: 3, status: 'shipped', total: 89.99 },
];

const shippedTotal = orders
  .filter((o) => o.status === 'shipped')
  .map((o) => o.total)
  .reduce((sum, total) => sum + total, 0);
console.log(shippedTotal); // 135.49 — composed, no intermediate mutable accumulator variables needed

// flatMap — map + flatten in one pass, common for "one item becomes zero-or-more items"
const tags = orders.flatMap((o) => (o.status === 'shipped' ? [`order-${o.id}`, 'shipped'] : []));
console.log(tags); // ['order-1', 'shipped', 'order-3', 'shipped']
```

```javascript
// TypedArray/ArrayBuffer — raw binary data for a WebSocket binary protocol
function encodePosition(x, y, z) {
  const buffer = new ArrayBuffer(12); // 3 × 4 bytes = 12 bytes total
  const view = new Float32Array(buffer);
  view[0] = x; view[1] = y; view[2] = z;
  return buffer; // sent directly over a WebSocket as raw binary — no JSON serialization overhead
}

function decodePosition(buffer) {
  const view = new Float32Array(buffer);
  return { x: view[0], y: view[1], z: view[2] };
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Using a Plain Object as a Dictionary With Non-String Keys
```javascript
// ❌ WRONG: object keys are silently coerced to strings — two DIFFERENT objects used as keys
// both stringify to the same "[object Object]", causing entries to overwrite each other
const groups = {};
groups[someObject] = 'A';
groups[anotherObject] = 'B'; // collides with the entry above if both are plain objects

// ✅ CORRECT: Map uses actual reference identity for object keys, no coercion at all
const groups2 = new Map();
groups2.set(someObject, 'A');
groups2.set(anotherObject, 'B'); // genuinely distinct entries
```

### ⚠️ Pitfall 2: Mutating an Array In Place Inside a `.map()`/`.filter()` Callback
```javascript
// ❌ RISKY: .map()/.filter() are meant to be PURE, non-mutating transformations — mutating
// the original array (or its elements) INSIDE the callback defeats the whole purpose of using
// these methods over a manual for loop, and can produce surprising results if the same array
// is iterated elsewhere concurrently or the mutation affects indices being iterated
const cleaned = items.map((item) => {
  item.processed = true; // mutates the ORIGINAL item objects, not just the mapped output
  return item;
});

// ✅ CORRECT: return a NEW object per item, leaving the originals untouched
const cleaned2 = items.map((item) => ({ ...item, processed: true }));
```

### ⚠️ Pitfall 3: Assuming `Set`/`Map` Use Deep Equality for Object Values
```javascript
// ❌ WRONG: Set (and Map's key comparison) use SameValueZero equality — reference equality
// for objects, NOT deep structural equality — two structurally identical objects are still DISTINCT
const seen = new Set();
seen.add({ id: 1 });
console.log(seen.has({ id: 1 })); // false — a DIFFERENT object reference, even though it "looks the same"

// ✅ AWARENESS: for deduplication by VALUE (not reference), key by a derived primitive instead
const seenIds = new Set();
seenIds.add(1);
console.log(seenIds.has(1)); // true — primitives compare by value correctly
```
