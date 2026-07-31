# ⚛️ React 19 `useActionState` & `useOptimistic`: Modern Async Mutations

## 1. Under-The-Hood Mechanics

React 19 revolutionizes form mutations and asynchronous data updates by introducing **Actions**.

### What is an Action?
An Action is an asynchronous function that processes a state mutation (e.g. submitting a form, updating a shopping cart, toggling a social like). 

```
User Click -> Action Dispatched
                 │
                 ├──► 1. useOptimistic: Instantly project new UI (0ms delay)
                 │
                 └──► 2. Async Server Execution (Background HTTP Request)
                           │
                           ├── SUCCESS: Server state reconciles seamlessly
                           │
                           └── FAILURE: React automatically rolls back UI to original state
```

- `useActionState`: Replaces manual `useState` boilerplate for `isLoading`, `error`, and `data` when handling async functions.
- `useOptimistic`: Maintains a **temporary optimistic state projection** during an active async transition. Once the transition finishes, React discards the optimistic state and adopts the resolved server state.

---

## 2. Real-World Engineering Scenario

**Scenario**: Enterprise E-Commerce Cart Quantity Adjuster with 0ms Perceived Latency & Network Rollback.
In high-concurrency e-commerce platforms (like Amazon or Shopify), when a user clicks `+` to increase item quantity from 1 to 2, waiting 1.5s for a network response makes the app feel sluggish.
With `useOptimistic`, item quantity updates to `2` **instantly**. If the backend API call fails, the action **catches** the failure itself and returns an error-flagged state (rather than throwing) — `useOptimistic` then discards its optimistic projection and reverts to that real state, and the component renders an inline toast-style banner from the error field. Letting the action throw instead would hand the failure to the nearest Error Boundary, which is usually the wrong UX for a single failed cart update.

---

## 3. Production-Grade Code Example

```tsx
import React, { useActionState, useOptimistic } from 'react';

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  error?: string; // set on failure — drives the inline toast; cleared on the next successful update
}

// 1. Simulated Async Server Action (e.g., Next.js Server Action or REST endpoint)
async function updateCartQuantityAction(
  prevState: CartItem,
  formData: FormData
): Promise<CartItem> {
  const newQty = parseInt(formData.get('quantity') as string, 10);

  // Simulate network latency
  await new Promise((res) => setTimeout(res, 1200));

  // Simulate 15% random network/server failure to test rollback
  if (Math.random() < 0.15) {
    // Return an error-flagged state instead of throwing: useActionState treats a thrown
    // error as uncaught (nearest Error Boundary), which would unmount this cart item —
    // returning state instead keeps the item mounted and lets the UI show an inline toast
    return { ...prevState, error: 'Server connection lost. Unable to update cart quantity.' };
  }

  return {
    ...prevState,
    quantity: newQty,
    error: undefined,
  };
}

export function OptimisticCartItem({ initialItem }: { initialItem: CartItem }) {
  // 2. React 19 Action State Hook
  const [state, formAction, isPending] = useActionState(updateCartQuantityAction, initialItem);

  // 3. Optimistic State Hook: Instantly project optimistic quantity
  const [optimisticItem, setOptimisticItem] = useOptimistic(
    state,
    (current: CartItem, newQuantity: number) => ({
      ...current,
      quantity: newQuantity,
    })
  );

  const handleQuantityChange = async (newQty: number) => {
    if (newQty < 1) return;

    // A. Apply instant optimistic update to UI (0ms delay!)
    setOptimisticItem(newQty);

    // B. Build FormData and execute async server action
    const formData = new FormData();
    formData.append('quantity', newQty.toString());
    await formAction(formData);
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-white max-w-sm space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-sm text-cyan-400">{optimisticItem.name}</h4>
        <span className="text-xs font-mono text-slate-400">${optimisticItem.price} each</span>
      </div>

      <div className="flex items-center justify-between bg-slate-800 p-2 rounded">
        <span className="text-xs text-slate-300">Quantity:</span>

        <div className="flex items-center gap-2 font-mono">
          <button
            disabled={isPending || optimisticItem.quantity <= 1}
            onClick={() => handleQuantityChange(optimisticItem.quantity - 1)}
            className="w-7 h-7 bg-slate-700 hover:bg-slate-600 rounded text-xs disabled:opacity-40"
          >
            -
          </button>
          <span className="px-2 font-bold text-cyan-300">{optimisticItem.quantity}</span>
          <button
            disabled={isPending}
            onClick={() => handleQuantityChange(optimisticItem.quantity + 1)}
            className="w-7 h-7 bg-slate-700 hover:bg-slate-600 rounded text-xs disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
        <span className="text-slate-400">Total:</span>
        <span className="font-bold text-emerald-400 font-mono">
          ${(optimisticItem.quantity * optimisticItem.price).toFixed(2)}
        </span>
      </div>

      {isPending && (
        <p className="text-[10px] text-amber-400 animate-pulse text-right">
          Syncing with cart service...
        </p>
      )}

      {/* Inline toast: rendered from `state.error`, NOT `optimisticItem` — the optimistic
          projection has already been discarded and reverted by the time this shows */}
      {state.error && !isPending && (
        <p className="text-[10px] text-red-400 text-right" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Out-of-Order Async Mutations (Race Conditions)
If a user rapidly clicks `+` three times:
1. Click 1 (`qty: 2`) -> Network Request 1
2. Click 2 (`qty: 3`) -> Network Request 2
3. Click 3 (`qty: 4`) -> Network Request 3

If Request 3 finishes *before* Request 2 due to network routing latency, Request 2 arriving last will overwrite the server state to `3`!
- **Solution**: Pass unique **Idempotency Keys** or sequential version timestamps in server actions to ensure out-of-order responses are rejected by the backend server.

### ⚠️ Pitfall 2: Mutating Optimistic State Outside Transitions
`setOptimisticItem` must only be called inside event handlers associated with an active action or transition pass. Calling `setOptimisticItem` in a standalone `useEffect` will throw a React runtime error.
