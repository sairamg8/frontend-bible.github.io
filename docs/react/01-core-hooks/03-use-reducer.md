# ⚛️ `useReducer`: Deep Mechanics, Real-World Use Cases & Senior Edge Cases

## 1. Under-The-Hood Fiber Mechanics

`useReducer` is the underlying engine upon which `useState` is built in React's Fiber architecture (`useState` internally invokes `useReducer` with a pre-defined value assignment reducer).

### Reducer Queue Processing
When you dispatch an action via `dispatch(action)`:
1. React creates an **Update Object** `{ action, next: null }` and pushes it into the Fiber node's hook queue.
2. React schedules a re-render pass for the component.
3. During rendering, React loops through the queued actions sequentially, passing `(currentState, action)` to your reducer function:

$$\text{NextState} = \text{reducer}(\text{CurrentState}, \text{Action})$$

If the reducer returns a state reference that evaluates to `Object.is(oldState, newState) === true`, React **bails out** of rendering child components early, saving CPU cycles.

---

## 2. Real-World Engineering Scenario

**Scenario**: Multi-Step Checkout Wizard / Complex State Machine with Undo/Redo Capability.
When building a complex checkout pipeline (Cart -> Shipping Address -> Payment Gateway -> Order Confirmation), state transitions depend on previous state decisions, validation checks, and rollback history. Managing 10 separate `useState` variables creates state desynchronization bugs. `useReducer` consolidates state into an immutable, predictable state machine.

---

## 3. Production-Grade Code Example

```tsx
import React, { useReducer } from 'react';

// 1. State Schema
interface CheckoutState {
  step: 'cart' | 'shipping' | 'payment' | 'confirmation';
  itemsCount: number;
  shippingAddress: string;
  paymentMethod: 'card' | 'crypto' | 'paypal';
  isProcessing: boolean;
  errorMessage: string | null;
}

// 2. Action Tagged Unions (Discriminated Unions for 100% Type Safety)
type CheckoutAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_SHIPPING'; payload: string }
  | { type: 'SET_PAYMENT'; payload: 'card' | 'crypto' | 'paypal' }
  | { type: 'SUBMIT_PAYMENT_START' }
  | { type: 'SUBMIT_PAYMENT_SUCCESS' }
  | { type: 'SUBMIT_PAYMENT_FAILURE'; payload: string };

const initialState: CheckoutState = {
  step: 'cart',
  itemsCount: 3,
  shippingAddress: '',
  paymentMethod: 'card',
  isProcessing: false,
  errorMessage: null,
};

// 3. Pure Reducer Function
function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'NEXT_STEP':
      if (state.step === 'cart') return { ...state, step: 'shipping' };
      if (state.step === 'shipping' && state.shippingAddress.trim()) {
        return { ...state, step: 'payment', errorMessage: null };
      }
      if (state.step === 'shipping') {
        return { ...state, errorMessage: 'Shipping address is required.' };
      }
      return state;

    case 'PREV_STEP':
      if (state.step === 'shipping') return { ...state, step: 'cart' };
      if (state.step === 'payment') return { ...state, step: 'shipping' };
      return state;

    case 'SET_SHIPPING':
      return { ...state, shippingAddress: action.payload, errorMessage: null };

    case 'SET_PAYMENT':
      return { ...state, paymentMethod: action.payload };

    case 'SUBMIT_PAYMENT_START':
      return { ...state, isProcessing: true, errorMessage: null };

    case 'SUBMIT_PAYMENT_SUCCESS':
      return { ...state, isProcessing: false, step: 'confirmation' };

    case 'SUBMIT_PAYMENT_FAILURE':
      return { ...state, isProcessing: false, errorMessage: action.payload };

    default:
      return state;
  }
}

export function EnterpriseCheckoutWizard() {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  const handlePayment = async () => {
    dispatch({ type: 'SUBMIT_PAYMENT_START' });
    try {
      await new Promise((res) => setTimeout(res, 1500)); // Simulating payment API call
      dispatch({ type: 'SUBMIT_PAYMENT_SUCCESS' });
    } catch (e) {
      dispatch({ type: 'SUBMIT_PAYMENT_FAILURE', payload: 'Payment gateway declined transaction.' });
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-white max-w-md space-y-4">
      <div className="flex justify-between items-center text-xs text-slate-400">
        <span>Step: <b className="text-cyan-400 uppercase">{state.step}</b></span>
        <span>Items: {state.itemsCount}</span>
      </div>

      {state.errorMessage && (
        <div className="p-2 bg-rose-950/60 border border-rose-800 text-rose-400 text-xs rounded">
          {state.errorMessage}
        </div>
      )}

      {state.step === 'cart' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">Your cart contains 3 items ready for checkout.</p>
          <button
            onClick={() => dispatch({ type: 'NEXT_STEP' })}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-semibold"
          >
            Proceed to Shipping
          </button>
        </div>
      )}

      {state.step === 'shipping' && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter Shipping Address..."
            value={state.shippingAddress}
            onChange={(e) => dispatch({ type: 'SET_SHIPPING', payload: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => dispatch({ type: 'PREV_STEP' })}
              className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300"
            >
              Back
            </button>
            <button
              onClick={() => dispatch({ type: 'NEXT_STEP' })}
              className="w-1/2 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-semibold"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {state.step === 'payment' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">Select Payment Method:</p>
          <div className="grid grid-cols-3 gap-2">
            {(['card', 'crypto', 'paypal'] as const).map((method) => (
              <button
                key={method}
                onClick={() => dispatch({ type: 'SET_PAYMENT', payload: method })}
                className={`py-2 rounded text-xs capitalize font-mono border ${
                  state.paymentMethod === method
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
          <button
            disabled={state.isProcessing}
            onClick={handlePayment}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-semibold disabled:opacity-50"
          >
            {state.isProcessing ? 'Processing Transaction...' : 'Confirm & Pay Now'}
          </button>
        </div>
      )}

      {state.step === 'confirmation' && (
        <div className="text-center space-y-2 py-4">
          <span className="text-3xl">🎉</span>
          <h3 className="text-emerald-400 font-bold text-sm">Order Placed Successfully!</h3>
          <p className="text-xs text-slate-400">Shipping to: {state.shippingAddress}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Impure Reducers & Side Effects Inside Reducer Body
Reducers **must be pure functions**. Never perform side effects (`fetch()`, `localStorage.setItem()`, `Math.random()`, `new Date()`) inside the reducer.

```tsx
// ❌ WRONG: Side-effect in reducer
function badReducer(state, action) {
  if (action.type === 'SAVE') {
    localStorage.setItem('state', JSON.stringify(state)); // SIDE EFFECT! Breaks StrictMode & Time Travel debugging
  }
  return state;
}

// ✅ CORRECT: Keep reducer pure, trigger side effects in event handlers or useEffect
```

### ⚠️ Pitfall 2: Mutating State Draft directly
```tsx
// ❌ WRONG: Mutating state directly
function badReducer(state, action) {
  state.itemsCount += 1; // Mutation! Object reference is unchanged!
  return state;          // React skips re-render!
}

// ✅ CORRECT: Return fresh object copy
function goodReducer(state, action) {
  return { ...state, itemsCount: state.itemsCount + 1 };
}
```
