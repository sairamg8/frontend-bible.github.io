# 🖼️ Aspect Ratio, Object-Fit & Intrinsic Media Sizing

## 1. Under-The-Hood Mechanics

### `aspect-ratio`: How the Sizing Algorithm Actually Consumes It
`aspect-ratio: W / H` doesn't force a shape — it feeds a **preferred ratio** into the normal
width/height resolution algorithm, and only changes the result when at least one axis is
otherwise `auto`:

- **Both `width` and `height` set explicitly** → ratio is ignored (the box may not even be
  that shape).
- **One axis `auto`, the other definite** (e.g. `width: 100%; height: auto`) → the `auto`
  axis is computed from the definite one via the ratio. This is the common case for
  responsive media.
- **Both axes `auto` on a non-replaced element** (a plain `div`) → there's no intrinsic size
  to start from, so the *block layout algorithm* runs first (a block's `width: auto`
  resolves to "fill the containing block"), which makes width definite; height is then
  derived from the ratio. This is why `.box { aspect-ratio: 16 / 9 }` on a default block
  `div` works with zero other CSS — width fills the parent through ordinary block layout,
  then the ratio computes height from that.
- **Replaced elements** (`img`, `video`, `canvas`) already have an *intrinsic* ratio from
  their natural pixel dimensions. The HTML `width`/`height` **attributes** (not CSS) feed an
  implicit `aspect-ratio` via the UA stylesheet (`img { aspect-ratio: attr(width) / attr(height) }`
  when both attributes are present) — this is what lets browsers reserve layout space
  *before any CSS or image bytes have downloaded*. An author `aspect-ratio` in CSS overrides
  this when the design ratio needs to differ from the source ratio (e.g. cropping a 4:3
  source into a 16:9 tile).

### `object-fit` & `object-position`: What Happens Inside the Box Once Sized
Once `aspect-ratio`/`width`/`height` have determined the box, `object-fit` controls how the
replaced element's *actual pixel content* maps into that box:

| Value | Behavior |
|---|---|
| `fill` (default) | Stretches content to fill the box exactly — distorts aspect ratio. |
| `contain` | Scales to fit entirely inside the box, preserving ratio — letterboxes. |
| `cover` | Scales to fill the box entirely, preserving ratio — crops overflow. |
| `none` | Ignores the box; renders at natural size (can overflow or under-fill). |
| `scale-down` | Whichever of `none` or `contain` produces the smaller result. |

`object-position` (default `50% 50%`) is the anchor point used when `contain`/`cover`
crop or letterbox — same syntax as `background-position`, but for a real element instead
of a paint layer.

**`object-fit` only applies to replaced elements.** A `div` with a `background-image` needs
`background-size: cover`/`contain` instead — mixing these two models up (trying to
`object-fit` a background-image div, or `background-size` an `<img>`) is a near-universal
first mistake.

---

## 2. Real-World Engineering Scenario

**Scenario**: CMS-Driven Thumbnail Grid With Wildly Inconsistent Source Ratios.
Editorial uploads arrive as 4:3 screenshots, 21:9 banners, and portrait phone photos, but the
grid needs uniform 16:9 tiles with zero layout shift as images lazy-load, and without
stretching/distorting any source image. `aspect-ratio: 16 / 9` on the tile wrapper reserves
the exact space the image will occupy — combined with `width`/`height` HTML attributes on
the `<img>` tag so the ratio is known even before the stylesheet or image bytes arrive.
`object-fit: cover` then crops each source image to fill that fixed shape without distortion,
and `object-position` nudges the crop anchor for images where a center-crop would cut off a
headline or face.

---

## 3. Production-Grade Code Example

```css
.media {
  aspect-ratio: 16 / 9;
  overflow: hidden; /* clip whatever `cover` scales past the box */
  border-radius: 0.5rem;
  background: var(--surface-muted); /* visible placeholder while loading */
}
.media img,
.media video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top; /* bias crop toward faces/headlines */
  display: block;
}

/* Avatar that must never distort — letterbox instead of crop */
.avatar {
  aspect-ratio: 1;
  object-fit: contain;
  background: var(--surface-muted);
}

/* Non-replaced element using aspect-ratio directly: a video-call tile
   placeholder before the media stream attaches */
.call-tile {
  aspect-ratio: 4 / 3;
  display: grid;
  place-items: center;
  background: #111;
  color: #fff;
}

/* Responsive iframe embeds without the old padding-top-percentage hack */
.embed-16-9 {
  aspect-ratio: 16 / 9;
  width: 100%;
}
.embed-16-9 iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
```

```html
<figure class="media">
  <!-- width/height attrs: pre-CSS layout reservation via UA stylesheet -->
  <img src="thumb.jpg" width="640" height="360" loading="lazy" alt="…" />
</figure>
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: `aspect-ratio` Is a Preference, Not a Guarantee
Anything that makes *both* axes definite through a stronger rule — an explicit `height`, a
grid track that forces row height, a flex `align-items: stretch` cross size — overrides the
ratio silently. No error, no warning; the box is just the wrong shape. Check what else in the
box's layout context (grid/flex sizing, explicit height) could be competing.

### ⚠️ Pitfall 2: `min-height: auto` Beats the Ratio in Flex/Grid
A flex or grid item with `aspect-ratio` set can still grow taller than the ratio predicts if
its content is tall, because the item's automatic minimum size (`min-height: auto` default)
wins over the ratio in the sizing algorithm. Fix with `overflow: hidden` (changes the
automatic minimum) or an explicit `min-height: 0` on the item.

### ⚠️ Pitfall 3: Skipping HTML `width`/`height` Attributes = CLS Before CSS Loads
CSS `aspect-ratio` does nothing until the stylesheet has parsed and applied — on a slow
connection there's a real window where the browser has no idea what shape an image will be,
*unless* the `<img>` tag itself carries `width`/`height` attributes (the UA stylesheet
derives the ratio from those immediately, no CSS required). Ship both: HTML attributes for
the pre-CSS window, CSS `aspect-ratio` only when the design ratio needs to override the
source's native ratio.

### ⚠️ Pitfall 4: `object-fit: cover` Silently Crops the Wrong Content
Center-crop by default can cut a face or headline out of frame. Use `object-position` to bias
the anchor, and for CMS content, prefer a per-image focal point (many CMSs store one) mapped
to `object-position` rather than one global rule for every image in the grid.

### ⚠️ Pitfall 5: `object-fit` Is a No-Op on Non-Replaced Elements
Trying to `object-fit: cover` a plain `div` (even one with a `background-image`) does
nothing — it only affects `img`/`video`/`canvas`/some `iframe` cases. Use `background-size`
for background-image layers.

### ⚠️ Pitfall 6: `aspect-ratio` + `max-height` — Width Yields, Not Height
When a box has both `aspect-ratio` and a `max-height` that the ratio-derived height would
exceed, the browser satisfies `max-height` first and shrinks **width** to preserve the ratio
— not the reverse. Useful intentionally (e.g. "fit a hero image within `80dvh`"), but
surprising if the mental model was "width is fixed, height adjusts."
