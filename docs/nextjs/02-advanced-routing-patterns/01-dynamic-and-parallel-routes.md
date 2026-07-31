# ▲ Advanced Routing: Dynamic Segments, Route Groups, Parallel & Intercepting Routes

## 1. Under-The-Hood Mechanics

Beyond static folder-per-segment routing, the App Router supports several bracket-syntax conventions that each solve a genuinely different composition problem.

```
app/
  blog/[slug]/page.tsx           ──► /blog/hello-world  → params.slug = 'hello-world'
  shop/[...slug]/page.tsx          ──► /shop/a/b/c        → params.slug = ['a','b','c']
  docs/[[...slug]]/page.tsx          ──► /docs AND /docs/a/b → params.slug = undefined | ['a','b']
  (marketing)/about/page.tsx           ──► /about (group folder invisible in the URL)
  dashboard/@analytics/page.tsx          ──► rendered in the `analytics` PARALLEL SLOT of dashboard/layout.tsx
  feed/(.)photo/[id]/page.tsx              ──► INTERCEPTS /photo/[id] when navigated to FROM within feed/
```

### Dynamic Segments: `[id]` vs `[...slug]` vs `[[...slug]]`
- `[id]` matches **exactly one** path segment.
- `[...slug]` (catch-all) matches **one or more** segments, exposed as an array — but does **not** match the base route itself (`/shop` alone would 404 against `shop/[...slug]/page.tsx`).
- `[[...slug]]` (optional catch-all) additionally matches the base route, with `params.slug` being `undefined` in that case — the only variant of the three that makes the segment itself optional.

### Route Groups `(name)`: Organization Without URL Impact
Parentheses-wrapped folder names are stripped from the resulting URL entirely — `app/(marketing)/about/page.tsx` still serves `/about`. This exists purely to let large route trees be organized by team/feature/rendering-strategy in the filesystem (e.g. grouping all marketing pages under one shared layout) without that organization leaking into the public URL structure.

### Parallel Routes `@slot`: Multiple Independent Pages, One Layout
A layout can accept **named slots** (`@analytics`, `@team`) as props, each independently rendered — critically, each slot has its **own** loading/error boundaries and its own independent navigation state, meaning one slot can be mid-navigation (showing a loading state) while a sibling slot stays fully interactive. This is the mechanism behind dashboards showing multiple independently-loading widgets in one layout.

### Intercepting Routes `(.)`/`(..)`: Modal-Over-Feed Pattern
`(.)folder` intercepts a route **only when navigated to via client-side navigation from within the current layout level** — a direct hard navigation (page refresh, or a bookmarked URL) to that same path instead renders the **actual, non-intercepted** page. This is precisely the mechanism behind "click a photo in a feed, it opens as a modal over the feed; refresh the page at that same URL, get the full standalone photo page instead" — a single pattern that's genuinely hard to replicate outside a framework with first-class support for it.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Social Feed Where Clicking a Photo Opens a Modal, But Sharing the Direct Link Shows a Full Page.
Clicking a photo thumbnail in `/feed` should open a modal overlay (preserving the feed scroll position underneath) — but a user pasting that same photo's URL into a new tab should see a full standalone photo page with related content, not a broken modal with no feed behind it. An intercepting route (`app/feed/(.)photo/[id]/page.tsx`, rendered into a parallel `@modal` slot) handles the client-navigation case as a modal; the same `/photo/[id]` URL hit via direct navigation instead resolves to the plain `app/photo/[id]/page.tsx` — one URL, two entirely different rendering outcomes depending on navigation origin, exactly matching the product requirement.

---

## 3. Production-Grade Code Example

```tsx
// app/feed/layout.tsx — declaring the parallel @modal slot alongside the default feed content
export default function FeedLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode; // the @modal slot's content — null when no intercepted route is active
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
```

```tsx
// app/feed/@modal/(.)photo/[id]/page.tsx — intercepts /photo/[id] ONLY when navigated to from within /feed
'use client';
import { useRouter } from 'next/navigation';

export default function PhotoModal({ params }: { params: { id: string } }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center" onClick={() => router.back()}>
      <PhotoDetail id={params.id} />
    </div>
  );
}
```

```tsx
// app/photo/[id]/page.tsx — the FULL standalone page, served on direct navigation/hard refresh
export default function PhotoPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <PhotoDetail id={params.id} />
      <RelatedPhotos currentId={params.id} />
    </div>
  );
}
```

```tsx
// app/feed/@modal/default.tsx — REQUIRED: fallback for the slot on a hard navigation elsewhere in /feed
export default function Default() {
  return null; // no modal content on initial/hard navigation into /feed itself
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Forgetting `default.tsx` for a Parallel Route Slot
```
❌ WRONG: without app/feed/@modal/default.tsx, a HARD navigation/refresh while a modal-intercepted
route's URL is active throws a 404 for the @modal slot specifically, since Next.js has no fallback
UI to render into that slot when the intercepting route itself isn't the one that matched

✅ CORRECT: every parallel slot needs a default.tsx (even just `return null`) as its non-matched fallback
```

### ⚠️ Pitfall 2: Assuming `[...slug]` Matches the Base Route
```tsx
// ❌ WRONG assumption: app/shop/[...slug]/page.tsx does NOT match a bare /shop request — that 404s
// unless a separate app/shop/page.tsx also exists

// ✅ CORRECT: use the OPTIONAL catch-all if the base route should ALSO be handled by the same page
// app/shop/[[...slug]]/page.tsx — params.slug is undefined for /shop, an array for /shop/a/b
```

### ⚠️ Pitfall 3: Route Groups Silently Creating Duplicate/Conflicting Routes
```
❌ WRONG: app/(marketing)/about/page.tsx AND app/(shop)/about/page.tsx both resolve to the exact
same URL /about — Next.js throws a build-time conflict error, but the error message references
the route groups' STRIPPED path, which can be confusing to trace back to which two files collided

✅ CORRECT: route groups organize the FILESYSTEM, not the URL space — always check the final,
group-stripped URL for uniqueness across the whole app/ tree, not just within one group folder
```
