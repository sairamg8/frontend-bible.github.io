# ⚡ Browser APIs & The DOM: Event Delegation, Observers, Workers & `fetch`

## 1. Under-The-Hood Mechanics

Beyond core language features, real frontend engineering leans heavily on browser-provided APIs — each solving a specific, recurring performance or capability problem that naive DOM manipulation code handles poorly.

```
Event Propagation:  CAPTURING phase (root → target) ──► TARGET ──► BUBBLING phase (target → root)
                              (rarely used directly)                (most listeners fire here, by default)

Event Delegation:  attach ONE listener to a common ANCESTOR, inspect event.target to determine
                       which actual child was interacted with — instead of N listeners, one per child
```

### Event Delegation: One Listener Instead of N
Because events **bubble** up through ancestors by default, a single listener on a parent container can handle clicks on any number of (including dynamically-added, future) children by checking `event.target` — avoiding both the memory overhead of many individual listeners and the correctness headache of re-attaching listeners every time the child list changes.

### `MutationObserver` & `IntersectionObserver`: Efficient, Async Reactivity
`MutationObserver` reacts to DOM tree changes (nodes added/removed, attributes changed) **asynchronously**, batched, without the performance cost of the deprecated synchronous "Mutation Events." `IntersectionObserver` efficiently detects when an element enters/exits the viewport (or another element's bounds) **without** the janky, main-thread-blocking `scroll` event + `getBoundingClientRect()` polling pattern it replaced — the browser itself tracks intersection changes off the main thread's critical path.

### Web Workers: Genuine Off-Main-Thread Execution
A Web Worker runs JS in a **completely separate thread**, with no shared memory access to the DOM or the main thread's variables (communication happens via `postMessage`, serializing data across the boundary) — the only way to run genuinely CPU-heavy JS work without blocking the main thread's ability to respond to user input or paint.

### `fetch()` & `AbortController`: Cancellable Networking
`fetch()` returns a Promise with no built-in cancellation — `AbortController`'s `.signal` passed into `fetch()`'s options is what makes a request abortable, letting `controller.abort()` reject the fetch's Promise and stop the underlying network request, essential for avoiding race conditions when a newer request supersedes an older, still-in-flight one.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Search-As-You-Type Feature Where Old, Slow Responses Overwrote Newer Ones.
A search input fired a new `fetch()` on every keystroke, but under variable network conditions, an older request (for an earlier, now-stale query) sometimes resolved **after** a newer request — overwriting the correctly-updated results with stale data from a query the user had already moved past. Introducing an `AbortController` per keystroke, aborting the **previous** request before starting a new one, ensured only the latest request's response could ever actually update the UI — a genuinely necessary pattern, not just a nice-to-have, for any type-ahead search implementation.

---

## 3. Production-Grade Code Example

```javascript
// Event delegation — ONE listener handles clicks on any number of (including future) list items
document.getElementById('item-list').addEventListener('click', (event) => {
  const item = event.target.closest('.list-item'); // find the actual list item, even if a nested <span> was clicked
  if (!item) return; // click was on the container, not an actual item
  console.log('Clicked item:', item.dataset.id);
});
// Adding a new .list-item to the DOM later requires ZERO additional listener setup — it's already covered
```

```javascript
// AbortController — cancelling a superseded search request
let currentController = null;

async function search(query) {
  currentController?.abort(); // cancel any PREVIOUS in-flight request first
  currentController = new AbortController();

  try {
    const res = await fetch(`/api/search?q=${query}`, { signal: currentController.signal });
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') return null; // expected — a newer search superseded this one
    throw err; // a GENUINE error, not just a cancellation
  }
}
```

```javascript
// IntersectionObserver — efficient infinite-scroll trigger, no scroll-event polling
const sentinel = document.getElementById('load-more-sentinel');

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) loadNextPage();
}, { rootMargin: '200px' }); // trigger 200px BEFORE the sentinel actually enters the viewport

observer.observe(sentinel);
```

```javascript
// Web Worker — offloading a genuinely CPU-heavy computation off the main thread
// main.js
const worker = new Worker('image-processor.js');
worker.postMessage({ imageData: largeImageBuffer }); // data is COPIED/transferred, not shared
worker.onmessage = (event) => renderProcessedImage(event.data.result);

// image-processor.js (runs on a SEPARATE thread — no DOM access, no shared variables with main.js)
self.onmessage = (event) => {
  const result = heavyImageProcessing(event.data.imageData); // doesn't block the main thread's UI at all
  self.postMessage({ result });
};
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Attaching Individual Listeners to Every Item in a Large, Dynamic List
```javascript
// ❌ WRONG: N listeners for N items — memory overhead scales with list size, and every
// newly-added item needs its OWN new listener attached, easy to forget in dynamic UIs
items.forEach((item) => item.element.addEventListener('click', handleClick));

// ✅ CORRECT: ONE delegated listener on the common container, checking event.target
container.addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (item) handleClick(item);
});
```

### ⚠️ Pitfall 2: Forgetting to Abort a Superseded Fetch, Causing a Race Condition
```javascript
// ❌ WRONG: no cancellation — an older, slower response can resolve AFTER a newer one,
// overwriting correct, fresher results with stale data
async function search(query) {
  const res = await fetch(`/api/search?q=${query}`);
  updateResults(await res.json()); // could be STALE if an earlier call resolves later
}

// ✅ CORRECT: abort the previous request before starting a new one, as shown in the production example
```

### ⚠️ Pitfall 3: Assuming Web Workers Have DOM Access
```javascript
// ❌ WRONG: this throws inside a worker — `document` simply doesn't exist in a Worker's global scope
// worker.js
self.onmessage = () => { document.getElementById('foo'); }; // ❌ ReferenceError: document is not defined

// ✅ CORRECT: workers communicate results back to the main thread via postMessage,
// and ONLY the main thread ever touches the actual DOM
self.onmessage = () => { self.postMessage({ result: computeSomething() }); };
// main.js: worker.onmessage = (e) => { document.getElementById('foo').textContent = e.data.result; };
```
