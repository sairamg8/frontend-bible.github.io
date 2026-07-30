# ⚛️ React 19 `useFormStatus` & `React.use()`: Modular Forms & Resource Unwrapping

## 1. Under-The-Hood Mechanics

### `useFormStatus` (Form Context Subscription)
Before React 19, if a submit button or spinner was nested deeply inside a form component, you had to drill `isSubmitting` props down through every child component level.

`useFormStatus` subscribes directly to the **parent HTML `<form>` status** using React's internal Form Context. It exposes:
- `pending`: Boolean indicating if the parent form is currently executing an async action.
- `data`: `FormData` object being submitted.
- `method`: HTTP method (`GET` / `POST`).
- `action`: Reference to the action function.

### `React.use()` (Conditional Resource Operator)
`React.use()` is React 19's universal API for unwrapping Promises and Context conditionally inside component render cycles.

```
React.use(Promise)   ──► If Pending: Suspends component -> Nearest <Suspense> fallback renders
                     ──► If Resolved: Unwraps data directly
                     ──► If Rejected: Throws error -> Nearest <ErrorBoundary> handles it
```

Unlike traditional hooks, `use()` can be called inside `if` statements, `switch` blocks, and `for` loops!

---

## 2. Real-World Engineering Scenario

**Scenario**: Enterprise Modular Design System Submit Buttons + Dynamic Permission Loader.
1. **Design System**: Building a reusable `<SubmitButton />` component used across 50 forms in an enterprise application without passing `loading` props.
2. **Permission Loader**: Loading role-based access control (RBAC) permissions dynamically when an admin user opens a security panel.

---

## 3. Production-Grade Code Example

```tsx
import React, { use, Suspense, useFormStatus } from 'react';

// ==========================================
// PART 1: Reusable Design System Submit Button using useFormStatus
// ==========================================
export function DesignSystemSubmitButton({ label }: { label: string }) {
  // Subscribes directly to PARENT <form> status!
  const { pending, data } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded font-semibold text-xs transition flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Submitting Action...</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}

// ==========================================
// PART 2: Conditional Promise Unwrapping using React.use()
// ==========================================
interface SecurityPermissions {
  canDeleteUsers: boolean;
  canExportLogs: boolean;
}

function fetchUserPermissions(): Promise<SecurityPermissions> {
  return new Promise((res) =>
    setTimeout(() => res({ canDeleteUsers: true, canExportLogs: false }), 1000)
  );
}

// Cached Promise instance to prevent infinite loop
const permissionsPromise = fetchUserPermissions();

export function SecurityAdminPanel({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl text-white max-w-sm space-y-4">
      <h3 className="font-bold text-sm text-cyan-400">Enterprise Security Panel</h3>

      {/* Form using native React 19 action and modular submit button */}
      <form
        action={async (formData) => {
          await new Promise((res) => setTimeout(res, 1500));
          alert(`Form submitted! Key: ${formData.get('apiKey')}`);
        }}
        className="space-y-3"
      >
        <input
          name="apiKey"
          type="text"
          placeholder="Enter API Secret Key..."
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-500"
          required
        />
        {/* Child button reads parent form status automatically */}
        <DesignSystemSubmitButton label="Update System Key" />
      </form>

      {/* Conditional Promise Unwrapping via React.use() inside Suspense */}
      {isAdmin && (
        <Suspense fallback={<p className="text-xs text-amber-400 animate-pulse">Verifying RBAC permissions...</p>}>
          <PermissionDetails promise={permissionsPromise} />
        </Suspense>
      )}
    </div>
  );
}

function PermissionDetails({ promise }: { promise: Promise<SecurityPermissions> }) {
  // Unwraps Promise directly inside component render body!
  const permissions = use(promise);

  return (
    <div className="p-3 bg-slate-800 rounded text-xs space-y-1 font-mono border border-slate-700">
      <p className="text-slate-400 font-bold">RBAC Entitlements:</p>
      <p className={permissions.canDeleteUsers ? 'text-emerald-400' : 'text-rose-400'}>
        • Delete Users: {permissions.canDeleteUsers ? 'ALLOWED' : 'DENIED'}
      </p>
      <p className={permissions.canExportLogs ? 'text-emerald-400' : 'text-rose-400'}>
        • Export Logs: {permissions.canExportLogs ? 'ALLOWED' : 'DENIED'}
      </p>
    </div>
  );
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Calling `useFormStatus` in the Same Component that Renders `<form>`
`useFormStatus` **only reads parent forms above it in the DOM tree**. If you call `useFormStatus` inside the component that renders the `<form>` tag itself, it will return `{ pending: false, data: null }`!

```tsx
// ❌ WRONG: Calling inside form container component
function BadFormContainer() {
  const { pending } = useFormStatus(); // ALWAYS FALSE! It is NOT a child of <form>!
  return (
    <form action={myAction}>
      <button disabled={pending}>Submit</button>
    </form>
  );
}

// ✅ CORRECT: Move button to a CHILD component inside <form>
function GoodFormContainer() {
  return (
    <form action={myAction}>
      <DesignSystemSubmitButton label="Submit" /> {/* Works perfectly! */}
    </form>
  );
}
```

### ⚠️ Pitfall 2: Infinite Suspense Loops with `React.use()`
If you pass an un-memoized inline promise into `use(promise)`, every render creates a brand new Promise, causing an **infinite Suspense loading loop**.

```tsx
// ❌ FATAL BUG: Inline promise instantiation
function BadComponent() {
  const data = use(fetchData()); // NEW PROMISE CREATED EVERY RENDER! Suspends forever!
}

// ✅ CORRECT: Pass cached Promise from props, useMemo, or module scope
const dataPromise = fetchData(); // Cached Promise
```
