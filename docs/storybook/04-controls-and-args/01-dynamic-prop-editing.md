# 📖 Controls & Args: Auto-Generated Controls, Args Composition & Play-Function Access

## 1. Under-The-Hood Mechanics

Beyond the basic `args`/`argTypes` pairing covered in [story anatomy](../02-story-anatomy/01-file-structure.md), Storybook's control-generation and args-composition behavior has specific rules worth understanding precisely.

```
Auto-generated controls:
  TypeScript prop types / PropTypes ──► docgen extracts them ──► Storybook INFERS a
                                                                     reasonable default control
                                                                     (a union type → select dropdown,
                                                                      a boolean → toggle switch, etc.)

Args composition/inheritance:
  Meta-level args (defaults for EVERY story)
        │
        ▼ MERGED with (not replaced by):
  Story-level args (overrides for THIS specific story)
        │
        ▼
  Final resolved args passed to the component

args in play functions:
  play: async ({ args, canvasElement }) => {
    // `args` here reflects the CURRENT args — including any live Controls-panel edits —
    // not just the story's originally-declared static values
  }
```

### Auto-Generated Controls: Inference From Types, Not Magic
Storybook's docgen (via `react-docgen-typescript` or similar) reads the component's actual TypeScript prop types to infer sensible default controls — a `'primary' | 'secondary'` union prop automatically becomes a `select` dropdown with those exact options, a `boolean` prop becomes a toggle. This inference can be **overridden** via explicit `argTypes`, but understanding it's driven by real type information (not arbitrary Storybook magic) explains why a control sometimes looks different than expected — usually traceable to the actual prop type declaration.

### Args in `play` Functions: Reading Live, Current Values
A `play` function (covered in depth in the [interaction testing doc](../05-interaction-testing/01-play-functions.md)) receiving `args` sees whatever the **current** resolved args are — including any interactive Controls-panel edits made during that session — enabling interaction tests that adapt to different arg combinations rather than being hardcoded against one fixed state.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Prop Type Change Automatically Updating the Controls Panel Without Any Story File Edits.
A `<Badge>` component's `status` prop was originally typed as a plain `string` — the Controls panel showed a generic free-text input, since no meaningful set of options could be inferred. When the prop type was tightened to a proper union (`'active' | 'inactive' | 'pending'`), the Controls panel **automatically** updated to a constrained `select` dropdown showing exactly those three options — with zero changes needed to the `.stories.tsx` file itself, since the control generation reads directly from the component's own type definition, staying automatically in sync with it.

---

## 3. Production-Grade Code Example

```typescript
// Badge.tsx — a tightened union type drives automatic control inference
interface BadgeProps {
  status: 'active' | 'inactive' | 'pending'; // union type ──► auto-inferred as a select dropdown
  count?: number; // number ──► auto-inferred as a numeric input
  showIcon?: boolean; // boolean ──► auto-inferred as a toggle
}

export function Badge({ status, count, showIcon }: BadgeProps) { /* ... */ }
```

```tsx
// Badge.stories.tsx — NO argTypes needed at all; controls are fully inferred from the types above
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = { component: Badge, title: 'Components/Badge' };
export default meta;

type Story = StoryObj<typeof Badge>;
export const Active: Story = { args: { status: 'active', count: 3, showIcon: true } };
```

```tsx
// Args composition — meta-level defaults merging with story-level overrides
const meta: Meta<typeof Badge> = {
  component: Badge,
  args: { showIcon: true }, // DEFAULT for every story below
};
export default meta;

export const WithoutIcon: Story = {
  args: { status: 'active', count: 1, showIcon: false }, // explicitly overrides the meta default
};
export const Default: Story = {
  args: { status: 'active', count: 1 }, // showIcon: true is INHERITED from meta, not restated here
};
```

```tsx
// Reading args inside a play function — an interaction test adapting to the story's OWN args
export const Dismissible: Story = {
  args: { status: 'active', dismissible: true },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    if (args.dismissible) {
      await userEvent.click(canvas.getByRole('button', { name: /dismiss/i }));
      expect(canvas.queryByText(args.status)).not.toBeInTheDocument();
    }
  },
};
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Widening a Prop Type "For Flexibility," Losing Control Precision
```typescript
// ❌ REGRESSION: widening a prop from a precise union to a generic string LOSES the
// auto-generated select-dropdown control, replacing it with a much less useful free-text input
interface BadgeProps { status: string; } // was 'active' | 'inactive' | 'pending' — now just ANY string

// ✅ CORRECT: keep prop types as PRECISE as the component's actual valid values — this
// benefits both type safety AND the auto-generated Controls panel simultaneously
interface BadgeProps { status: 'active' | 'inactive' | 'pending'; }
```

### ⚠️ Pitfall 2: Assuming a `play` Function's `args` Reflects the Story's ORIGINAL Declared Values Always
```tsx
// ❌ WRONG ASSUMPTION: if a reviewer has interactively changed args via the Controls panel
// DURING that session, the play function's `args` reflects the CURRENT (possibly edited)
// values, not necessarily what was originally declared in the story file
play: async ({ args }) => {
  // args.status might NOT be 'active' anymore if someone changed it via Controls first!
}

// ✅ AWARENESS: this is usually a FEATURE (interaction tests naturally adapting to
// whatever args are currently set) but worth being aware of when debugging an
// unexpected play function result during interactive review
```

### ⚠️ Pitfall 3: Manually Duplicating `argTypes` That Docgen Would Have Inferred Correctly Anyway
```typescript
// ❌ REDUNDANT: manually re-declaring argTypes for something docgen already infers correctly
// from the TypeScript types adds maintenance burden (two places to keep in sync) for no benefit
argTypes: { status: { control: 'select', options: ['active', 'inactive', 'pending'] } }, // ALREADY inferred from the type!

// ✅ CORRECT: only add explicit argTypes when overriding/refining what auto-inference
// gets wrong or insufficiently specific — don't duplicate what's already correctly inferred
```
