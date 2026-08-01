# 📰 Floats, Multi-Column & Legacy Layout

## 1. Under-The-Hood Mechanics

Before Flex/Grid, page layout was table hacks and **floats**. Floats remove a box from normal flow (partially) and shift it to the start/end edge; following inline content wraps beside it. Block boxes ignore the float unless they establish a BFC (then they won't overlap it).

`clear: left|right|both` pushes an element below floats on that side. The ancient **clearfix** was a BFC + clear trick; modern code uses `display: flow-root` or simply doesn't float for structure.

### Multi-Column (`columns`)
`column-count` / `column-width` + `column-gap` fragment **content** into newspaper-style columns. This is for continuous text/media flows, not for placing independent card components (Grid wins there). Break control: `break-inside: avoid` on figures/headings, `column-span: all` for full-width banners inside a multicol container.

### When Legacy Still Wins
- **Email HTML** (many clients): tables + inline CSS still dominate.
- **Print** magazine-like articles: multicol can help.
- **CMS body content**: float for "image with text wrap" is still the right tool.
- **Third-party embeds** you don't control.

---

## 2. Real-World Engineering Scenario

**Scenario**: Blog CMS — Editor Wants Image With Text Wrap.
Authors insert images with a "float right" class. Rewriting the article renderer to CSS Grid would break the content model (text must wrap mid-paragraph). Keep float for article body media; use Grid/Flex for chrome (header, related posts cards). Isolate article body CSS so floats can't escape into the site shell (`flow-root` on `.prose`).

---

## 3. Production-Grade Code Example

```css
.prose {
  display: flow-root; /* contain floats */
  max-width: 65ch;
}

.prose .float-end {
  float: inline-end; /* logical: right in LTR, left in RTL */
  max-width: min(16rem, 40%);
  margin-inline-start: 1rem;
  margin-block: 0.25rem 1rem;
}

.prose .float-end img {
  display: block;
  width: 100%;
  height: auto;
}

/* Multi-column longform */
.article-columns {
  column-width: 18rem;
  column-gap: 2rem;
  column-rule: 1px solid var(--border);
}
.article-columns h2,
.article-columns figure {
  break-inside: avoid;
}
.article-columns .banner {
  column-span: all;
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Using Floats for Page Grid
Fragile, clearfix-heavy, poor equal-height columns. Use Grid/Flex for structure; float only for text wrap.

### ⚠️ Pitfall 2: Dropped Floats Without Containment
Parent height collapses; backgrounds/borders short. Fix with `flow-root` or clearfix only if maintaining legacy.

### ⚠️ Pitfall 3: Multi-Column Card Layouts
Cards split across columns awkwardly; `break-inside: avoid` helps but Grid auto-fit is the correct model for component grids.

### ⚠️ Pitfall 4: Float + Flex/Grid Mixed Confusion
Floats don't participate as flex/grid items the same way — don't mix models on the same element expecting both systems to cooperate.
