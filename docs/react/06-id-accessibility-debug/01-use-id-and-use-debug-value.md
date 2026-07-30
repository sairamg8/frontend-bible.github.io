# ⚛️ `useId` & `useDebugValue`: Accessibility & DevTools Mechanics

## 1. Under-The-Hood Mechanics

### `useId` (Hydration-Safe ID Generation)
Generating unique DOM element IDs in server-rendered applications introduces a critical challenge: if the server generates `id="id-1"` while the client generates `id="id-2"`, the initial client hydration pass fails with a **Hydration Mismatch Warning**.

`useId` generates a **stable string containing a tree position prefix**:
```
:r0:
:r1:
:r2:
```
React derives this string from the component's **parent-child position in the Fiber tree**. Because the Fiber tree structure is identical on server and client, `useId` guarantees 100% hydration-safe matching IDs.

### `useDebugValue`
`useDebugValue` attaches custom inspector labels to custom hooks inside **React Developer Tools**.

---

## 2. Real-World Engineering Scenario

**Scenario**: WCAG AAA Accessible Form Control Component Library & Custom Hook Telemetry.
When building enterprise form components (Input fields, Dropdown lists, Comboboxes), every `<label>` must bind to its `<input>` via matching `htmlFor` and `id` attributes for screen reader accessibility.

---

## 3. Production-Grade Code Example

```tsx
import React, { useId, useState, useDebugValue } from 'react';

// Custom Hook with DevTools Formatting
export function useNetworkState() {
  const [isOnline, setIsOnline] = useState(true);

  // Formats inspector label inside React DevTools
  useDebugValue(isOnline ? 'Online (Stable)' : 'Offline (Disconnected)');

  return isOnline;
}

export function AccessibleFormField({ label, type = 'text' }: { label: string; type?: string }) {
  // 1. Generate hydration-safe unique ID
  const id = useId();
  const helpTextId = `${id}-help`;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        aria-describedby={helpTextId}
        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <p id={helpTextId} className="text-[10px] text-slate-500">
        Required field for WCAG AAA accessibility compliance.
      </p>
    </div>
  );
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Generating Keys in Rendered Lists
`useId` should **NEVER** be used to generate `key` props for items in a mapped array (`list.map(item => <div key={useId()} />)`).
- **Symptom**: Destroys component DOM state on list re-orders.
- **Solution**: Use database IDs (`item.id`) for list key props.
