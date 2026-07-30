# ⚛️ React Server Components (RSC) & Server Actions Architecture

## 1. Under-The-Hood Mechanics

React Server Components (RSC) represent a paradigm shift in modern full-stack web architecture.

```
                               SERVER ENVIRONMENT
                  ┌────────────────────────────────────────┐
                  │ • Direct Access to DB, FS, Secrets     │
                  │ • Executes Async Component Functions   │
                  │ • Zero-Bundle-Size Dependencies         │
                  └──────────────────┬─────────────────────┘
                                     │ Flight JSON Stream
                                     ▼
                               CLIENT ENVIRONMENT
                  ┌────────────────────────────────────────┐
                  │ • Interactive UI ('use client')        │
                  │ • Event Handlers & Local Hooks         │
                  │ • Hydrates RSC Flight Payload Tree     │
                  └────────────────────────────────────────┘
```

### Directives: `'use server'` vs `'use client'`
- `'use client'`: Marks a file as an entry point for the client component bundle. Any component imported below a `'use client'` boundary is bundled and sent to the browser.
- `'use server'`: Marks an async function or entire file as an exportable **Server Action** accessible programmatically from client forms or fetch calls.

### The Flight Serialization Engine
RSC does NOT send raw HTML or standard JSON over the wire. It uses the **Flight Protocol**—a stream of serialized React element instructions:

```
M1:{"id":"./src/ClientButton.js","name":"default","chunks":[]}
J0:["$","div",null,{"children":[["$","h1",null,{"children":"Server Title"}],["$","$L1",null,{"label":"Click Me"}]]}]
```

Flight Protocol allows React to stream dynamic server components into an existing client interactive tree without losing active input focus or client component state!

---

## 2. Real-World Engineering Scenario

**Scenario**: Multi-Tenant E-Commerce Product Detail Page with Heavy Markdown Engine & Direct Database Queries.
Rendering a product page requires querying PostgreSQL/Prisma, fetching customer reviews, and parsing Markdown descriptions using `remark`/`rehype`.
- Client Rendering: Sends 450 KB of parsing JS to the user's mobile browser, degrading **LCP (Largest Contentful Paint)**.
- RSC Architecture: Runs database queries and Markdown parsers on the server, sending **0 KB of parser JS** to the browser while maintaining sub-second streaming delivery.

---

## 3. Production-Grade Code Example

```tsx
// ==========================================
// FILE 1: serverActions.ts ('use server' file)
// ==========================================
'use server';

export async function submitProductReviewAction(prevState: any, formData: FormData) {
  const rating = formData.get('rating');
  const comment = formData.get('comment');

  // Direct database mutation on server
  await new Promise((res) => setTimeout(res, 1000));

  if (!comment || (comment as string).length < 5) {
    return { success: false, error: 'Review must be at least 5 characters long.' };
  }

  return { success: true, error: null };
}

// ==========================================
// FILE 2: ProductPageServer.tsx (RSC Server Component)
// ==========================================
import React, { Suspense } from 'react';
import { ReviewFormClient } from './ReviewFormClient';

async function fetchProductDetails(id: string) {
  // Direct DB access on Server
  await new Promise((res) => setTimeout(res, 500));
  return { id, title: 'Enterprise Workstation Pro', price: 2999 };
}

export async function ProductPageServer({ productId }: { productId: string }) {
  const product = await fetchProductDetails(productId);

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-white max-w-md space-y-4">
      <div className="border-b border-slate-800 pb-3">
        <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase">RSC Rendered</span>
        <h2 className="text-xl font-bold">{product.title}</h2>
        <p className="text-sm text-emerald-400 font-mono font-semibold">${product.price}</p>
      </div>

      <p className="text-xs text-slate-400">
        Direct database read executed on Server node with 0-kb client bundle footprint.
      </p>

      {/* Client Component Boundary nested inside RSC */}
      <ReviewFormClient productId={productId} />
    </div>
  );
}

// ==========================================
// FILE 3: ReviewFormClient.tsx ('use client' Boundary)
// ==========================================
'use client';

import React, { useActionState } from 'react';
import { submitProductReviewAction } from './serverActions';

export function ReviewFormClient({ productId }: { productId: string }) {
  const [state, formAction, isPending] = useActionState(submitProductReviewAction, {
    success: false,
    error: null,
  });

  return (
    <form action={formAction} className="space-y-3 pt-2">
      <h4 className="text-xs font-bold text-slate-300">Submit Review (Server Action)</h4>
      
      {state.error && (
        <p className="text-xs text-rose-400 bg-rose-950/60 p-2 rounded border border-rose-800">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="text-xs text-emerald-400 bg-emerald-950/60 p-2 rounded border border-emerald-800">
          Review saved to database!
        </p>
      )}

      <textarea
        name="comment"
        placeholder="Write customer review..."
        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-500"
        rows={3}
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-semibold disabled:opacity-50"
      >
        {isPending ? 'Saving to Database...' : 'Submit Review'}
      </button>
    </form>
  );
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Passing Non-Serializable Props Across Server/Client Boundary
You **cannot** pass non-serializable JavaScript objects (functions, class instances, Symbols) from a Server Component to a Client Component prop slot.

```tsx
// ❌ FATAL RSC BUG: Passing function prop from Server to Client
export async function ServerPage() {
  const handleClick = () => console.log('Server function'); // CANNOT BE SERIALIZED!
  return <ClientButton onClick={handleClick} />; // CRASH! Flight Serialization Error!
}

// ✅ FIX: Pass Server Actions or serializable data/children props
```

### ⚠️ Pitfall 2: Accidental Client Bundle Bloat
If you import a heavy server utility library (like `prisma` or `fs`) inside a file tagged with `'use client'`, Webpack/Vite will attempt to bundle it for the browser, crashing the build! Use the `server-only` build check package to enforce server isolation:

```ts
import 'server-only'; // Throws build error if accidentally imported in Client Component
```
