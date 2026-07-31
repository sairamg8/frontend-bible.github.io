# ▲ Data Fetching: The Extended `fetch()` API & Fetching Patterns

## 1. Under-The-Hood Mechanics

Next.js patches the global `fetch()` inside Server Components with extra, Next-specific options that hook directly into its caching architecture (see [caching architecture](../06-caching-architecture/01-the-four-layers.md)) — the same web-standard `fetch()` call, with semantics no other framework's `fetch` carries.

```typescript
fetch(url, {
  cache: 'force-cache' | 'no-store',     // opt into a cached response vs always-fresh, per-request data
  next: {
    revalidate: 3600,                       // time-based ISR — re-fetch in the background after N seconds
    tags: ['product-123'],                    // on-demand invalidation via revalidateTag('product-123')
  },
})
```

> **Next.js 15+ default changed:** `fetch()` requests are **uncached by default** (`no-store`-equivalent semantics) — this is a reversal of the Next 13/14 behavior, where `fetch()` was cached (`force-cache`) unless told otherwise. On Next 15+, caching is now something you **opt into** explicitly via `cache: 'force-cache'` or `next: { revalidate: ... }` (setting `revalidate` also opts a request into the Data Cache). Code written against pre-15 tutorials that assumes bare `fetch()` calls are cached will silently become fully dynamic on upgrade.

### Request Memoization: Automatic, Per-Render Deduplication
If the **exact same** `fetch()` call (same URL + options) is made from multiple components during a single render pass (e.g. both a layout and a nested page independently need the current user's profile), Next.js automatically deduplicates them into a **single** actual network request — this is why fetching the same data from multiple places in the component tree isn't a performance anti-pattern the way it would be in a client-only app; it's specifically designed to be safe.

### `generateStaticParams()`: Build-Time Path Pre-Rendering
The App Router's replacement for `getStaticPaths` — an exported async function returning an array of param objects, each one causing Next.js to pre-render that specific dynamic route at build time (e.g. every product ID known at build time gets its own static HTML page generated upfront).

### Parallel vs Sequential Fetching
```typescript
// Sequential (a waterfall) — the SECOND fetch cannot start until the FIRST resolves
const user = await getUser(id);
const posts = await getPostsByUser(user.id); // must wait for `user` first — INTENTIONAL here

// Parallel — BOTH fetches start immediately, total time ≈ max(fetchA, fetchB), not sum
const [user, settings] = await Promise.all([getUser(id), getSettings(id)]); // independent data
```
The distinction matters because an accidental sequential waterfall (awaiting one fetch before even *starting* an unrelated second one) doubles latency for data that never actually depended on each other.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Product Page Needing Both Product Details and Inventory Status, Independently.
Product details and inventory status come from two entirely separate backend services with no dependency between them — yet an earlier implementation awaited the product details fetch before even starting the inventory fetch, adding an unnecessary ~300ms of pure waterfall latency for data that could have been fetched concurrently. Restructuring to kick off both fetches via `Promise.all` before awaiting either cut the page's server-side data-fetching time roughly in half, since the two now overlap instead of stacking.

---

## 3. Production-Grade Code Example

```tsx
// app/products/[id]/page.tsx — parallel fetching, tag-based revalidation, and generateStaticParams
export async function generateStaticParams() {
  const products = await fetch('https://api.acme.com/products/ids').then((r) => r.json());
  return products.map((p: { id: string }) => ({ id: p.id })); // pre-renders EVERY product page at build time
}

async function getProduct(id: string) {
  const res = await fetch(`https://api.acme.com/products/${id}`, {
    next: { tags: [`product-${id}`], revalidate: 3600 }, // time-based AND tag-based revalidation together
  });
  return res.json();
}

async function getInventory(id: string) {
  const res = await fetch(`https://api.acme.com/inventory/${id}`, {
    cache: 'no-store', // always fresh — stock levels shouldn't be cached even briefly
  });
  return res.json();
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // PARALLEL: both requests fire immediately, neither depends on the other
  const [product, inventory] = await Promise.all([getProduct(id), getInventory(id)]);

  return <ProductView product={product} inStock={inventory.quantity > 0} />;
}
```

```tsx
// A layout ALSO fetching the same product data — automatically deduplicated with the page's fetch above
// app/products/[id]/layout.tsx
async function getProduct(id: string) {
  // IDENTICAL url + options as the page's call — Next.js coalesces these into ONE network request
  const res = await fetch(`https://api.acme.com/products/${id}`, {
    next: { tags: [`product-${id}`], revalidate: 3600 },
  });
  return res.json();
}

export default async function ProductLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id); // deduplicated against the page's identical fetch, NOT a second request
  return (
    <div>
      <Breadcrumb category={product.category} />
      {children}
    </div>
  );
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Accidental Sequential Waterfalls From Independent Data
```tsx
// ❌ WRONG: getInventory doesn't depend on `product` at all, but awaiting sequentially still
// makes the total wait = getProduct's time + getInventory's time, needlessly
const product = await getProduct(id);
const inventory = await getInventory(id);

// ✅ CORRECT: start both immediately, total wait = max(both), not the sum
const [product, inventory] = await Promise.all([getProduct(id), getInventory(id)]);
```

### ⚠️ Pitfall 2: Assuming Request Memoization Applies Across Different Requests
Request memoization only dedupes identical `fetch()` calls **within a single render pass of a single incoming request** — it does NOT persist across different users' requests or different page loads (that's what the Data Cache, a separate layer, is for). Expecting one user's fetch to warm a memoization cache for a different user's subsequent request is a fundamental misunderstanding of which caching layer does what.

### ⚠️ Pitfall 3: Forgetting That Non-Identical Fetch Options Defeat Deduplication
```typescript
// ❌ WRONG: these look like "the same data" but differ in the options OBJECT's shape —
// Next.js compares the fetch call's actual serialized inputs, so these do NOT deduplicate
fetch(url, { next: { tags: ['product'] } });
fetch(url, { next: { tags: ['product'], revalidate: 3600 } }); // different options ⇒ treated as a DIFFERENT request

// ✅ CORRECT: keep fetch call signatures byte-for-byte identical across components that should share one request
```

### ⚠️ Pitfall 4: Assuming Bare `fetch()` Is Still Cached by Default (Next 15+)
```typescript
// ❌ WRONG on Next 15+: no cache option, no next.revalidate/tags — this is a fully DYNAMIC,
// per-request fetch now, not a cached/static one, even though it looks identical to old Next 13/14 code
async function getProduct(id: string) {
  const res = await fetch(`https://api.acme.com/products/${id}`);
  return res.json();
}

// ✅ CORRECT: caching is opt-in on Next 15+ — be explicit about which behavior you want
async function getProduct(id: string) {
  const res = await fetch(`https://api.acme.com/products/${id}`, {
    next: { revalidate: 3600, tags: [`product-${id}`] }, // explicitly opts into the Data Cache
  });
  return res.json();
}
```
