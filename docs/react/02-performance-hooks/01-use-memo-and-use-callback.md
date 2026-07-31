# ⚛️ `useMemo` & `useCallback`: Performance Tuning & Referential Equality

## 1. Under-The-Hood Mechanics

Both `useMemo` and `useCallback` exist to solve a fundamental property of JavaScript: **Object and Function Reference Equality**.

In JavaScript, two distinct object or function instantiations are never equal by reference:
```js
{} === {} // false
(() => {}) === (() => {}) // false
```

Every time a parent component re-renders, all inline objects and inline functions defined inside its render body are **re-created with new memory references**. If these references are passed as props to child components wrapped in `React.memo`, the child components **fail shallow equality checks** and re-render unnecessarily!

### Fiber Node Cache Storage
React stores memoized values in the Fiber node's `memoizedState` array as a tuple:

`memoizedState = [CachedValue, DependencyArray]`

During re-renders:
1. React compares each item in the new dependency array with the previous dependency array using `Object.is(prevDep, nextDep)`.
2. If **all** dependencies are identical, React returns `CachedValue` directly without re-evaluating the function.
3. If **any** dependency changed, React executes the factory function, saves the new value and new dependency array, and returns the fresh value.

```
useMemo(() => computeValue(a, b), [a, b])    --> Caches the RETURN VALUE of the function
useCallback(fn, [a, b])                       --> Caches the FUNCTION INSTANCE itself
```

---

## 2. Real-World Engineering Scenario

**Scenario**: High-Scale Enterprise Financial Data Grid with 10,000 Rows & Complex Sorting/Filtering.
You are building an analytics table displaying 10,000 real-time transaction records. Users can filter by transaction status and click row action buttons.
- Without `useMemo`: Sorting 10,000 items executes on every single parent state change (e.g. typing in a search bar or opening a sidebar menu), freezing the UI for 200ms.
- Without `useCallback`: Passing inline event handlers `onSelectRow={(id) => handleSelect(id)}` forces all 10,000 `<TableRow>` items to re-render every time the parent renders, even if wrapped in `React.memo`.

---

## 3. Production-Grade Code Example

```tsx
import React, { useState, useMemo, useCallback } from 'react';

interface Transaction {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
}

// 1. Child Component wrapped in React.memo for Shallow Prop Comparison
const TableRow = React.memo(function TableRow({
  transaction,
  onSelect,
}: {
  transaction: Transaction;
  onSelect: (id: string) => void;
}) {
  console.log(`[RENDER-CHECK] Rendering TableRow ID: ${transaction.id}`);
  return (
    <div className="flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700/60 text-xs font-mono">
      <span>{transaction.id}</span>
      <span className={transaction.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}>
        ${transaction.amount.toFixed(2)}
      </span>
      <button
        onClick={() => onSelect(transaction.id)}
        className="px-2 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 hover:bg-cyan-900 rounded"
      >
        Inspect
      </button>
    </div>
  );
});

export function EnterpriseDataGrid({ rawTransactions }: { rawTransactions: Transaction[] }) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<'dark' | 'dim'>('dark');

  // 2. Heavy Computation Cached with useMemo
  const filteredTransactions = useMemo(() => {
    console.log('[PERF] Heavy filtering calculation running on 10,000 rows...');
    if (filterStatus === 'all') return rawTransactions;
    return rawTransactions.filter((t) => t.status === filterStatus);
  }, [rawTransactions, filterStatus]); // Only recalculates when raw data or status changes!

  // 3. Stable Function Reference Cached with useCallback
  const handleSelectRow = useCallback((id: string) => {
    setSelectedId(id);
  }, []); // Empty deps = Function identity never changes across re-renders!

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-white space-y-4 max-w-xl">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-sm text-cyan-400">Enterprise Transaction Ledger</h3>
        <button
          onClick={() => setThemeMode(themeMode === 'dark' ? 'dim' : 'dark')}
          className="text-xs px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300"
        >
          Toggle Theme ({themeMode})
        </button>
      </div>

      <div className="flex gap-2">
        {(['all', 'completed', 'pending'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1 text-xs rounded font-mono capitalize border ${
              filterStatus === status
                ? 'bg-cyan-900 border-cyan-500 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="max-h-64 overflow-y-auto rounded border border-slate-800">
        {filteredTransactions.slice(0, 50).map((t) => (
          <TableRow key={t.id} transaction={t} onSelect={handleSelectRow} />
        ))}
      </div>

      {selectedId && (
        <p className="text-xs text-emerald-400 font-mono">Active Selection ID: {selectedId}</p>
      )}
    </div>
  );
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Premature Optimization (Memoizing Trivial Operations)
Memoization is not free! React must allocate memory to store dependency arrays and perform `Object.is` comparisons every render.
```tsx
// ❌ BAD: Memoizing primitive string concatenation (Costs more CPU/memory than it saves!)
const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);

// ✅ CORRECT: Plain calculation
const fullName = `${firstName} ${lastName}`;
```
Only use `useMemo` when:
1. The calculation is computationally expensive (e.g. filtering 1,000+ items, complex regex, matrix math).
2. You need to maintain reference equality for an object/array passed as a dependency to `useEffect` or `React.memo` child.

### ⚠️ Pitfall 2: Breaking Memoization by Passing Inline Objects
```tsx
// ❌ WRONG: Passing inline style/config object breaks child React.memo!
<TableRow
  transaction={t}
  onSelect={handleSelectRow}
  config={{ displayCurrency: 'USD' }} // NEW OBJECT CREATED EVERY RENDER! TableRow re-renders!
/>

// ✅ CORRECT: Memoize the config object or pass primitives
const config = useMemo(() => ({ displayCurrency: 'USD' }), []);
```

### ⚠️ Pitfall 3: Stale Closures in `useCallback`
If you read state inside a `useCallback` but omit that state variable from the dependency array, the callback will forever execute against the **initial stale state snapshot**.

```tsx
// ❌ STALE CLOSURE BUG
const [count, setCount] = useState(0);

const logCount = useCallback(() => {
  console.log(count); // Will ALWAYS print 0 if count is omitted from deps!
}, []); // Omitted count!

// ✅ FIX: Include count in deps OR use functional updater if modifying state
```
