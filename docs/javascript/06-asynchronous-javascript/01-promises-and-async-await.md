# ⚡ Asynchronous JavaScript: Promises, `async`/`await` & Combinators

## 1. Under-The-Hood Mechanics

A Promise is a state machine with exactly three states and a **one-way** transition rule — this is what makes Promise chains predictable despite representing genuinely async, time-uncertain operations.

```
pending ──resolve(value)──► fulfilled  (permanently — cannot transition again, ever)
pending ──reject(error)───► rejected     (permanently — cannot transition again, ever)
```

### `.then`/`.catch`/`.finally`: Chaining, Not Callback Nesting
Each `.then()` call returns a **new** Promise, wrapping whatever its callback returns (or throws) — this is what allows chaining without the "callback hell" pyramid of nested callbacks, and it's why returning a Promise from inside a `.then()` callback correctly "flattens" (the outer chain waits for the inner Promise, rather than resolving with a Promise-wrapping-a-Promise).

### `async`/`await`: Syntactic Sugar Over Promises, Not a Different Mechanism
```javascript
async function getData() {
  const result = await fetchSomething(); // PAUSES this function's execution (not the whole thread!)
  return result;                            // until fetchSomething()'s Promise settles
}
```
An `async function` **always** returns a Promise (wrapping its return value, or its thrown error as a rejection) — `await` only pauses the enclosing async function's own continuation, yielding control back to the event loop, never blocking the actual JS thread.

### Promise Combinators: Four Genuinely Different Semantics
- **`Promise.all`** — waits for all to fulfill; **rejects immediately** on the first rejection (fail-fast), discarding results from any still-pending promises.
- **`Promise.allSettled`** — waits for **all** to settle (fulfilled or rejected), never itself rejects — returns an array of `{status, value}`/`{status, reason}` objects for every input.
- **`Promise.race`** — settles as soon as the **first** promise settles, whether fulfilled or rejected.
- **`Promise.any`** — settles as soon as the **first** promise **fulfills**; only rejects if **all** inputs reject (with an `AggregateError`).

---

## 2. Real-World Engineering Scenario

**Scenario**: A Dashboard That Should Show Partial Data Even If One of Several API Calls Fails.
A dashboard fetches user profile, recent orders, and recommendations concurrently. Using `Promise.all` meant a single failing recommendations endpoint (a non-critical, "nice to have" section) caused the **entire** dashboard to show an error state — even though profile and orders had both succeeded. Switching to `Promise.allSettled` let the dashboard render every section that succeeded independently, showing a small "recommendations unavailable" message only for the one that failed, rather than an all-or-nothing failure driven by fail-fast `Promise.all` semantics that didn't match the actual product requirement.

---

## 3. Production-Grade Code Example

```javascript
// Promise.all (fail-fast) vs Promise.allSettled (partial success) — same three calls, different outcomes
async function loadDashboardFailFast(userId) {
  // ❌ if ANY of these three rejects, the WHOLE dashboard load rejects, discarding the other two results
  const [profile, orders, recommendations] = await Promise.all([
    fetchProfile(userId),
    fetchOrders(userId),
    fetchRecommendations(userId), // non-critical, but its failure kills everything with Promise.all
  ]);
  return { profile, orders, recommendations };
}

async function loadDashboardResilient(userId) {
  const results = await Promise.allSettled([
    fetchProfile(userId),
    fetchOrders(userId),
    fetchRecommendations(userId),
  ]);

  const [profile, orders, recommendations] = results.map((r) =>
    r.status === 'fulfilled' ? r.value : null
  );

  return { profile, orders, recommendations }; // partial success — a null section, not a total failure
}
```

```javascript
// async/await error handling — try/catch around await, NOT .catch() chains
async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err; // exhausted retries — propagate the final failure
      await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 100)); // exponential backoff
    }
  }
}
```

```javascript
// Promise.race for a timeout pattern
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Operation timed out')), ms)
  );
  return Promise.race([promise, timeout]); // settles with WHICHEVER resolves/rejects first
}

await withTimeout(fetch('/api/slow-endpoint'), 5000); // rejects after 5s if the fetch hasn't resolved yet
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Using `Promise.all` When Partial Failure Should Be Tolerated
```javascript
// ❌ WRONG for the "partial success is fine" use case: one rejection discards ALL results
const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);

// ✅ CORRECT: allSettled when some failures are acceptable and shouldn't block the others
const results = await Promise.allSettled([fetchA(), fetchB(), fetchC()]);
```

### ⚠️ Pitfall 2: Forgetting `await` Inside a `.map()` Callback, Producing an Array of Promises
```javascript
// ❌ WRONG: .map() with an async callback returns an ARRAY OF PROMISES, not resolved values —
// this is a genuinely common bug, since the code LOOKS like it's awaiting each fetch
const results = ids.map(async (id) => await fetchUser(id)); // results is Promise<User>[], NOT User[]
console.log(results[0].name); // undefined — results[0] is a Promise object, not a User

// ✅ CORRECT: wrap the whole mapped array in Promise.all to actually await all of them
const results2 = await Promise.all(ids.map((id) => fetchUser(id)));
console.log(results2[0].name); // ✅ works — results2 is a real array of resolved User objects
```

### ⚠️ Pitfall 3: An Unhandled Promise Rejection From a "Fire and Forget" Async Call
```javascript
// ❌ RISKY: calling an async function without awaiting or catching it means a rejection becomes
// an "unhandled promise rejection" — in Node this can CRASH the process (depending on version/config);
// in the browser it surfaces only as a console warning, easy to miss in production
function saveAnalyticsEvent(event) {
  sendToAnalytics(event); // fire-and-forget — but sendToAnalytics is async and can reject!
}

// ✅ CORRECT: always attach SOME rejection handling, even for "don't care about the result" calls
function saveAnalyticsEvent2(event) {
  sendToAnalytics(event).catch((err) => console.error('Analytics send failed:', err));
}
```
