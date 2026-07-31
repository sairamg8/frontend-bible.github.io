# 📖 Accessibility Testing: The a11y Addon & Automated axe-core Scans

## 1. Under-The-Hood Mechanics

The a11y addon runs `axe-core` (the same underlying engine as `jest-axe`, covered in the [Jest/RTL accessibility doc](../../jest-rtl/14-accessibility-testing/01-a11y-assertions.md)) against **every story automatically**, surfacing violations directly inside the Storybook UI, without needing a separate test file or command.

```
Story renders in the Storybook canvas
        │
        ▼
a11y addon AUTOMATICALLY runs axe-core against the rendered DOM
        │
        ▼
Accessibility panel shows:
  - Violations (rule failures — must fix)
  - Passes (rules verified as satisfied)
  - Incomplete (rules axe-core couldn't automatically determine — need manual review)
        │
        ▼
Clicking a violation HIGHLIGHTS the exact offending element directly in the canvas —
  immediate visual correlation between the abstract rule violation and the actual DOM element
```

### Why Running Automatically, Per-Story, Is More Effective Than a Separate Test Suite
Because the scan runs **automatically** for every story as part of just browsing Storybook during normal development — not as a separate command an engineer has to remember to run — accessibility issues surface as a natural, unavoidable part of the component-building workflow itself, rather than being deferred to a later, separate "accessibility audit" pass that's easy to skip or forget.

### Combining With CI: Failing Builds on New Violations
Paired with the [test-runner](../11-testing-integration/01-test-runner.md), a11y scans can be asserted against in CI — failing a build specifically when a **new** violation is introduced, turning the addon's development-time visibility into an enforced, CI-blocking gate rather than just an informational panel developers might or might not notice.

---

## 2. Real-World Engineering Scenario

**Scenario**: An Icon-Only Button's Missing Accessible Name Caught During Normal Development, Not a Later Audit.
While building a new icon-only "close" button component, the a11y addon's panel immediately flagged a violation the moment the story rendered — "button has no accessible name" — visible directly during the component's initial development, without the engineer needing to run any separate command or wait for a dedicated accessibility review cycle. Adding an `aria-label="Close"` resolved the violation immediately, visible in the same panel — catching and fixing the issue in the same development session it was introduced, rather than discovering it weeks later in a scheduled accessibility audit (or worse, from real user complaints).

---

## 3. Production-Grade Code Example

```typescript
// .storybook/main.ts — registering the a11y addon
const config = {
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
};
export default config;
```

```tsx
// IconButton.stories.tsx — a11y addon scans this automatically, no extra code needed in the story itself
import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';
import { XIcon } from './icons';

const meta: Meta<typeof IconButton> = { component: IconButton, title: 'Components/IconButton' };
export default meta;

type Story = StoryObj<typeof IconButton>;

// ❌ This story would show an a11y VIOLATION in the panel — no accessible name
export const MissingLabel: Story = {
  args: { icon: <XIcon />, onClick: () => {} },
};

// ✅ This story passes — an accessible name is provided
export const WithAriaLabel: Story = {
  args: { icon: <XIcon />, onClick: () => {}, 'aria-label': 'Close' },
};
```

```typescript
// .storybook/preview.ts — configuring which a11y rules apply globally, and their severity
export const parameters = {
  a11y: {
    config: {
      rules: [
        { id: 'color-contrast', enabled: true },
        { id: 'landmark-one-main', enabled: false }, // disabled globally — not relevant for isolated component stories
      ],
    },
  },
};
```

```typescript
// Enforcing a11y checks as a CI-blocking gate via the test-runner (see the testing integration doc)
// test-runner.ts — configuring an a11y check to run alongside every story's own test
import { injectAxe, checkA11y } from 'axe-playwright';

export default {
  async preVisit(page) { await injectAxe(page); },
  async postVisit(page) { await checkA11y(page, '#storybook-root', { detailedReport: true }); },
};
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Treating a Clean a11y Panel as Proof of Full Accessibility
```
❌ OVERCONFIDENT: identical caveat to jest-axe — automated axe-core scans catch roughly
30-50% of real WCAG issues; they CANNOT verify logical keyboard navigation order, correct
focus trapping in a modal, or a genuinely coherent screen-reader experience end-to-end

✅ CORRECT: treat a clean a11y panel as a necessary baseline, not sufficient evidence —
pair with periodic manual keyboard-only navigation and real screen reader testing
```

### ⚠️ Pitfall 2: Disabling a Rule Globally to Silence a Single Story's False Positive
```typescript
// ❌ RISKY: disabling a rule ENTIRELY, globally, because ONE specific story has a false
// positive (or a deliberately-non-standard pattern) means that rule stops being checked
// for EVERY OTHER story too — silencing real violations elsewhere in the library
a11y: { config: { rules: [{ id: 'aria-required-children', enabled: false }] } }, // disabled EVERYWHERE

// ✅ CORRECT: scope the exception to the SPECIFIC story that needs it, via that story's own parameters
export const SpecialCase: Story = {
  parameters: { a11y: { config: { rules: [{ id: 'aria-required-children', enabled: false }] } } },
};
```

### ⚠️ Pitfall 3: Not Wiring a11y Checks Into CI, Relying Purely on Developers Noticing the Panel
Without the CI-enforced check (via the test-runner), the a11y addon's panel is purely **informational** — an engineer who doesn't happen to look at it, or who dismisses a violation as "not important right now," can still merge a genuinely inaccessible component with nothing blocking the merge. Wiring `checkA11y` into the test-runner's CI pipeline (as shown above) is what turns visibility into actual, enforced protection against accessibility regressions.
