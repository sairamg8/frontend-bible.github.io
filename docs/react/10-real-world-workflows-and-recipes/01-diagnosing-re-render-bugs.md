# ⚛️ Diagnosing Re-Render Bugs: Too Many, or Not Enough

## 1. Under-The-Hood Mechanics

Every re-render bug report is actually one of **two opposite problems**, and they have almost entirely different causes — the first debugging step is figuring out which one you actually have, since chasing the wrong category wastes real time.

```text
"This re-renders TOO OFTEN"              "This WON'T re-render when I expect it to"
        │                                          │
        ├─ Parent re-rendered, child has no        ├─ State mutated in place (Object.is sees
        │  React.memo (default: children ALWAYS    │  the SAME reference, bails out — see the
        │  re-render when their parent does)        │  useState mutation pitfall in the core-hooks doc)
        │                                          │
        ├─ React.memo present, but an inline        ├─ A value read from a `ref` instead of state
        │  object/array/function prop defeats       │  (refs mutate silently, never scheduling
        │  memo's shallow prop comparison            │  a render at all)
        │                                          │
        └─ Context value object is a NEW            └─ Missing dependency in useEffect/useMemo/
           reference every Provider render —           useCallback — a stale closure computes
           this bypasses React.memo ENTIRELY,           against old values forever
           because Context propagation is a
           SEPARATE mechanism from prop diffing
```

### The Non-Obvious Rule: `React.memo` Does Nothing Against Context
This is the single most common "why doesn't memo work" surprise: when a `<Context.Provider>`'s value changes, React's `propagateContextChange` walks the Fiber tree and force-updates **every consumer of that context**, regardless of whether components in between are wrapped in `React.memo` (see the [`useContext` mechanics doc](../04-context-and-external-stores/01-use-context-and-use-sync-external-store.md)). `React.memo` only ever short-circuits **prop-driven** re-renders from a parent — it was never a mechanism that could intercept context propagation, and no amount of wrapping fixes a context-value-identity problem.

### The Other Non-Obvious Rule: `React.memo` Doesn't Block a Component's Own State
A memoized component clicking its own button and calling its own `setState` re-renders exactly like a non-memoized one would — `React.memo` only gates re-renders **triggered by a parent's re-render passing the same props down**, not the component's own internal state changes. "I wrapped it in memo but it still re-renders when I click it" is usually this misunderstanding, not a bug.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Dashboard Widget Grid Where Every Widget Re-Renders on Every Keystroke in an Unrelated Search Box.
A dashboard has 30 independent widget components below a shared header containing a search input. Typing in the search box — which only filters ONE specific widget — causes visibly janky re-renders across all 30 widgets on every keystroke, verified via React DevTools Profiler's "highlight updates" overlay lighting up the entire grid, not just the one filtered widget. The root cause: the search input's state lived in the same parent component that rendered all 30 widgets, so every keystroke re-rendered that parent, and none of the widgets were wrapped in `React.memo` — the DEFAULT behavior of "children always re-render with their parent" was silently doing exactly what it's designed to do, just not what the team assumed would happen.

---

## 3. Production-Grade Diagnostic Sequence

```tsx
// Step 1: CONFIRM it's actually re-rendering, and how often — don't guess, instrument
function Widget({ data }: { data: WidgetData }) {
  console.log(`[RENDER] Widget ${data.id} rendered at`, performance.now());
  // ... or use React DevTools Profiler's "Highlight updates when components render" setting,
  // which visually flashes any component's DOM output the instant it re-renders
  return <WidgetView data={data} />;
}
```

```tsx
// Step 2a: "TOO OFTEN" diagnosis — check what's ACTUALLY passed as props, not what you assume
// ❌ SUSPECT: is a NEW object/array/function literal created inline on every parent render?
<Widget config={{ theme: 'dark' }} onRefresh={() => refetch(data.id)} data={data} />
//              ^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//              NEW reference every render — even if Widget is React.memo'd, THESE
//              two props always fail the shallow-equality check and force a re-render

// ✅ FIX: stabilize the references with useMemo/useCallback, OR move static values out of render
const config = useMemo(() => ({ theme: 'dark' }), []);
const handleRefresh = useCallback(() => refetch(data.id), [data.id]);
<Widget config={config} onRefresh={handleRefresh} data={data} />
```

```tsx
// Step 2b: "TOO OFTEN" via Context — the memo fix above does NOT apply here
// ❌ SUSPECT: does a Provider create a new value object on every one of ITS OWN renders?
function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // NEW object every AppProviders render — EVERY consumer of AuthContext re-renders,
  // even ones wrapped in React.memo, because this isn't a props problem at all
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}

// ✅ FIX: memoize the context value itself, so identity is stable across renders
// that don't actually change user/setUser
function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

```tsx
// Step 3a: "WON'T RE-RENDER" diagnosis — is state being mutated instead of replaced?
// ❌ SUSPECT:
function addItem(newItem: Item) {
  cart.items.push(newItem);   // mutates the SAME array reference
  setCart(cart);                // Object.is(oldCart, newCart) === true — React bails out, no re-render
}

// ✅ FIX: create a new reference
function addItem(newItem: Item) {
  setCart((prev) => ({ ...prev, items: [...prev.items, newItem] }));
}
```

```tsx
// Step 3b: "WON'T RE-RENDER" via a ref standing in for state
// ❌ SUSPECT: does the value live in a ref instead of state?
const scrollPosition = useRef(0);
function onScroll(e: Event) {
  scrollPosition.current = (e.target as HTMLElement).scrollTop; // mutates silently — ZERO re-renders scheduled
}
// Any JSX reading `scrollPosition.current` will show a STALE value until something ELSE
// happens to trigger a re-render for an unrelated reason — refs are explicitly
// designed to NOT participate in the render-scheduling system at all

// ✅ FIX: if the UI needs to reflect this value, it has to be state, not a ref
const [scrollPosition, setScrollPosition] = useState(0);
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: "Optimizing" With `React.memo` on a Component That Never Had Stable Props to Begin With
Wrapping a component in `React.memo` while its parent keeps passing brand-new inline object/function props every render (Step 2a above) achieves **nothing** — the shallow comparison fails every single time regardless, but you've now ALSO paid the cost of the comparison itself on every render. `React.memo` is only a win once the props it's comparing are ALREADY stable; fix the prop identities first, verify with the Profiler that renders actually dropped, and only then consider the memo wrapper "working."

### ⚠️ Pitfall 2: Assuming `useMemo`/`useCallback` on the CHILD Fixes a Prop Identity Problem
```tsx
// ❌ WRONG target: memoizing something INSIDE the child does nothing about the PARENT
// re-creating the object it's passing down as a prop in the first place
function Child({ config }: { config: Config }) {
  const stableConfig = useMemo(() => config, [config]); // config is STILL a new ref every time —
  // this useMemo's dependency array itself never stabilizes, so this "memoization" is a no-op
}

// ✅ CORRECT: the stabilization has to happen where the value is CREATED (the parent),
// not where it's merely received (the child)
```

### ⚠️ Pitfall 3: Confusing React 19's Automatic Memoization Hopes With Reality
Community discussion around the React Compiler sometimes leads engineers to assume manual `useMemo`/`useCallback`/`React.memo` are now unnecessary everywhere. Unless a project has actually adopted the React Compiler (a separate, opt-in build tool) and confirmed via its output that a specific component was auto-memoized, none of this diagnostic process changes — plain React 19 without the compiler has exactly the same manual-memoization rules described above.

### ⚠️ Pitfall 4: Trusting "Component Re-Rendered" and "DOM Actually Changed" Are the Same Thing
A component function re-executing does **not** necessarily mean the browser DOM was touched — React still diffs the returned JSX against its previous render and only commits actual DOM mutations for what changed. A `console.log` in a component body firing often looks alarming but may be cheap (React bailing out at the commit phase); the DevTools Profiler's actual **render duration** numbers, not just render-count, are what tell you whether a given "too often" case is worth fixing at all.
