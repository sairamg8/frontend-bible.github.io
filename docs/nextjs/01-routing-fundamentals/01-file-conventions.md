# ▲ App Router File Conventions: page, layout, template, loading, error, not-found, route

## 1. Under-The-Hood Mechanics

The App Router maps a **folder hierarchy** in `app/` directly to URL segments, with a small set of reserved filenames each contributing a specific, composable role to that segment's rendered output — not one monolithic "page component" per route, but a **layered composition**.

```
app/dashboard/
  layout.tsx     ──► persists across navigations WITHIN dashboard/*, wraps children
  template.tsx    ──► same wrapping role as layout, but REMOUNTS on every navigation
  loading.tsx      ──► auto Suspense fallback, shown while page.tsx's async work is pending
  error.tsx          ──► auto Error Boundary, catches errors thrown by page.tsx/children
  not-found.tsx        ──► rendered on notFound() call, or an unmatched nested segment
  page.tsx               ──► the actual routable UI for /dashboard
  route.ts                 ──► API endpoint for /dashboard — MUTUALLY EXCLUSIVE with page.tsx in the same segment
```

### Composition Order
For a request to `/dashboard`, Next.js composes (conceptually): `layout.tsx( loading.tsx-wrapped-Suspense( error.tsx-wrapped-ErrorBoundary( page.tsx ) ) )`. This nesting is why `loading.tsx` and `error.tsx` are **automatic** — you don't manually wrap `<Suspense>`/error boundaries around each page; the file's mere presence in the segment wires it in.

### `layout.tsx` vs `template.tsx`: State Persistence vs Remounting
Both wrap child segments identically in terms of position in the tree, but `layout.tsx` **persists** its own React state and DOM across sibling navigations within it (e.g. a sidebar's scroll position survives clicking between dashboard sub-pages), while `template.tsx` **remounts entirely** on every navigation — appropriate specifically when you want fresh state or a re-triggered enter animation on every single navigation, even between visually similar pages.

### `error.tsx` Must Be a Client Component
Error boundaries fundamentally require a class component's `componentDidCatch` lifecycle (or React's error boundary primitives), which only exist in the client runtime — `error.tsx` always requires `'use client'` at the top, and receives `error` and a `reset()` function (to attempt re-rendering the segment without a full page reload) as props.

### `route.ts` Cannot Coexist With `page.tsx` in the Same Segment
A segment is either a **page** (returns JSX/HTML) or a **Route Handler** (returns an HTTP `Response`, functioning as an API endpoint) — never both, since both would compete to define what a request to that exact path returns.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Multi-Tab Dashboard Where Sidebar State Must Survive Tab Switches, But a Wizard Flow Must Reset Fully Between Steps.
The main dashboard shell (persistent sidebar navigation, a "currently expanded" state in a tree view) uses `layout.tsx` — switching between `/dashboard/reports` and `/dashboard/settings` keeps the sidebar's expanded/collapsed state and scroll position intact, since the layout never remounts. A separate onboarding wizard at `/onboarding/[step]` uses `template.tsx` instead — each step should visually reset (fade-in animation replaying, any local form step-state cleared) even though steps share the same wrapping chrome, which `template.tsx`'s remount-per-navigation behavior provides for free.

---

## 3. Production-Grade Code Example

```tsx
// app/dashboard/layout.tsx — persists sidebar state across dashboard navigations
'use client';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true); // survives navigating between dashboard pages
  return (
    <div className="flex">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded((v) => !v)} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

```tsx
// app/dashboard/loading.tsx — automatic Suspense fallback while page.tsx's async data resolves
export default function DashboardLoading() {
  return <div className="animate-pulse p-6">Loading dashboard…</div>;
}
```

```tsx
// app/dashboard/error.tsx — automatic error boundary; MUST be a Client Component
'use client';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-6 text-rose-400">
      <p>Something went wrong loading the dashboard.</p>
      <button onClick={() => reset()} className="mt-2 px-3 py-1 bg-slate-800 rounded text-xs">
        Try again
      </button>
    </div>
  );
}
```

```tsx
// app/dashboard/page.tsx — the actual routed UI; async Server Component
async function getDashboardData() {
  const res = await fetch('https://api.acme.com/dashboard');
  if (!res.ok) throw new Error('Failed to load dashboard'); // caught by error.tsx above
  return res.json();
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardView data={data} />;
}
```

```typescript
// app/dashboard/route.ts — would CONFLICT if placed alongside page.tsx above in the same segment
// (shown here as if in a DIFFERENT segment, e.g. app/api/dashboard/route.ts)
export async function GET() {
  return Response.json({ status: 'ok' });
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Placing `route.ts` and `page.tsx` in the Same Segment
```
❌ WRONG — Next.js throws a build error: "You cannot have two parallel pages that resolve to the same path"
app/products/page.tsx
app/products/route.ts

✅ CORRECT — separate the API endpoint into its own path
app/products/page.tsx
app/api/products/route.ts
```

### ⚠️ Pitfall 2: Forgetting `error.tsx` Only Catches Errors in Its Own Segment and Below
An error thrown inside `layout.tsx` itself is **not** caught by that same segment's `error.tsx` — a layout's error must be caught by the **nearest parent** segment's `error.tsx` (or `global-error.tsx` at the root). Placing critical data-fetching logic inside a layout rather than its child page can leave errors uncaught by the boundary an engineer assumed was protecting it.

### ⚠️ Pitfall 3: Expecting `template.tsx` to Behave Like `layout.tsx` for Expensive Children
Because `template.tsx` remounts on every navigation, any expensive child work (a heavy chart re-initializing, a WebSocket reconnecting) inside a template re-executes on every single route change within it — using `template.tsx` where `layout.tsx`'s persistence was actually needed causes visible flicker and wasted re-initialization work that a plain `layout.tsx` would have avoided entirely.
