# 📖 Visual Testing: Chromatic, Per-Story Snapshots & TurboSnap

## 1. Under-The-Hood Mechanics

Chromatic (built by Storybook's maintainers) extends the pixel-diffing visual regression concept — already covered for full pages in the [Playwright visual testing doc](../../playwright/09-visual-and-screenshot-testing/01-visual-regression.md) — down to **every individual story**, integrated directly into the PR review workflow.

```
Every PR ──► Chromatic renders EVERY story, captures a screenshot ──► pixel-diffs against
                the last APPROVED baseline for that specific story
        │
        ▼
Visual differences found ──► surfaced in a REVIEW UI directly linked from the PR —
                                 a human explicitly APPROVES (this change was intentional)
                                 or REJECTS (this is an unintended regression) each diff
        │
        ▼
TurboSnap: only RE-SNAPSHOTS stories whose underlying component/dependency graph
              actually changed in this specific diff — skips re-rendering/re-diffing
              every story that's PROVABLY unaffected, for meaningfully faster PR checks
```

### Why Per-Story (Not Just Per-Page) Visual Testing Matters
Testing only full application pages (as most E2E visual regression does) can miss a component-level visual bug that happens to be visually subtle or covered by other content within a specific page context — testing every individual **story** directly means every meaningfully distinct component state gets its own dedicated visual baseline, catching regressions at a much finer granularity than page-level screenshots alone would.

### TurboSnap: Scaling Visual Testing to Large Component Libraries
A large design system might have thousands of stories — re-rendering and re-diffing every single one on every PR, regardless of what actually changed, would make visual testing prohibitively slow at scale. TurboSnap uses the actual **module dependency graph** to determine which stories could possibly be affected by a given diff's changed files, skipping re-snapshotting anything provably unrelated — turning visual testing's cost from "proportional to total story count" into "proportional to the size of the actual change."

---

## 2. Real-World Engineering Scenario

**Scenario**: A Shared Base Button Component's Padding Change Rippling Into Dozens of Stories, Caught Immediately by Chromatic.
A seemingly-small CSS change to a shared base `<Button>` component's padding was expected to be purely cosmetic and harmless — but Chromatic's PR check flagged **47 different stories** (every component that used `<Button>` internally, directly or several layers deep) as having visual differences, most of them genuinely unintended (a design token typo that made padding inconsistent across breakpoints, not just the intended minor adjustment). The PR's visual review UI let the team quickly scan all 47 diffs, approving the ones that were the intended, correct change and catching the padding inconsistency across the rest — a regression that would have been extremely tedious to manually spot-check across dozens of unrelated-seeming components without Chromatic's systematic, per-story diffing.

---

## 3. Production-Grade Code Example

```yaml
# .github/workflows/chromatic.yml — running Chromatic on every PR
name: Chromatic
on: [pull_request]
jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 } # Chromatic/TurboSnap need FULL git history to compute the diff correctly
      - run: npm ci
      - uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          onlyChanged: true # enables TurboSnap — only re-snapshot AFFECTED stories
```

```tsx
// A story deliberately excluded from Chromatic's visual diffing (e.g. genuinely non-deterministic content)
export const LiveTimestamp: Story = {
  args: { showCurrentTime: true },
  parameters: {
    chromatic: { disableSnapshot: true }, // this story's content changes every second — never meaningfully diffable
  },
};
```

```tsx
// A story deliberately capturing MULTIPLE viewport sizes for Chromatic's responsive review
export const ResponsiveLayout: Story = {
  args: { /* ... */ },
  parameters: {
    chromatic: { viewports: [375, 768, 1200] }, // Chromatic snapshots THIS story at all THREE widths
  },
};
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Reflexively Accepting Every Chromatic Diff Without Reviewing It
```
❌ DANGEROUS: exactly the same "reflexive --update-snapshots" risk covered in both the
Jest snapshot testing doc and the Playwright visual testing doc — bulk-accepting every
flagged diff without actually looking at each one converts a regression-catching tool
into a rubber stamp, especially risky at scale with dozens of diffs per PR

✅ CORRECT: review each flagged diff individually, even when there are many — the whole
point of per-story granularity is precise, reviewable feedback, not a bulk-approve button
```

### ⚠️ Pitfall 2: Not Excluding Genuinely Non-Deterministic Stories From Snapshotting
```tsx
// ❌ WRONG: a story showing a live-updating value (current time, a random avatar, a rotating
// carousel) will ALWAYS show a "diff" against its baseline, since the content genuinely
// changes every render — creates constant, meaningless noise in every PR's visual review
export const LiveClock: Story = { args: { showCurrentTime: true } }; // no chromatic config — flagged every single PR

// ✅ CORRECT: explicitly disable snapshotting for stories whose content is inherently non-deterministic
export const LiveClock: Story = {
  args: { showCurrentTime: true },
  parameters: { chromatic: { disableSnapshot: true } },
};
```

### ⚠️ Pitfall 3: Shallow Git History Breaking TurboSnap's Diff Computation
```yaml
# ❌ WRONG: TurboSnap needs to compare against a PREVIOUS commit's baseline — a shallow
# checkout (the CI default) doesn't have enough git history for this comparison to work correctly,
# silently falling back to re-snapshotting EVERYTHING (defeating TurboSnap's whole purpose)
- uses: actions/checkout@v4  # default fetch-depth: 1 — insufficient history

# ✅ CORRECT: fetch full git history so TurboSnap can correctly compute which stories are affected
- uses: actions/checkout@v4
  with: { fetch-depth: 0 }
```
