# ⚛️ `useContext` & `useSyncExternalStore`: State Sharing & Tearing Prevention

## 1. Under-The-Hood Mechanics

### `useContext` (React Fiber Context Propagation)
React Context solves prop drilling by establishing a dependency subscription between a `<Context.Provider>` and consumer components.

Inside the Fiber node, when a component calls `useContext(MyContext)`:
1. React registers a **Context Dependency Object** on the consumer Fiber node.
2. When the `<Context.Provider value={newValue}>` re-renders with a new value (`Object.is(oldValue, newValue) === false`), React executes `propagateContextChange`.
3. `propagateContextChange` traverses down the Fiber tree, scanning for all consumers subscribed to `MyContext`, marking their Fiber flags as `NeedsUpdate` regardless of whether intermediate parent components are wrapped in `React.memo`!

### `useSyncExternalStore` (Concurrent Tearing Prevention)
In React 18 & 19 Concurrent Mode, state updates are interruptible. If an external state store (e.g. Redux, Zustand, RxJS, `window.matchMedia`, `navigator.onLine`) updates *while* React is in the middle of a low-priority transition render, different components in the same render tree could read different values from the store—causing **Visual Tearing**.

`useSyncExternalStore` forces React to read external store snapshots atomically and synchronously during render pass, guaranteeing zero visual tearing.

---

## 2. Real-World Engineering Scenario

**Scenario**: Micro-Frontend Shared Auth & Theme Store + Real-Time WebSocket Network Listener.
You are building an enterprise micro-frontend shell where multiple independent React apps share a global authentication token, dark mode theme, and network socket connection.
- `useContext`: Shared across local UI subtrees (e.g. Navigation Theme Context).
- `useSyncExternalStore`: Subscribing to an external RxJS/Zustand store or WebSocket network listener shared across micro-frontends without tearing.

---

## 3. Production-Grade Code Example

```tsx
import React, { createContext, useContext, useState, useSyncExternalStore } from 'react';

// ==========================================
// PART 1: External Global Store (Vanilla JS outside React)
// ==========================================
interface UserSession {
  token: string;
  user: { id: string; name: string; role: string } | null;
}

class ExternalAuthStore {
  private session: UserSession = {
    token: 'jwt_bearer_token_xyz987',
    user: { id: 'u_101', name: 'Alexander Wright', role: 'Lead Architect' },
  };
  private listeners: Set<() => void> = new Set();

  subscribe = (callback: () => void) => {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  };

  // Snapshot MUST return immutable reference
  getSnapshot = () => this.session;

  // Hydration safe snapshot for SSR
  getServerSnapshot = () => this.session;

  logout = () => {
    this.session = { token: '', user: null };
    this.listeners.forEach((listener) => listener());
  };
}

export const globalAuthStore = new ExternalAuthStore();

// ==========================================
// PART 2: Local UI Theme Context
// ==========================================
interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// ==========================================
// PART 3: Consumer Component combining both
// ==========================================
export function MicroFrontendHeader() {
  // 1. Consume local Context
  const themeCtx = useContext(ThemeContext);

  // 2. Consume external store atomically via useSyncExternalStore
  const session = useSyncExternalStore(
    globalAuthStore.subscribe,
    globalAuthStore.getSnapshot,
    globalAuthStore.getServerSnapshot
  );

  if (!themeCtx) {
    throw new Error('MicroFrontendHeader must be rendered inside <ThemeProvider>');
  }

  return (
    <header className="p-4 border-b border-slate-800 flex justify-between items-center font-mono">
      <div>
        <h3 className="text-sm font-bold text-cyan-400">Enterprise Shell Header</h3>
        {session.user ? (
          <p className="text-xs text-slate-400">
            User: <b className="text-emerald-400">{session.user.name}</b> ({session.user.role})
          </p>
        ) : (
          <p className="text-xs text-rose-400">Session Expired (Logged Out)</p>
        )}
      </div>

      <div className="flex gap-2 text-xs">
        <button
          onClick={themeCtx.toggleTheme}
          className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300"
        >
          Theme: {themeCtx.theme}
        </button>

        {session.user && (
          <button
            onClick={() => globalAuthStore.logout()}
            className="px-3 py-1 bg-rose-950 text-rose-400 border border-rose-800 rounded hover:bg-rose-900"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Whole-Tree Re-renders via Un-memoized Context Values
If you pass an inline object literal to `<Context.Provider value={{ theme, toggleTheme }}>`, a brand new object is created on **every render** of the Provider component. This forces every `useContext` consumer in the app to re-render, destroying performance.

```tsx
// ❌ BAD: Un-memoized value object causes all consumers to re-render every time Provider renders!
<ThemeContext.Provider value={{ theme, toggleTheme }}>

// ✅ CORRECT: Wrap provider value in useMemo
const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme]);
<ThemeContext.Provider value={contextValue}>
```

### ⚠️ Pitfall 2: Infinite Loops in `useSyncExternalStore` (Mutable Snapshots)
If `getSnapshot` returns a new object reference every time it is called, React thinks the store updated continuously, causing an **infinite re-render crash**.

```tsx
// ❌ FATAL BUG: Returning new object in getSnapshot!
getSnapshot: () => ({ isOnline: navigator.onLine }), // Object.is(old, new) is ALWAYS FALSE! Infinite Loop!

// ✅ FIX: Return cached primitive or immutable object reference
getSnapshot: () => this.isOnline, // Primitive boolean value
```
