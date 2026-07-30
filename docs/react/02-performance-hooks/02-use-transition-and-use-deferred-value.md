# ⚛️ `useTransition` & `useDeferredValue`: Non-Blocking Concurrent Rendering

## 1. Under-The-Hood Mechanics

React 18 & 19 feature **Concurrent Rendering**, an engine capability that allows React to pause, resume, or abort component rendering work based on priority queues managed by the React Scheduler.

### Priority Categories
React categorizes state updates into two distinct priority tiers:
1. **Sync / High Priority**: Direct user feedback inputs (keypress typing, button clicks, checkbox toggles). These must render immediately (target INP < 50ms).
2. **Transition / Low Priority**: Large UI re-renders, complex data filtering, tab switching, and heavy chart rendering.

### `useTransition` vs `useDeferredValue`

| Capability | `useTransition` | `useDeferredValue` |
| :--- | :--- | :--- |
| **Primary Target** | Wraps the **State Updating Function** (`startTransition(() => setState(...))`) | Wraps the **Value / Prop** itself (`useDeferredValue(value)`) |
| **Control Origin** | Use when you control the state setter | Use when receiving props from parent components or external hooks |
| **Pending Indicator** | Provides `isPending` boolean flag | No pending flag (Compare `deferredValue !== currentValue`) |

```
[User Input Keypress] ──► Immediate Sync Update (0ms Input Lag)
                                │
                                └──► React Scheduler (Spawns Low-Priority Micro-Task)
                                          │
                                          ▼
                               Interruptible Background Render (Filtered List / Heavy Chart)
```

---

## 2. Real-World Engineering Scenario

**Scenario**: Enterprise High-Frequency Crypto Screener & Interactive Analytics Filter.
A financial analytics dashboard streams live market prices for 50,000 crypto pairs. Users type in a search query to filter the market pairs while real-time WebSocket ticks arrive.
- Without `useTransition`: Each keypress blocks the browser thread while filtering 50,000 pairs, causing **input lag, dropped frames, and high INP latency**.
- With `useTransition`: Input typing stays 100% smooth at 60 FPS, while the market list filters concurrently in the background.

---

## 3. Production-Grade Code Example

```tsx
import React, { useState, useTransition, useDeferredValue, useMemo } from 'react';

interface CryptoPair {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
}

// 1. Heavy Subtree Component consuming Deferred Value
const HeavyMarketList = React.memo(function HeavyMarketList({
  query,
  pairs,
}: {
  query: string;
  pairs: CryptoPair[];
}) {
  // Heavy CPU filtering loop
  const filtered = useMemo(() => {
    console.log('[PERF] Filtering market pairs for query:', query);
    if (!query) return pairs;
    return pairs.filter((p) => p.symbol.toLowerCase().includes(query.toLowerCase()));
  }, [query, pairs]);

  return (
    <div className="space-y-1 mt-3 max-h-64 overflow-y-auto font-mono text-xs">
      {filtered.slice(0, 100).map((p) => (
        <div key={p.id} className="p-2 bg-slate-800 rounded flex justify-between items-center">
          <span className="text-cyan-400 font-bold">{p.symbol}</span>
          <span>${p.price.toFixed(4)}</span>
          <span className={p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
            {p.change24h >= 0 ? '+' : ''}{p.change24h.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
});

export function CryptoMarketScreener({ allPairs }: { allPairs: CryptoPair[] }) {
  // Fast input state (High Priority)
  const [searchTerm, setSearchTerm] = useState('');
  
  // Transition hook for state setter control
  const [isPending, startTransition] = useTransition();

  // Alternative approach: Deferring prop value directly
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    // 1. Immediate sync update for instant text response
    setSearchTerm(nextValue);

    // 2. Wrap heavy state updates in startTransition if needed
    startTransition(() => {
      // Transition update logic if using dedicated transition state
    });
  };

  const isStale = searchTerm !== deferredSearchTerm;

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-white max-w-lg space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-sm text-cyan-400">Live Crypto Screener</h3>
        {(isPending || isStale) && (
          <span className="text-[10px] text-amber-400 animate-pulse font-mono">
            ⚡ Concurrent Recalculation...
          </span>
        )}
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="Type to filter 50,000 pairs (e.g. BTC, ETH)..."
        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-500"
      />

      {/* Passing deferred value to heavy child ensures input stays responsive */}
      <div className={isStale ? 'opacity-60 transition-opacity' : 'opacity-100'}>
        <HeavyMarketList query={deferredSearchTerm} pairs={allPairs} />
      </div>
    </div>
  );
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Wrapping Controlled Inputs Directly in Transition State
Never pass a transition state variable directly into the `value` prop of a controlled `<input>`!

```tsx
// ❌ FATAL UX BUG: Input freezes during typing!
const [text, setText] = useState('');
const [isPending, startTransition] = useTransition();

<input
  value={text}
  onChange={(e) => {
    startTransition(() => setText(e.target.value)); // WRONG! Makes input updates low-priority!
  }}
/>

// ✅ CORRECT: Update text state immediately, defer the HEAVY DOWNSTREAM state or use useDeferredValue
```

### ⚠️ Pitfall 2: Confusing `useDeferredValue` with Debouncing
- **Debouncing** (`setTimeout` delay): Introduces an artificial fixed delay (e.g. 300ms) *before* starting any work. Even on a supercomputer, the user must wait 300ms.
- **`useDeferredValue`** (Concurrent Scheduler): Starts rendering **immediately** on idle micro-tasks. On fast devices, it updates in 5ms; on slow devices, it yields main thread execution to prevent freezing.

### ⚠️ Pitfall 3: Missing `React.memo` on Downstream Children
If you pass `deferredValue` to a child component that is **not wrapped in `React.memo`**, the child will still re-render when the parent renders! Always wrap the heavy downstream child in `React.memo` so it skips rendering until `deferredValue` actually updates.
