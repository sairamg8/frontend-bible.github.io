# ⚡ Error Handling: `try`/`catch`, Custom Errors & Unhandled Rejections

## 1. Under-The-Hood Mechanics

Error handling in JS spans two genuinely different mechanisms — synchronous `try`/`catch` and asynchronous Promise rejection propagation — that don't automatically interoperate unless bridged correctly.

```
Synchronous:  try { riskyCall(); } catch (err) { /* handles a THROWN error */ } finally { /* ALWAYS runs */ }

Asynchronous (Promise-based):  promise.catch(handler)  ──►  handles a REJECTED promise
Asynchronous (async/await):    try { await riskyAsyncCall(); } catch (err) { /* ALSO catches a REJECTED promise */ }
```
`finally` runs **regardless** of whether the `try` block succeeded, threw, or even executed a `return`/`break`/`continue` inside it — the one guaranteed cleanup hook, used for releasing resources (closing a connection, hiding a loading spinner) that must happen no matter what.

### Custom Error Classes: Extending `Error` for Domain Context
```javascript
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError'; // otherwise defaults to 'Error', making instanceof checks less informative in logs
    this.field = field; // domain-specific context a plain Error can't carry
  }
}
```
Extending `Error` (rather than throwing a plain string or object) preserves the built-in `.stack` trace, `instanceof Error` checks, and integrates correctly with tooling (error trackers, logging frameworks) that specifically expect real `Error` instances.

### Promise Rejection Propagation Through `async`/`await`
An `await`-ed rejected Promise **throws** inside the `async` function — meaning a single `try`/`catch` wrapping several `await` calls handles rejections from any of them uniformly, exactly like synchronous exceptions.

### `unhandledrejection`: The Last-Resort Safety Net
When a Promise rejects and **no** `.catch()`/`try`-`catch` anywhere in the chain ever handles it, the browser fires a global `unhandledrejection` event (Node has an equivalent `process.on('unhandledRejection', ...)`) — a safety net for catching (and at minimum, logging) rejections that genuinely escaped all application-level handling, rather than letting them vanish silently.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Form Validation System Needing to Distinguish "Field Is Invalid" From "Network Request Failed" at the Catch Site.
A form submission handler wrapped both client-side validation and a network `fetch()` call in one `try`/`catch` — but the generic `catch (err)` couldn't distinguish "the email field failed validation" (should highlight that specific field) from "the network request failed" (should show a generic retry banner), since both surfaced as a bare, untyped error. Introducing a `ValidationError` custom class (with a `.field` property) let the catch block use `instanceof ValidationError` to branch correctly — highlighting the specific invalid field for validation errors, and falling back to a generic network-failure UI for everything else, all from one `catch` block.

---

## 3. Production-Grade Code Example

```javascript
// Custom error hierarchy carrying domain-specific context
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class NetworkError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
  }
}

async function submitForm(formData) {
  if (!formData.email.includes('@')) {
    throw new ValidationError('Invalid email address', 'email');
  }

  const res = await fetch('/api/submit', { method: 'POST', body: JSON.stringify(formData) });
  if (!res.ok) {
    throw new NetworkError(`Submission failed`, res.status);
  }
  return res.json();
}

async function handleSubmit(formData) {
  try {
    await submitForm(formData);
    showSuccessMessage();
  } catch (err) {
    if (err instanceof ValidationError) {
      highlightField(err.field, err.message); // specific, actionable UI response
    } else if (err instanceof NetworkError) {
      showRetryBanner(); // different UI response for a different failure category
    } else {
      reportUnexpectedError(err); // genuinely unexpected — log it, show a generic fallback
    }
  }
}
```

```javascript
// finally for guaranteed cleanup, regardless of success/failure
async function loadWithSpinner(url) {
  showSpinner();
  try {
    return await fetch(url).then((r) => r.json());
  } catch (err) {
    showErrorToast(err.message);
    throw err; // re-throw so callers still see the failure — finally still runs before this propagates
  } finally {
    hideSpinner(); // ALWAYS runs — success, caught error, or re-thrown error
  }
}
```

```javascript
// Global unhandledrejection safety net — catching what escaped all application-level handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  reportToErrorTracker(event.reason); // last-resort visibility into genuinely missed error handling
  event.preventDefault(); // optionally suppress the default browser console error
});
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Throwing Non-Error Values
```javascript
// ❌ WRONG: throwing a plain string/object loses the automatic stack trace, and fails
// `instanceof Error` checks that logging/monitoring tooling often relies on
throw 'Something went wrong'; // no .stack, no .name, awkward to handle generically

// ✅ CORRECT: always throw actual Error instances (or subclasses)
throw new Error('Something went wrong'); // has .stack, .message, .name — works with all standard tooling
```

### ⚠️ Pitfall 2: Swallowing Errors With an Empty `catch` Block
```javascript
// ❌ DANGEROUS: silently discarding EVERY error, including genuinely unexpected ones,
// makes debugging production issues nearly impossible — the failure just vanishes
try {
  await riskyOperation();
} catch (err) {} // silent failure — no logging, no user feedback, nothing

// ✅ CORRECT: at minimum, log the error — ideally distinguish expected vs unexpected failures
try {
  await riskyOperation();
} catch (err) {
  console.error('riskyOperation failed:', err);
  // handle or re-throw as appropriate for this specific call site
}
```

### ⚠️ Pitfall 3: Forgetting `finally`'s `return` Overrides the `try`/`catch` Block's Own Return Value
```javascript
// ❌ SURPRISING: a return INSIDE finally overrides ANY return/throw from the try/catch blocks —
// this function ALWAYS returns 'from finally', even though the try block returns something else
function example() {
  try {
    return 'from try';
  } finally {
    return 'from finally'; // this WINS, silently discarding 'from try' — a genuinely confusing footgun
  }
}
console.log(example()); // 'from finally'

// ✅ AWARENESS: avoid return/throw statements inside finally blocks entirely — use finally
// purely for side-effect cleanup (closing connections, hiding spinners), never for control flow
```
