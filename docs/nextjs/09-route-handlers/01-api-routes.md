# ▲ Route Handlers: `route.ts` Conventions & Caching Behavior

## 1. Under-The-Hood Mechanics

A `route.ts` file exports functions named after HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`), each receiving a web-standard `NextRequest` and returning a web-standard `Response` (or `NextResponse`) — the App Router's direct replacement for Pages Router API routes, built on Web Fetch API primitives rather than Node's `req`/`res`.

```
app/api/products/route.ts
        │
        ├── export async function GET(request: NextRequest)   ──► handles GET /api/products
        ├── export async function POST(request: NextRequest)    ──► handles POST /api/products
        └── (PUT/DELETE/PATCH similarly — only define the verbs actually needed)

app/api/products/[id]/route.ts
        └── export async function GET(request, { params })    ──► params: Promise<{ id: string }>
```

### Static vs Dynamic Route Handler Caching
A `GET` Route Handler with **no** dynamic APIs used (no `request.nextUrl.searchParams` read, no `cookies()`/`headers()`) and no non-GET-verb siblings can be **statically evaluated at build time** and cached, just like a page — genuinely serving a fixed JSON response from cache rather than re-executing the function per request. The moment it reads a dynamic input (a search param, a cookie) or the segment also exports a `POST`/`PUT`/etc., it becomes dynamic — evaluated fresh, per request.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Public, Rarely-Changing Config Endpoint vs a Search Endpoint That Must Never Cache.
A `/api/feature-flags` endpoint returns the same JSON for every request until the next deploy — an ideal candidate for static Route Handler caching, since re-executing it per request is pure wasted compute for output that never varies. A `/api/search?q=...` endpoint, by contrast, must read `searchParams` and return genuinely per-query results — reading the dynamic search param automatically and correctly opts this handler into dynamic, per-request execution, with zero explicit configuration needed to achieve that correctness.

---

## 3. Production-Grade Code Example

```typescript
// app/api/feature-flags/route.ts — STATIC: no dynamic API usage, cached like a static page
export async function GET() {
  const flags = await fetch('https://config.acme.com/flags').then((r) => r.json());
  return Response.json(flags); // this whole handler's OUTPUT can be cached at build/ISR time
}
```

```typescript
// app/api/search/route.ts — DYNAMIC: reading searchParams forces per-request execution
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q'); // reading this ⇒ automatically dynamic
  if (!query) {
    return Response.json({ error: 'Missing query parameter "q"' }, { status: 400 });
  }
  const results = await searchDatabase(query);
  return Response.json(results);
}
```

```typescript
// app/api/products/[id]/route.ts — dynamic segment + multiple HTTP verbs in one file
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return new Response('Not Found', { status: 404 });
  return Response.json(product);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteProduct(id);
  return new Response(null, { status: 204 });
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Assuming a Route Handler Executes Per-Request by Default
```typescript
// ❌ MISUNDERSTANDING: this GET handler has no dynamic API usage — it gets STATICALLY cached
// at build time. Any code implicitly relying on it re-running fresh every request (e.g. logging
// "handled a request" as a side effect for observability) will NOT actually fire on every hit
export async function GET() {
  console.log('handling request'); // only logs at BUILD time (or ISR revalidation), not per visitor!
  return Response.json({ status: 'ok' });
}

// ✅ CORRECT: if per-request execution is required, force it explicitly
export const dynamic = 'force-dynamic'; // or read a dynamic API (cookies/headers/searchParams)
```

### ⚠️ Pitfall 2: Forgetting `params` Is a Promise in Recent Next.js Versions
```typescript
// ❌ WRONG (breaks in current versions): treating params as a plain synchronous object
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id; // TypeError/incorrect typing — params is a Promise now
}

// ✅ CORRECT: await it, matching the Promise-based params contract
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### ⚠️ Pitfall 3: Returning a Plain Object Instead of Using `Response.json()`/`NextResponse.json()`
```typescript
// ❌ WRONG: Route Handlers must return an actual Response object — a bare object isn't
// a valid return value and causes a runtime type error, unlike Pages Router's res.json(data)
export async function GET() {
  return { status: 'ok' }; // NOT a Response — invalid
}

// ✅ CORRECT: always construct a real Response (Response.json is the concise built-in helper)
export async function GET() {
  return Response.json({ status: 'ok' });
}
```
