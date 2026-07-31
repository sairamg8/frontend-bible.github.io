# ▲ Configuration: `next.config.js` Key Options

## 1. Under-The-Hood Mechanics

`next.config.js` (or `.mjs`/`.ts`) is read at build/dev-server start time, configuring framework-level behavior that applies **before** any individual route's own code runs — URL rewriting, header injection, image domain allow-listing, and the overall build output shape.

```
next.config.js
        │
        ├── redirects() / rewrites() / headers()   ──► async functions returning arrays of rules,
        │                                                  evaluated once at build/start, checked per-request
        ├── images: { remotePatterns, formats }        ──► which external image hosts next/image may
        │                                                     optimize, and which output formats to negotiate
        └── output: 'standalone' | 'export'                ──► fundamentally changes what `next build` produces
```

### `redirects()`/`rewrites()`/`headers()`: Framework-Level, Not Per-Route
These apply globally, evaluated before Next.js even matches a request to a specific route — useful for URL structure changes (old-path → new-path redirects after a rename) or security headers (CSP, `X-Frame-Options`) that should apply site-wide without needing to be repeated in every route/middleware.

### `images` Config: An Explicit Allowlist for Remote Optimization
`next/image` will only apply its automatic resizing/format-negotiation to remote (non-local) image URLs whose host matches an explicitly configured `remotePatterns` entry — a deliberate security boundary preventing the image optimization endpoint from being used as an open proxy/resizing service for arbitrary attacker-supplied URLs.

### `output` Modes: Fundamentally Different Build Artifacts
- **`standalone`** — produces a minimal, self-contained Node.js server bundle (only the exact dependencies actually used, traced automatically) — ideal for containerized deployments (Docker) where a lean image matters.
- **`export`** — produces **fully static HTML/CSS/JS files**, no Node server at all — appropriate only for apps with no server-side rendering/API routes/Server Actions requirements (since none of those exist at request time in a static export), suitable for pure static hosting (a CDN, GitHub Pages).

---

## 2. Real-World Engineering Scenario

**Scenario**: A Site Migrating Its URL Structure While Serving User-Uploaded Images From a CDN.
A site renamed `/blog/*` to `/articles/*` and must not break existing external links/bookmarks/search rankings — `redirects()` with `permanent: true` (a real HTTP 308, telling search engines to update their index) handles this at the framework level, without needing route-level logic in every affected page. Separately, the site displays user-uploaded profile images hosted on a third-party CDN (`https://cdn.usercontent.acme.com`) — `images.remotePatterns` must explicitly allow that specific host, or `next/image` refuses to optimize (and by default, even render) images from it.

---

## 3. Production-Grade Code Example

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/blog/:slug', destination: '/articles/:slug', permanent: true }, // 308, SEO-preserving
    ];
  },

  async rewrites() {
    return [
      { source: '/api/legacy/:path*', destination: 'https://legacy-api.acme.com/:path*' }, // proxy without CORS
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "default-src 'self'" },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.usercontent.acme.com', pathname: '/uploads/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  output: 'standalone', // minimal, containerizable Node server — traces only actually-used dependencies
};

module.exports = nextConfig;
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Using `output: 'export'` With Server Actions or Dynamic Route Handlers
```javascript
// ❌ WRONG: a static export has NO server at request time — Server Actions, Route Handlers doing
// per-request work, and Dynamic Rendering are all fundamentally incompatible with this mode,
// and the build will fail (or silently produce a broken app) if the codebase uses any of them
module.exports = { output: 'export' }, // while the app also has 'use server' actions somewhere

// ✅ CORRECT: output: 'export' is only for apps that are GENUINELY fully static —
// no Server Actions, no per-request Route Handlers, no Dynamic Rendering anywhere
```

### ⚠️ Pitfall 2: Forgetting `remotePatterns` for a New Image Host
```javascript
// ❌ WRONG: next/image THROWS a runtime error for any remote host not explicitly allow-listed —
// this is a deliberate security default, not a bug, but it's an easy thing to forget when
// a new third-party image source (a new CDN, a new user-upload bucket) is introduced
<Image src="https://new-cdn.acme.com/photo.jpg" ... /> // fails: hostname not in remotePatterns

// ✅ CORRECT: add every actual remote image host used anywhere in the app to remotePatterns
```

### ⚠️ Pitfall 3: Assuming `redirects()`/`rewrites()` Take Effect Without a Restart in Production
Unlike middleware (which can react to request-time logic dynamically), `next.config.js`'s `redirects()`/`rewrites()`/`headers()` are evaluated at **build/server-start time** — changing them requires a new deploy (a rebuild and restart), not just editing a config file on a running server. Teams sometimes mistake this for a hot-reloadable runtime config, leading to confusion when a "quick redirect fix" doesn't take effect until the next actual deployment.
