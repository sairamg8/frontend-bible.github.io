# ▲ Middleware: Edge Execution, Matchers & Request/Response Manipulation

## 1. Under-The-Hood Mechanics

`middleware.ts` (placed at the project root, or inside `src/`) runs **before** a request is matched to any route — at the Edge Runtime (a V8-isolate-based environment, not full Node.js), meaning it executes physically close to the requesting user, before the request even reaches a full server/serverless function.

```
Incoming Request
        │
        ▼
middleware.ts (Edge Runtime — V8 isolate, restricted API surface, low cold-start latency)
        │
        ├── NextResponse.next()          ──► continue to the matched route, unmodified
        ├── NextResponse.redirect(url)     ──► 30x redirect, request never reaches the route at all
        ├── NextResponse.rewrite(url)        ──► serve a DIFFERENT route's content, URL bar unchanged
        └── response.headers.set(...)          ──► mutate headers/cookies before the route even runs
```

### `matcher` Config: Scoping Middleware to Specific Paths
Without a `matcher`, middleware runs on **every single request** — including static assets and API routes that likely don't need it, adding latency to requests that gain nothing from it. The exported `config.matcher` (an array of path patterns) restricts execution to only the routes that actually need middleware logic (e.g. only `/dashboard/*` for an auth check, excluding `/api/*` and static files).

### `NextRequest`/`NextResponse`: Extended Web-Standard Primitives
Both extend the standard web `Request`/`Response` objects with Next-specific conveniences — `request.nextUrl` (a parsed URL object with `.pathname`/`.searchParams` already split out), `request.cookies.get()`/`response.cookies.set()` for typed cookie access without manually parsing the `Cookie` header string.

---

## 2. Real-World Engineering Scenario

**Scenario**: Geo-Based Pricing Redirect Combined With an Auth Gate, Without Slowing Down Every Request.
An app needs to (a) redirect EU visitors to a `/eu` pricing variant based on their detected country, and (b) block unauthenticated users from `/dashboard/*` — but neither concern should add latency to requests for static assets, marketing pages, or API routes that don't need either check. Middleware with a `matcher` scoped to exactly `['/pricing', '/dashboard/:path*']` runs the geo/auth logic only where relevant, executing at the Edge (physically close to the user) so the redirect/auth-check decision itself adds minimal latency even where it does run.

---

## 3. Production-Grade Code Example

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Geo-based rewrite for pricing — URL bar stays /pricing, content served differs
  if (pathname === '/pricing') {
    const country = request.headers.get('x-vercel-ip-country') ?? 'US';
    if (country === 'DE' || country === 'FR' || country === 'ES') {
      return NextResponse.rewrite(new URL('/pricing/eu', request.url));
    }
  }

  // Auth gate for the dashboard — redirect unauthenticated users, request never reaches the route
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('session_token');
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-request-id', crypto.randomUUID()); // propagate a trace id to the actual route
  return response;
}

export const config = {
  matcher: ['/pricing', '/dashboard/:path*'], // ONLY these paths pay the middleware execution cost
};
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: No `matcher`, Running Middleware on Every Static Asset Request
```typescript
// ❌ WRONG: without a matcher, this runs on EVERY request, including .js/.css/image assets
// that have nothing to do with auth or geo-redirects — pure added latency for no benefit
export function middleware(request: NextRequest) { /* ... */ }
// no config.matcher exported at all

// ✅ CORRECT: scope matcher to exactly the paths that need this logic
export const config = { matcher: ['/dashboard/:path*'] };
```

### ⚠️ Pitfall 2: Assuming Middleware Has Full Node.js API Access
```typescript
// ❌ WRONG: Edge Runtime doesn't support Node-specific APIs like `fs`, many `crypto` submodules,
// or most npm packages that assume a full Node environment — this throws at runtime, not build time
import fs from 'fs';
export function middleware() { fs.readFileSync('./config.json'); }

// ✅ CORRECT: Edge Runtime code must stick to Web-standard APIs (fetch, crypto.subtle, etc.) —
// verify any dependency used in middleware is Edge-compatible before relying on it
```

### ⚠️ Pitfall 3: Using `redirect()` When `rewrite()` Was the Actual Intent (or Vice Versa)
```typescript
// ❌ WRONG: redirect() changes the URL bar and triggers a NEW browser navigation/round-trip —
// for the geo-pricing case, this means the user's URL bar unexpectedly shows /pricing/eu,
// breaking any bookmark/share expectation that /pricing is the canonical, stable URL
return NextResponse.redirect(new URL('/pricing/eu', request.url));

// ✅ CORRECT: rewrite() serves different content at the SAME url-bar URL — what geo-personalization
// almost always actually wants; reserve redirect() for genuine navigation changes (like the auth gate)
return NextResponse.rewrite(new URL('/pricing/eu', request.url));
```
