# ⚛️ React 19.2 Additions: `useEffectEvent`, `<Activity>`, `cache()` & `cacheSignal`

## 1. Under-The-Hood Mechanics

### `useEffectEvent` (Non-Reactive Event Logic)
A classic limitation of `useEffect` is that reading a prop or state variable inside an effect forces you to include that variable in the dependency array—causing the effect to re-run whenever the variable updates.

`useEffectEvent` breaks this coupling. It extracts **non-reactive logic** into a stable event function:
- The event function **always sees the latest props and state**.
- The event function identity is **stable** and **must NOT be included in `useEffect` dependency arrays**.

```
[State/Prop Updates] ──► useEffectEvent Callback sees fresh values
                                │
                                └──► Does NOT trigger useEffect re-execution!
```

### `<Activity>` (Offscreen State-Preserving Rendering)
`<Activity mode="visible" | "hidden">` (formerly known as Offscreen rendering) allows React to hide UI subtrees while **preserving full DOM state, hook state, and scroll position**.
- `mode="hidden"`: React de-prioritizes rendering updates for the subtree and unmounts layout effects while retaining Fiber state in memory.
- `mode="visible"`: Instantly restores the subtree with zero re-initialization overhead.

### `cache()` & `cacheSignal` (Request-Scoped Server Memoization)
- `cache(asyncFn)`: Memoizes async data fetching calls per-request in React Server Components (RSC). If 10 components invoke `getUser(id)` during a single HTTP request, `getUser` executes **once**.
- `cacheSignal`: Provides an `AbortSignal` tied to the lifecycle of the active server request, automatically cancelling pending database/REST calls if the client aborts the request.

---

## 2. Real-World Engineering Scenario

**Scenario**: Enterprise Analytics Dashboard with Multi-Tab Preservation & Telemetry Logging.
1. **Telemetry Logging (`useEffectEvent`)**: Subscribing to a WebSocket room feed. When a message arrives, log analytics with current `theme` settings without tearing down and re-creating the WebSocket connection every time `theme` changes.
2. **Tab Preservation (`<Activity>`)**: Switching between "Live Telemetry" and "System Logs" tabs without resetting search filters or scroll positions.

---

## 3. Production-Grade Code Example

```tsx
import React, { useState, useEffect, useEffectEvent, Activity, cache, cacheSignal } from 'react';

// ==========================================
// 1. React 19.2 cache() & cacheSignal Example (Server Data Fetcher)
// ==========================================
export const fetchUserDataCached = cache(async (userId: string) => {
  console.log(`[RSC CACHE] Querying database for user: ${userId}`);
  // cacheSignal() returns an AbortSignal tied to this request's lifecycle — wiring it into
  // fetch is what actually gets you the auto-cancel-on-client-disconnect behavior; cache()
  // alone only gives you per-request memoization, not abort propagation
  const res = await fetch(`https://api.enterprise.com/users/${userId}`, { signal: cacheSignal() });
  return res.json();
});

// ==========================================
// 2. useEffectEvent & <Activity> Component Example
// ==========================================
export function AnalyticsTabContainer({ symbol, theme }: { symbol: string; theme: string }) {
  const [activeTab, setActiveTab] = useState<'chart' | 'logs'>('chart');
  const [logCount, setLogCount] = useState(0);

  // Non-reactive Event Function (Always reads latest theme, but NEVER triggers useEffect re-run!)
  const onMessageReceived = useEffectEvent((data: any) => {
    console.log(`[TELEMETRY LOG] Symbol: ${symbol} | Theme: ${theme} | Price: ${data.price}`);
    setLogCount((prev) => prev + 1);
  });

  useEffect(() => {
    console.log(`[SOCKET CONNECT] Opening connection for symbol: ${symbol}`);
    const socket = new WebSocket(`wss://ws.exchange.com/stream?symbol=${symbol}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Call non-reactive event handler
      onMessageReceived(data);
    };

    return () => {
      console.log(`[SOCKET TEARDOWN] Closing socket for symbol: ${symbol}`);
      socket.close();
    };
  }, [symbol]); // NOTE: theme is NOT in dependency array, yet onMessageReceived reads fresh theme!

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-white space-y-4 max-w-lg">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-sm text-cyan-400">Enterprise Telemetry Hub</h3>
        <span className="text-xs font-mono text-slate-400">Logs Received: {logCount}</span>
      </div>

      <div className="flex gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('chart')}
          className={`px-3 py-1.5 rounded ${activeTab === 'chart' ? 'bg-cyan-600 font-bold' : 'bg-slate-800'}`}
        >
          Live Chart Tab
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3 py-1.5 rounded ${activeTab === 'logs' ? 'bg-cyan-600 font-bold' : 'bg-slate-800'}`}
        >
          System Logs Tab
        </button>
      </div>

      {/* React 19.2 <Activity> preserves DOM & State when hidden */}
      <Activity mode={activeTab === 'chart' ? 'visible' : 'hidden'}>
        <div className="p-4 bg-slate-950 border border-slate-800 rounded text-xs font-mono">
          📊 Active Chart Engine (State preserved when tab is switched)
        </div>
      </Activity>

      <Activity mode={activeTab === 'logs' ? 'visible' : 'hidden'}>
        <div className="p-4 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-amber-400">
          📜 System Logs Stream (Preserves scroll position & input filters)
        </div>
      </Activity>
    </div>
  );
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Calling `useEffectEvent` Outside Effects
`useEffectEvent` functions can **ONLY be called inside `useEffect` or `useLayoutEffect`**.
- **Symptom**: Calling an effect event inside an `onClick` handler or component render body throws a fatal React runtime crash: *"useEffectEvent functions must only be called inside effects."*

### ⚠️ Pitfall 2: Memory Footprint of Hidden `<Activity>` Subtrees
While `<Activity mode="hidden">` keeps component state ready for sub-millisecond restoration, keeping 50 heavy component subtrees hidden in memory consumes RAM. Unmount components completely if they are unlikely to be revisited by the user.
