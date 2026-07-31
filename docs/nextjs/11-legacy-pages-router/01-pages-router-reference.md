# ▲ Legacy Pages Router (Reference): `getStaticProps`, `getServerSideProps`, `_app`/`_document`

## 1. Under-The-Hood Mechanics

Before the App Router, Next.js's `pages/` directory used **exported async functions** on each page component to declare its data-fetching/rendering strategy — a fundamentally different model from the App Router's Server Components (data fetching happens in a special function *alongside* the component, not directly inside it via `await`).

```
pages/products/[id].js
        │
        ├── export async function getStaticProps({ params })   ──► BUILD-TIME data fetch, static HTML output
        ├── export async function getStaticPaths()                ──► which [id] values to pre-render at build time
        ├── export async function getServerSideProps({ req, res })   ──► PER-REQUEST data fetch, always dynamic
        └── export default function ProductPage({ props })              ──► receives fetched data as props, NOT via await
```

### `getStaticProps` + `getStaticPaths`: Build-Time Rendering
`getStaticProps` runs **only at build time** (or during ISR revalidation), returning a `props` object handed to the page component — conceptually the direct predecessor to `generateStaticParams()` + a Server Component's own `await` in the App Router, just structured as two separate named exports instead of one async component function.

### `getServerSideProps`: Always Dynamic, Always Per-Request
Runs on **every single request**, with access to the actual incoming `req`/`res` objects (cookies, headers) — the Pages Router equivalent of the App Router calling `cookies()`/`headers()` to force Dynamic Rendering, except in Pages Router this was an explicit, separate function rather than an implicit side effect of which APIs a component happens to call.

### `_app.js` & `_document.js`: Global Wrapper and HTML Shell
`_app.js` wraps every page (the closest Pages Router analog to App Router's root `layout.tsx`, though without per-segment nesting) — the place for global CSS imports, a shared layout, or a context provider wrapping the whole app. `_document.js` customizes the actual server-rendered `<html>`/`<body>` shell itself (adding a `lang` attribute, injecting a font preload `<link>` outside React's normal render) — rendered **only** on the server, never re-rendered client-side, which is why it cannot contain any interactive/stateful logic.

---

## 2. Real-World Engineering Scenario

**Scenario**: Maintaining a Large Pre-App-Router Codebase During an Incremental Migration.
A large e-commerce site built entirely on the Pages Router is migrating to the App Router incrementally, route by route (Next.js explicitly supports both routers coexisting in the same project during migration — `app/` takes precedence over `pages/` for any path defined in both). Understanding `getStaticProps`'s build-time-only execution model (vs the App Router's Server Component `await`) is essential for correctly translating existing data-fetching logic without introducing subtle behavior changes (e.g. accidentally making a previously-static page dynamic, or vice versa) during the migration.

---

## 3. Production-Grade Code Example

```javascript
// pages/products/[id].js — classic Pages Router static generation with ISR
export async function getStaticPaths() {
  const products = await fetch('https://api.acme.com/products/ids').then((r) => r.json());
  return {
    paths: products.map((p) => ({ params: { id: p.id } })),
    fallback: 'blocking', // paths NOT pre-rendered are generated on-demand, then cached
  };
}

export async function getStaticProps({ params }) {
  const product = await fetch(`https://api.acme.com/products/${params.id}`).then((r) => r.json());
  if (!product) return { notFound: true };
  return { props: { product }, revalidate: 3600 }; // ISR — the Pages Router predecessor to `next: { revalidate }`
}

export default function ProductPage({ product }) {
  return <ProductView product={product} />; // data arrives as PROPS, no await inside the component
}
```

```javascript
// pages/dashboard.js — getServerSideProps: always per-request, reads real req/res
export async function getServerSideProps({ req, res }) {
  const token = req.cookies.session_token;
  if (!token) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  const dashboardData = await fetch('https://api.acme.com/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
  return { props: { dashboardData } };
}

export default function Dashboard({ dashboardData }) {
  return <DashboardView data={dashboardData} />;
}
```

```javascript
// pages/_app.js — global wrapper, equivalent role to App Router's root layout.tsx
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <GlobalThemeProvider>
      <Component {...pageProps} />
    </GlobalThemeProvider>
  );
}
```

```javascript
// pages/_document.js — server-only HTML shell customization
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preload" href="/fonts/acme-sans.woff2" as="font" crossOrigin="" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Adding Interactive Logic to `_document.js`
```javascript
// ❌ WRONG: _document.js renders ONLY on the server, ONCE — hooks/state/effects here either
// throw or silently never re-run, since there's no client-side re-render of this file at all
import { useState } from 'react';
export default function Document() {
  const [theme] = useState('dark'); // meaningless here — this file has no client lifecycle
}

// ✅ CORRECT: keep _document.js to static, server-only HTML shell concerns;
// put all interactive/stateful logic in _app.js or the page components themselves
```

### ⚠️ Pitfall 2: Using `getServerSideProps` Where `getStaticProps` + ISR Would Suffice
```javascript
// ❌ SUBOPTIMAL: forces a fresh server render on EVERY request, even though this product data
// only actually changes a few times a day — throws away all the caching/performance benefit
export async function getServerSideProps({ params }) {
  const product = await fetch(`https://api.acme.com/products/${params.id}`).then((r) => r.json());
  return { props: { product } };
}

// ✅ CORRECT: getStaticProps + revalidate achieves near-fresh data with vastly better cache-hit performance
export async function getStaticProps({ params }) {
  const product = await fetch(`https://api.acme.com/products/${params.id}`).then((r) => r.json());
  return { props: { product }, revalidate: 3600 };
}
```

### ⚠️ Pitfall 3: Mixing `app/` and `pages/` for the Same Route Path Unintentionally
During an incremental migration, having both `app/products/[id]/page.tsx` and `pages/products/[id].js` for what was meant to be the SAME route silently resolves to the `app/` version taking precedence — a team member unaware of the precedence rule can spend real time debugging why their `pages/` router edits appear to have no effect at all, when the App Router version was actually the one being served the whole time.
