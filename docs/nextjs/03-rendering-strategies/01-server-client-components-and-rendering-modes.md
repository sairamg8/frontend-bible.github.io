# ▲ Rendering Strategies: Server/Client Components & Static/Dynamic/Streaming Modes

## 1. Under-The-Hood Mechanics

Every component in the App Router is a **Server Component by default** — a fundamentally different execution model from the client-only React apps most engineers' mental model was built on.

```
Server Component (default)
  │  - runs ONLY on the server, ZERO JS shipped to the client for this component
  │  - can be `async`, directly await a database call/fs read
  │  - CANNOT use useState/useEffect/browser APIs/event handlers
  ▼
'use client' boundary
  │  - marks a component AND everything it imports as CLIENT Components
  │  - the boundary is NOT per-component — it propagates down through the import tree
  ▼
Client Component
     - hydrated in the browser, can use hooks/state/events/browser APIs
     - CAN receive Server Components as `children`/props (composition, not import)
```

### The Composition Pattern: Passing Server Components INTO Client Components
A Client Component cannot `import` and render a Server Component directly (since the client bundle can't execute server-only code) — but it **can** accept one as `children` or a prop, because in that case the Server Component is rendered by its own parent (still on the server) and only the **already-rendered result** (serialized RSC output) is handed to the client boundary as a slot to place — the client component itself never needs to know how to render it.

### Static vs Dynamic Rendering
A route renders **statically** (pre-rendered once at build time, served from the Full Route Cache) by default — until something forces it dynamic: calling `cookies()`, `headers()`, reading `searchParams`, or a `fetch()` call with `{ cache: 'no-store' }`. Any of these signal "this output genuinely depends on the incoming request," and Next.js switches that route to per-request Dynamic Rendering. On Next.js 15+, this list effectively also includes any **bare, uncached `fetch()`** — since caching is opt-in now rather than the default, an un-opted-in fetch has the same request-dependent, dynamic-forcing effect that `{ cache: 'no-store' }` had explicitly in Next 13/14.

### Streaming: Progressive HTML via Suspense
Wrapping a slow data-dependent subtree in `<Suspense fallback={...}>` lets Next.js send the **rest** of the page's HTML immediately, with the slow subtree's HTML streamed in **later**, in the same response, once its data resolves — improving Time To First Byte for everything that *isn't* behind the slow boundary, without needing a fully client-side loading spinner pattern.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Product Page With a Fast Static Shell and a Slow, Personalized Recommendations Section.
The product page's core content (title, price, images) is static and cacheable — every visitor sees the same thing. A "recommended for you" section requires a per-user, personalized API call that takes 800ms. Rendering the whole page as Dynamic (because of that one section) would slow down the ENTIRE page for every visitor. Instead, the core content stays in a Server Component with static rendering, while the recommendations section is a separate async Server Component wrapped in its own `<Suspense>` boundary — the page's fast shell streams immediately, and the recommendations section's HTML streams in a moment later, without blocking anything else.

---

## 3. Production-Grade Code Example

```tsx
// app/products/[id]/page.tsx — mostly static, with ONE deliberately-isolated dynamic/slow section
import { Suspense } from 'react';

async function getProduct(id: string) {
  // Next.js 15+: fetch() is UNCACHED by default — cache: 'force-cache' must be requested explicitly
  // to get the static, shared-across-all-visitors, ISR-cached behavior described below
  const res = await fetch(`https://api.acme.com/products/${id}`, { cache: 'force-cache' });
  return res.json();
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id); // static — doesn't force this route dynamic

  return (
    <div>
      <ProductHero product={product} /> {/* fast, static, streams immediately */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <PersonalizedRecommendations productId={id} /> {/* slow, streamed in separately */}
      </Suspense>
    </div>
  );
}

async function PersonalizedRecommendations({ productId }: { productId: string }) {
  const { cookies } = await import('next/headers');
  const userId = (await cookies()).get('userId')?.value; // reading cookies() ⇒ makes THIS subtree dynamic only
  const res = await fetch(`https://api.acme.com/recommendations?user=${userId}&product=${productId}`, {
    cache: 'no-store', // explicitly per-request — personalized, never cached
  });
  const items = await res.json();
  return <RecommendationsList items={items} />;
}
```

```tsx
// components/LikeButton.tsx — a Client Component receiving a Server Component via composition
'use client';
import { useState } from 'react';

export function LikeButton({ initialLikes, children }: { initialLikes: number; children: React.ReactNode }) {
  const [likes, setLikes] = useState(initialLikes);
  return (
    <div>
      {children} {/* a Server Component, rendered by ITS OWN parent, just slotted in here */}
      <button onClick={() => setLikes((l) => l + 1)}>❤️ {likes}</button>
    </div>
  );
}
```

```tsx
// app/products/[id]/page.tsx — composing: passing a Server Component INTO a Client Component
import { LikeButton } from '../../../components/LikeButton';
import { ProductSpecs } from '../../../components/ProductSpecs'; // a Server Component

export default async function Page() {
  return (
    <LikeButton initialLikes={42}>
      <ProductSpecs /> {/* still rendered on the server — LikeButton just places the result */}
    </LikeButton>
  );
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Importing a Server Component Directly Into a Client Component
```tsx
// ❌ WRONG: 'use client' propagates to everything IMPORTED — ProductSpecs becomes a client
// component too, losing its server-only capabilities (direct DB access, zero client JS)
'use client';
import { ProductSpecs } from './ProductSpecs'; // now forced client, even if it never uses hooks
function Wrapper() { return <ProductSpecs />; }

// ✅ CORRECT: pass it as children/props from a SERVER parent instead — composition, not import
```

### ⚠️ Pitfall 2: One `cookies()`/`headers()` Call Making the ENTIRE Route Dynamic
Calling `cookies()` at the top level of `page.tsx` (rather than isolated inside a nested async component wrapped in its own `<Suspense>`, as shown above) opts the **whole route** out of static rendering — even the parts that have nothing to do with cookies. Push dynamic data reads as deep into the component tree as possible, isolated behind their own Suspense boundary, to keep the rest of the page statically cacheable.

### ⚠️ Pitfall 3: Assuming Static Rendering Means "Never Updates"
Static rendering means "pre-rendered once, served from cache" — it does NOT mean the content is frozen forever. Time-based (`next: { revalidate: N }`) or on-demand (`revalidateTag`/`revalidatePath`, typically called from a Server Action after a mutation) revalidation both refresh a statically-rendered route's cached output without ever making it "dynamic" in the per-request sense — conflating "static" with "never updates" leads to unnecessarily reaching for Dynamic Rendering when ISR would have served the same freshness requirement with far better cache-hit performance.
