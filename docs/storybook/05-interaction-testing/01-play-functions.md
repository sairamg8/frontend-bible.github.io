# 📖 Interaction Testing: `play` Functions & the Interaction Panel

## 1. Under-The-Hood Mechanics

A `play` function attaches **behavioral** verification directly to a story — turning it from a purely visual snapshot into an executable test that simulates real user interaction and asserts on the result, using the same `userEvent`/`within`/`expect` primitives covered in the [Jest/RTL bibles](../../jest-rtl/09-user-interaction/01-simulating-input.md).

```typescript
export const FillsAndSubmits: Story = {
  args: { onSubmit: fn() }, // @storybook/test's fn() — a trackable mock, like jest.fn()
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement); // scopes queries to JUST this story's rendered DOM
    await userEvent.type(canvas.getByLabelText('Email'), 'alex@acme.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await expect(args.onSubmit).toHaveBeenCalledWith({ email: 'alex@acme.com' });
  },
};
```

### The Interaction Panel: Visual, Step-by-Step Playback
Beyond running as an automated check, a story's `play` function is **visually replayed** step-by-step in Storybook's own UI — the Interactions panel shows each individual action (click, type, assertion) as it happens, with the ability to pause/step through/rewind, making it possible to **watch** exactly what an interaction test does, not just read its pass/fail result — genuinely useful for debugging a failing interaction, or for reviewing that a component behaves correctly during a design review.

### Why This Combines Documentation and Testing Into One Artifact
A story with a `play` function serves simultaneously as: a visual example of the component in a specific state, a step-by-step demonstration of how a user interacts with it, AND an automated regression test verifying that interaction still works correctly — one authored artifact serving three purposes that would otherwise require separate maintenance (a Storybook story, a demo video/gif, and a separate RTL test file).

---

## 2. Real-World Engineering Scenario

**Scenario**: A Login Form's Validation Behavior Documented and Tested Simultaneously, in One Story.
A login form component needed to demonstrate (for design review) and verify (for regression protection) that submitting with an invalid email showed the correct inline error message. A single story with a `play` function typed an invalid email, clicked submit, and asserted the error message appeared — this ONE artifact served as: a directly-reviewable example designers could watch play out in the Interactions panel, AND an automated test (via the test-runner, covered in the [testing integration doc](../11-testing-integration/01-test-runner.md)) that would fail in CI if a future change ever broke that validation behavior — no separate RTL test file needed to duplicate this same verification.

---

## 3. Production-Grade Code Example

```tsx
// LoginForm.stories.tsx — a play function combining documentation and behavioral verification
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect, fn } from '@storybook/test';
import { LoginForm } from './LoginForm';

const meta: Meta<typeof LoginForm> = { component: LoginForm, title: 'Forms/LoginForm' };
export default meta;

type Story = StoryObj<typeof LoginForm>;

export const ShowsValidationErrorForInvalidEmail: Story = {
  args: { onSubmit: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Email'), 'not-a-valid-email');
    await userEvent.type(canvas.getByLabelText('Password'), 'password123');
    await userEvent.click(canvas.getByRole('button', { name: 'Log In' }));

    await expect(canvas.getByText(/please enter a valid email/i)).toBeInTheDocument();
    await expect(args.onSubmit).not.toHaveBeenCalled(); // submission was correctly BLOCKED
  },
};

export const SubmitsWithValidCredentials: Story = {
  args: { onSubmit: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Email'), 'alex@acme.com');
    await userEvent.type(canvas.getByLabelText('Password'), 'securepass123');
    await userEvent.click(canvas.getByRole('button', { name: 'Log In' }));

    await expect(args.onSubmit).toHaveBeenCalledWith({ email: 'alex@acme.com', password: 'securepass123' });
  },
};
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Querying the Whole Document Instead of Scoping to `canvasElement`
```tsx
// ❌ RISKY: querying the global `screen` (not scoped to this story's canvas) can accidentally
// match elements from OTHER stories/UI chrome rendered elsewhere in the Storybook preview iframe
play: async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Submit' })); // NOT scoped to this story specifically
},

// ✅ CORRECT: always scope queries to canvasElement via within(), matching just this story's rendered output
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
},
```

### ⚠️ Pitfall 2: Writing a `play` Function With No Actual Assertions
```tsx
// ❌ INCOMPLETE: simulating interactions without ever asserting an OUTCOME provides visual
// playback value, but zero actual regression protection — nothing here can ever FAIL
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Submit' })); // interaction happens, but nothing is VERIFIED
},

// ✅ CORRECT: always follow simulated interactions with an actual assertion about the expected result
play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
  await expect(args.onSubmit).toHaveBeenCalled(); // NOW this can actually catch a regression
},
```

### ⚠️ Pitfall 3: Using `fn()` Without Wiring It Into the Component's Actual Prop
```tsx
// ❌ WRONG: fn() creates a trackable mock, but it must actually be PASSED as the relevant
// prop for the component to call it — declaring it without wiring it into args does nothing
const mockOnSubmit = fn(); // created, but never actually passed to the component as a prop
play: async ({ args }) => { expect(mockOnSubmit).toHaveBeenCalled(); }, // checking the WRONG reference

// ✅ CORRECT: pass fn() as the actual arg the component receives, then assert against args.THAT_PROP
args: { onSubmit: fn() }, // correctly wired as the component's actual onSubmit prop
play: async ({ args }) => { expect(args.onSubmit).toHaveBeenCalled(); }, // checking the RIGHT reference
```
