# ⚡ Iterables & Generators: `Symbol.iterator`, Generator Functions & Async Generators

## 1. Under-The-Hood Mechanics

`for...of`, the spread operator, and destructuring all work on **any** object implementing the iterable protocol — a plain, well-defined contract, not special-cased for arrays/strings/Maps/Sets alone.

```
An object is ITERABLE if it has a [Symbol.iterator]() method returning an ITERATOR
An ITERATOR is any object with a .next() method returning { value, done }

for (const x of iterable) { ... }
        │
        ▼
calls iterable[Symbol.iterator]() ONCE, then calls .next() REPEATEDLY on the result
until { done: true } is returned
```

### Generator Functions: Pausable, Resumable Execution
```javascript
function* countUp(max) {
  for (let i = 1; i <= max; i++) {
    yield i; // PAUSES here, returning { value: i, done: false } — resumes exactly here on the NEXT .next() call
  }
}
```
A generator function (`function*`) automatically implements the iterator protocol — calling it doesn't run the function body at all; it returns a **generator object** (itself both iterable and an iterator), and each `.next()` call resumes execution from the last `yield` up to the next one (or the function's end).

### Async Generators: Streaming Async Sequences
`async function*` combines both protocols — `yield` pauses for a value, and `await` inside the generator pauses for a Promise, letting `for await...of` consume a sequence of asynchronously-arriving values (paginated API results, a stream of WebSocket messages) with the same simple loop syntax as a synchronous iterable.

---

## 2. Real-World Engineering Scenario

**Scenario**: Paginating Through an API With Millions of Records Without Loading Them All Into Memory At Once.
An admin tool needs to process every record from an API that paginates results (1,000 per page, potentially thousands of pages) — loading everything into one giant array first would be both slow (nothing starts processing until the very last page arrives) and memory-intensive. An async generator that `yield`s one page's worth of records at a time, internally `await`-ing the next page's fetch only when the consumer actually asks for more (via `for await...of`), lets processing start on the first page immediately and keeps memory usage bounded to roughly one page's worth of data at any given moment, regardless of the total record count.

---

## 3. Production-Grade Code Example

```javascript
// A custom iterable object — implementing Symbol.iterator manually
class Range {
  constructor(start, end) { this.start = start; this.end = end; }

  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        if (current <= end) return { value: current++, done: false };
        return { value: undefined, done: true };
      },
    };
  }
}

for (const n of new Range(1, 5)) console.log(n); // 1, 2, 3, 4, 5 — works with for...of, spread, destructuring
console.log([...new Range(1, 3)]); // [1, 2, 3] — spread also works, since Range is iterable
```

```javascript
// The SAME Range, far more concisely, using a generator function instead of manual protocol implementation
class RangeGen {
  constructor(start, end) { this.start = start; this.end = end; }

  *[Symbol.iterator]() { // a generator method — automatically implements the iterator protocol
    for (let i = this.start; i <= this.end; i++) yield i;
  }
}

for (const n of new RangeGen(1, 5)) console.log(n); // identical behavior, MUCH less boilerplate
```

```javascript
// Async generator — paginated API fetching, memory-bounded, streams as it goes
async function* fetchAllRecords(baseUrl) {
  let page = 1;
  while (true) {
    const res = await fetch(`${baseUrl}?page=${page}`);
    const { records, hasMore } = await res.json();
    yield* records; // yield EACH record individually, not the whole page array at once
    if (!hasMore) return;
    page++;
  }
}

async function processAllRecords() {
  for await (const record of fetchAllRecords('/api/records')) {
    await processRecord(record); // starts processing the FIRST page immediately, never holds everything in memory
  }
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Forgetting a Generator Function's Body Doesn't Run Until `.next()` Is Called
```javascript
// ❌ SURPRISING (to newcomers): calling a generator function does NOT execute any of its body yet
function* logAndYield() {
  console.log('this runs on the FIRST .next() call, not when logAndYield() is invoked');
  yield 1;
}
const gen = logAndYield(); // NOTHING logged yet — just creates the generator object
gen.next(); // NOW it logs, and returns { value: 1, done: false }
```

### ⚉️ Pitfall 2: Using a Regular `for...of` Loop on an Async Generator
```javascript
// ❌ WRONG: a plain for...of doesn't know how to await each yielded Promise — this either
// throws or iterates over Promise objects themselves, not their resolved values
for (const record of fetchAllRecords('/api/records')) { /* ... */ } // ❌ TypeError: fetchAllRecords(...) is not iterable (it's ASYNC iterable)

// ✅ CORRECT: async generators require for AWAIT...of
for await (const record of fetchAllRecords('/api/records')) { /* ... */ }
```

### ⚠️ Pitfall 3: Assuming a Generator Can Be Iterated Multiple Times Like an Array
```javascript
// ❌ WRONG: a generator OBJECT (the thing returned by calling a generator function) is a
// single-use ITERATOR, not a reusable ITERABLE — once exhausted (done: true), it stays exhausted
const gen = countUp(3);
console.log([...gen]); // [1, 2, 3]
console.log([...gen]); // [] — EMPTY the second time, the generator object was already fully consumed

// ✅ CORRECT: call the generator FUNCTION again to get a fresh generator object for re-iteration
console.log([...countUp(3)]); // [1, 2, 3]
console.log([...countUp(3)]); // [1, 2, 3] — a NEW generator object each call, fully resettable
```
