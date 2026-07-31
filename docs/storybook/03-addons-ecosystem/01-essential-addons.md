# 📖 Addons Ecosystem: `addon-essentials` — Controls, Actions, Viewport & Backgrounds

## 1. Under-The-Hood Mechanics

`@storybook/addon-essentials` bundles several of the most universally useful addons into one package — each addon adds a distinct panel/behavior to the Storybook UI, reading directly from the currently-selected story's configuration.

```
@storybook/addon-essentials bundles:
        │
        ├── Controls    ──► generates a live prop-editing UI FROM argTypes, letting you change
        │                     a story's args interactively without editing any code
        ├── Actions        ──► logs every invocation of a callback prop (onClick, onChange) into
        │                        a dedicated panel — verifying a handler fires, and with what arguments
        ├── Viewport         ──► simulates specific device/breakpoint dimensions, for reviewing
        │                          responsive behavior without needing a real device/browser resize
        ├── Backgrounds        ──► toggles the canvas background color/theme behind a story —
        │                            useful for a component whose appearance depends on light/dark
        │                            surroundings, without needing a full theme provider setup
        └── Docs                 ──► the autodocs generation engine (covered in the documentation doc)
```

### Controls: Live, Interactive Prop Editing
Because `args` are just data (not hardcoded JSX), the Controls panel can generate an editing UI **automatically** from `argTypes` — a designer or PM reviewing a component can change its props live, in the browser, without touching any code at all, exploring the component's full prop space interactively.

### Actions: Verifying Callback Props Fire Correctly
Passing `action('onClick')` (or configuring automatic action detection via `argTypesRegex`) logs every invocation of that callback into a dedicated panel — immediately visible confirmation that a button's `onClick` actually fires (and with what event/arguments), without needing custom `console.log` statements added to the component itself.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Designer Reviewing Every Prop Combination of a New Component Without Ever Touching Code.
A design system team wanted non-engineers (designers, PMs) to be able to explore a new `<Alert>` component's full range of valid states — every variant, every severity level, with/without a dismiss button — without needing to ask an engineer to manually produce each combination. The Controls addon, auto-generating an interactive editing panel from the component's `argTypes`, let reviewers change `variant`/`severity`/`dismissible` live in the browser and see the component update instantly — turning a component review that would have required back-and-forth requests for specific prop combinations into a fully self-service exploration.

---

## 3. Production-Grade Code Example

```tsx
// Alert.stories.tsx — argTypes driving the Controls panel, action() for callback verification
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  component: Alert,
  title: 'Components/Alert',
  argTypes: {
    severity: { control: 'select', options: ['info', 'warning', 'error'] },
    dismissible: { control: 'boolean' },
  },
  args: {
    onDismiss: action('onDismiss'), // logs to the Actions panel every time it's called
  },
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: { severity: 'info', message: 'This is an informational message.', dismissible: true },
};
```

```tsx
// Viewport addon — configuring which device sizes are available for responsive review
// .storybook/preview.ts
export const parameters = {
  viewport: {
    viewports: {
      mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
      tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
    },
  },
};
```

```tsx
// Backgrounds addon — reviewing a component against different surrounding contexts
export const OnDarkBackground: Story = {
  args: { severity: 'warning', message: 'Reviewing against a dark surrounding context' },
  parameters: {
    backgrounds: { default: 'dark' }, // this SPECIFIC story reviewed against a dark background
  },
};
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Forgetting Controls-Panel Changes Are Session-Local, Not Persisted
```
❌ MISUNDERSTANDING: interactively changing a story's args via the Controls panel does NOT
save those changes back to the actual .stories.tsx file — refreshing the page (or navigating
away and back) resets to whatever the STORY FILE originally declared

✅ AWARENESS: Controls are for INTERACTIVE EXPLORATION during review, not a way to
persistently edit story defaults — a genuinely new default state needs to be added as an
actual named story export in the source file
```

### ⚠️ Pitfall 2: Not Using `action()` for Callback Props, Missing Verification That Handlers Actually Fire
```tsx
// ❌ INCOMPLETE: a callback prop with NO action() wired up gives no visible confirmation
// in Storybook that clicking the button actually triggers anything at all
args: { onClick: () => {} }, // silent — no visibility into whether/how often this fires

// ✅ CORRECT: wire action() so every invocation is visibly logged, confirming correct behavior
args: { onClick: action('onClick') },
```

### ⚠️ Pitfall 3: Configuring Custom Viewports Without Matching the App's Actual Real Breakpoints
```typescript
// ❌ MISALIGNED: defining Storybook viewport presets that don't match the actual CSS
// breakpoints the app's real responsive design uses can give a false sense of "verified
// responsive behavior" — the component might look fine at Storybook's arbitrary preset
// widths while still breaking at the app's ACTUAL breakpoint transition points
viewports: { mobile: { styles: { width: '400px', height: '800px' } } }, // doesn't match the app's real 375px/768px breakpoints

// ✅ CORRECT: mirror the app's REAL CSS breakpoints exactly in the viewport addon config
viewports: { mobile: { styles: { width: '375px', height: '667px' } } }, // matches the actual design system breakpoint
```
