export interface ReactConcept {
  id: string;
  title: string;
  category: string;
  categoryName: string;
  badge?: string;
  summary: string;
  mechanics: string[];
  scenario: {
    title: string;
    description: string;
  };
  code: string;
  pitfalls: string[];
}

export const REACT_BIBLE_MODULES = [
  { id: 'module-1', name: 'Module 1: Core Lifecycle & State Hooks' },
  { id: 'module-2', name: 'Module 2: Performance & Memoization' },
  { id: 'module-3', name: 'Module 3: React 19 Action & Form Hooks' },
  { id: 'module-4', name: 'Module 4: Context & External Store Hooks' },
  { id: 'module-5', name: 'Module 5: DOM & Reference Hooks' },
  { id: 'module-6', name: 'Module 6: ID, Accessibility & Debug Hooks' },
  { id: 'module-7', name: 'Module 7: RSC & Server Actions' },
  { id: 'module-8', name: 'Module 8: React DOM Client & Streaming APIs' },
  { id: 'module-9', name: 'Module 9: 50-60 LPA Capstone Architecture' },
];

export const REACT_CONCEPTS_DATA: ReactConcept[] = [
  // MODULE 1
  {
    id: 'use-state',
    title: '1. useState',
    category: 'module-1',
    categoryName: 'Module 1: Core Lifecycle & State Hooks',
    badge: 'State',
    summary: 'State preservation across renders using Fiber node linked list (memoizedState) and automatic state batching.',
    mechanics: [
      'Fiber Linked List: State variables are persisted on FiberNode.memoizedState linked list in call order.',
      'Automatic Batching: React 18/19 groups multiple state setters across async callbacks into a single re-render pass.',
      'Lazy Initializers: Passing a function useState(() => expensiveCalc()) guarantees execution runs ONCE on mount.'
    ],
    scenario: {
      title: 'Enterprise Multi-Step Onboarding Form',
      description: 'Reading cached profile configuration from storage during initial mount without re-evaluating on every re-render.'
    },
    code: `import { useState } from 'react';

export function UserProfileEditor() {
  const [profile, setProfile] = useState(() => ({ name: 'Alex', role: 'Architect' }));
  const updateRole = (newRole: string) => setProfile(prev => ({ ...prev, role: newRole }));
  return <div>{profile.name} - {profile.role}</div>;
}`,
    pitfalls: [
      'Direct Object Mutation: Mutating state directly user.score = 20 prevents Object.is comparison from detecting change.',
      'Stale Closures: Omitting functional update in async callbacks overwrites intermediate state updates.'
    ]
  },
  {
    id: 'use-reducer',
    title: '2. useReducer',
    category: 'module-1',
    categoryName: 'Module 1: Core Lifecycle & State Hooks',
    badge: 'State Machine',
    summary: 'Predictable state transitions, action dispatch queues, pure reducer functions, and state machine architectures.',
    mechanics: [
      'Reducer Queue Processing: Action dispatches form an update queue evaluated sequentially by pure reducer functions.',
      'Bailout Optimization: If reducer returns Object.is(oldState, newState) === true, React bails out of child renders early.',
      'Discriminated Unions: Enforces 100% type safety across complex multi-step state actions.'
    ],
    scenario: {
      title: 'Multi-Step Checkout Pipeline',
      description: 'Managing complex checkout transitions (Cart -> Shipping -> Payment -> Confirmation) with strict state validation.'
    },
    code: `import { useReducer } from 'react';

type Action = { type: 'NEXT' } | { type: 'SET_SHIPPING'; payload: string };
function checkoutReducer(state: { step: string; address: string }, action: Action) {
  switch (action.type) {
    case 'NEXT': return { ...state, step: 'payment' };
    case 'SET_SHIPPING': return { ...state, address: action.payload };
    default: return state;
  }
}
export function CheckoutWizard() {
  const [state, dispatch] = useReducer(checkoutReducer, { step: 'shipping', address: '' });
  return <button onClick={() => dispatch({ type: 'NEXT' })}>Next</button>;
}`,
    pitfalls: [
      'Impure Reducers: Performing side effects (API calls, localStorage) inside reducer breaks time-travel debugging.',
      'State Mutation Drafts: Mutating state properties directly without returning a new object reference skips re-renders.'
    ]
  },
  {
    id: 'use-effect',
    title: '3. useEffect',
    category: 'module-1',
    categoryName: 'Module 1: Core Lifecycle & State Hooks',
    badge: 'Passive Effect',
    summary: 'Post-paint side-effect synchronization with external systems, AbortController cancellation, and cleanup ordering.',
    mechanics: [
      'Post-Paint Asynchronous Execution: useEffect executes after browser paint to avoid blocking screen frame updates.',
      'Passive Effect Queue: Fiber node maintains a queue of passive callbacks executed during scheduler idle tasks.',
      'Dependency Comparison: Evaluates Object.is(prevDep, nextDep) for every item in array.'
    ],
    scenario: {
      title: 'Real-Time WebSocket & Telemetry Stream',
      description: 'Establishing active stock ticker subscriptions and cleaning up connections when symbol prop changes.'
    },
    code: `import { useState, useEffect } from 'react';

export function TickerStream({ symbol }: { symbol: string }) {
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const socket = new WebSocket(\`wss://api.exchange.com/\${symbol}\`);
    socket.onmessage = (e) => setPrice(JSON.parse(e.data).price);

    return () => {
      controller.abort();
      socket.close();
    };
  }, [symbol]);

  return <div>\${price}</div>;
}`,
    pitfalls: [
      'Infinite Render Loops: Passing newly instantiated inline objects into dependency array causes endless re-renders.',
      'Race Conditions: Async resolutions finishing out-of-order overwrite fresh state with stale response data.'
    ]
  },
  {
    id: 'use-layout-effect',
    title: '4. useLayoutEffect',
    category: 'module-1',
    categoryName: 'Module 1: Core Lifecycle & State Hooks',
    badge: 'Pre-Paint DOM',
    summary: 'Synchronous execution after DOM mutations but BEFORE browser paint to eliminate visual flickering.',
    mechanics: [
      'Synchronous Execution: Blocks browser main-thread painting until layout calculations complete.',
      'DOM Measurements: Reading getBoundingClientRect() and adjusting element positioning synchronously.',
      'Paint Prevention: Guarantees user never sees unpositioned elements at screen (0,0).'
    ],
    scenario: {
      title: 'Zero-Flicker Floating Tooltip & Popover',
      description: 'Positioning dynamic context menus above or below target buttons based on viewport overflow boundaries.'
    },
    code: `import { useState, useRef, useLayoutEffect } from 'react';

export function ZeroFlickerPopover() {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left });
    }
  }, []);

  return <button ref={btnRef}>Click Popover</button>;
}`,
    pitfalls: [
      'SSR Warning: Throws server warning on SSR runtimes (use useIsomorphicLayoutEffect helper).',
      'Thread Freezing: Heavy CPU loops inside useLayoutEffect freeze browser rendering.'
    ]
  },
  {
    id: 'use-insertion-effect',
    title: '5. useInsertionEffect',
    category: 'module-1',
    categoryName: 'Module 1: Core Lifecycle & State Hooks',
    badge: 'CSS Injection',
    summary: 'Fires before DOM mutations for CSS-in-JS style tag injections to avoid layout thrashing.',
    mechanics: [
      'Pre-DOM Mutation Phase: Fires before React mutates actual DOM nodes.',
      'CSS-in-JS Libraries: Enables styled-components and Emotion to inject <style> rules before layout recalculations.'
    ],
    scenario: {
      title: 'Dynamic CSS-in-JS Theme Engine',
      description: 'Injecting dynamic style tags into document head before layout measurements take place.'
    },
    code: `import { useInsertionEffect } from 'react';

export function DynamicStyleInjector({ cssRule }: { cssRule: string }) {
  useInsertionEffect(() => {
    const style = document.createElement('style');
    style.textContent = cssRule;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [cssRule]);

  return null;
}`,
    pitfalls: [
      'Restricted State Setters: State updates inside useInsertionEffect are prohibited.'
    ]
  },

  // MODULE 2
  {
    id: 'use-memo',
    title: '6. useMemo',
    category: 'module-2',
    categoryName: 'Module 2: Performance & Memoization',
    badge: 'Memoization',
    summary: 'Caching expensive CPU calculations across renders based on dependency array referential equality.',
    mechanics: [
      'Fiber Cache: Stores [Value, Dependencies] in Fiber node memoizedState array.',
      'Shallow Equality: Compares dependencies using Object.is to determine if cache should be returned.'
    ],
    scenario: {
      title: '10,000 Row Financial Data Filter',
      description: 'Sorting 10,000 transactions without recalculating on unrelated UI state toggles.'
    },
    code: `import { useMemo } from 'react';

export function DataGrid({ items }: { items: any[] }) {
  const activeItems = useMemo(() => items.filter(i => i.active), [items]);
  return <div>{activeItems.length} active</div>;
}`,
    pitfalls: [
      'Premature Optimization: Memoizing trivial string operations costs more memory than raw recalculation.'
    ]
  },
  {
    id: 'use-callback',
    title: '7. useCallback',
    category: 'module-2',
    categoryName: 'Module 2: Performance & Memoization',
    badge: 'Function Identity',
    summary: 'Retaining function memory reference identity across re-renders to prevent child component re-renders.',
    mechanics: [
      'Reference Stability: Keeps the same function reference across renders unless dependencies update.',
      'React.memo Synergy: Required when passing callback handlers to child components wrapped in React.memo.'
    ],
    scenario: {
      title: 'Data Table Row Selector Handlers',
      description: 'Passing stable click handlers to 1,000 memoized TableRow items.'
    },
    code: `import { useCallback } from 'react';

export function ParentGrid({ onSelect }: { onSelect: (id: string) => void }) {
  const handleSelect = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);

  return <button onClick={() => handleSelect('101')}>Select</button>;
}`,
    pitfalls: [
      'Stale Closures: Omitting read state variables from dependency array executes callback against stale initial state.'
    ]
  },
  {
    id: 'use-transition',
    title: '8. useTransition',
    category: 'module-2',
    categoryName: 'Module 2: Performance & Memoization',
    badge: 'Concurrent Mode',
    summary: 'Low-priority non-blocking state updates that keep INP latency under 50ms during heavy CPU recalculations.',
    mechanics: [
      'Priority Scheduling: Splitting rendering work into interruptible micro-tasks managed by React Scheduler.',
      'Input Responsiveness: User typing keypresses interrupt transition renders, eliminating input lag.'
    ],
    scenario: {
      title: 'High-Frequency Crypto Screener',
      description: 'Filtering 50,000 crypto asset rows while user input typing responds instantly at 60 FPS.'
    },
    code: `import { useState, useTransition } from 'react';

export function Screener() {
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    startTransition(() => setFilter(e.target.value));
  };

  return <input value={input} onChange={handleChange} />;
}`,
    pitfalls: [
      'Wrapping Controlled Input Value: Passing transition state directly into input value freezes input typing.'
    ]
  },
  {
    id: 'use-deferred-value',
    title: '9. useDeferredValue',
    category: 'module-2',
    categoryName: 'Module 2: Performance & Memoization',
    badge: 'Deferred Value',
    summary: 'Deferring re-renders of heavy UI subtrees until main thread becomes idle.',
    mechanics: [
      'Prop Deferral: Deferring downstream sub-tree rendering when receiving fast-changing parent props.',
      'Stale State Comparison: Allows UI to render previous value with reduced opacity while deferred value catches up.'
    ],
    scenario: {
      title: 'Heavy Graph & Chart Renderer',
      description: 'Deferring complex SVG chart updates while slider input moves smoothly.'
    },
    code: `import { useState, useDeferredValue } from 'react';

export function ChartContainer() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}`,
    pitfalls: [
      'Debouncing Confusion: useDeferredValue does not introduce artificial timeout delays; it yields CPU based on device speed.'
    ]
  },

  // MODULE 3
  {
    id: 'use-action-state',
    title: '10. useActionState',
    category: 'module-3',
    categoryName: 'Module 3: React 19 Action & Form Hooks',
    badge: 'React 19 Action',
    summary: 'Async server/client action status tracking, pending state management, and returning action payload responses.',
    mechanics: [
      'Action State Engine: Manages [state, formAction, isPending] tuple for async function calls.',
      'Form Integration: Connects directly with HTML <form action={formAction}>.'
    ],
    scenario: {
      title: 'Async User Profile Mutation',
      description: 'Handling form submissions with loading spinners and error banner feedback.'
    },
    code: `import { useActionState } from 'react';

async function updateProfile(prevState: any, formData: FormData) {
  return { success: true };
}

export function ProfileForm() {
  const [state, formAction, isPending] = useActionState(updateProfile, { success: false });
  return <form action={formAction}><button disabled={isPending}>Save</button></form>;
}`,
    pitfalls: [
      'Unhandled Promise Rejections: Ensure server actions handle try/catch blocks internally.'
    ]
  },
  {
    id: 'use-optimistic',
    title: '11. useOptimistic',
    category: 'module-3',
    categoryName: 'Module 3: React 19 Action & Form Hooks',
    badge: '0ms Latency',
    summary: 'Instant 0ms UI mutations with automatic server state reconciliation and rollback on network failure.',
    mechanics: [
      'Optimistic State Projection: React projects temporary optimistic state layers during active async transitions.',
      'Automatic Rollback: If async server action throws error or rejects, UI rolls back cleanly to solid server state.'
    ],
    scenario: {
      title: 'E-Commerce Cart Quantity Adjuster',
      description: 'Updating item quantity instantly on click while background network request syncs with backend database.'
    },
    code: `import { useOptimistic } from 'react';

export function LikeButton({ likes }: { likes: number }) {
  const [optLikes, setOptLikes] = useOptimistic(likes, (current, inc: number) => current + inc);
  return <button onClick={() => setOptLikes(1)}>Likes: {optLikes}</button>;
}`,
    pitfalls: [
      'Out-of-Order Race Conditions: Rapid multi-clicks resolve out of order requiring backend idempotency keys.'
    ]
  },
  {
    id: 'use-form-status',
    title: '12. useFormStatus',
    category: 'module-3',
    categoryName: 'Module 3: React 19 Action & Form Hooks',
    badge: 'Form Context',
    summary: 'Subscribes directly to parent <form> submission status without prop drilling.',
    mechanics: [
      'Form Context Subscription: Subscribes directly to parent <form> submission state.',
      'Child Component Requirement: Must be called inside a component nested beneath the <form>.'
    ],
    scenario: {
      title: 'Modular Design System Submit Buttons',
      description: 'Deeply nested submit spinner button reading parent form status automatically.'
    },
    code: `import { useFormStatus } from 'react';

export function SubmitBtn() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving...' : 'Submit'}</button>;
}`,
    pitfalls: [
      'Same Component Invocation: Calling useFormStatus in the component rendering <form> returns false status.'
    ]
  },
  {
    id: 'react-use',
    title: '13. React.use()',
    category: 'module-3',
    categoryName: 'Module 3: React 19 Action & Form Hooks',
    badge: 'Resource Operator',
    summary: 'Unwrapping Promises and reading Context conditionally inside render loops or conditional branches.',
    mechanics: [
      'Conditional Execution: Can be invoked inside if statements, switch blocks, and for loops.',
      'Suspense Integration: Unwrapping pending Promise suspends component to nearest Suspense boundary.'
    ],
    scenario: {
      title: 'Permission-Based Security Panel',
      description: 'Unwrapping security entitlement promises conditionally based on admin role.'
    },
    code: `import { use, Suspense } from 'react';

function Details({ promise }: { promise: Promise<any> }) {
  const data = use(promise);
  return <div>{data.title}</div>;
}`,
    pitfalls: [
      'Inline Promise Instantiation: Passing un-memoized inline promises into use() causes infinite Suspense loops.'
    ]
  },

  // MODULE 4
  {
    id: 'use-context',
    title: '14. useContext',
    category: 'module-4',
    categoryName: 'Module 4: Context & External Store Hooks',
    badge: 'Context',
    summary: 'Sub-tree context subscriptions, Provider value propagation, and state sharing across components.',
    mechanics: [
      'Context Dependency Object: Registers context dependency on consumer Fiber nodes.',
      'Propagation: Provider re-renders trigger propagateContextChange scanning for subscribed consumers.'
    ],
    scenario: {
      title: 'Enterprise Shell Theme & Locale Provider',
      description: 'Sharing global theme settings across hundreds of nested UI components.'
    },
    code: `import { createContext, useContext } from 'react';

const ThemeCtx = createContext('dark');
export function Child() {
  const theme = useContext(ThemeCtx);
  return <div>Theme: {theme}</div>;
}`,
    pitfalls: [
      'Un-memoized Value Objects: Passing un-memoized object literals to Provider causes whole-tree re-renders.'
    ]
  },
  {
    id: 'use-sync-external-store',
    title: '15. useSyncExternalStore',
    category: 'module-4',
    categoryName: 'Module 4: Context & External Store Hooks',
    badge: 'Tearing Prevention',
    summary: 'Atomic external store reads (Redux, Zustand, Web APIs) without visual tearing in Concurrent Mode.',
    mechanics: [
      'Atomic Snapshot Read: Guarantees all components in render pass read identical state snapshot.',
      'Tearing Prevention: Prevents external store mutations from corrupting concurrent render passes.'
    ],
    scenario: {
      title: 'Micro-Frontend Shared Store & Network Status',
      description: 'Subscribing to global WebSocket network state shared across micro-apps.'
    },
    code: `import { useSyncExternalStore } from 'react';

function getSnapshot() { return navigator.onLine; }
function subscribe(cb: () => void) {
  window.addEventListener('online', cb);
  return () => window.removeEventListener('online', cb);
}

export function NetworkStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot);
  return <div>{isOnline ? 'Online' : 'Offline'}</div>;
}`,
    pitfalls: [
      'Mutable Snapshot References: Returning new object literals in getSnapshot causes infinite re-render crashes.'
    ]
  },

  // MODULE 5
  {
    id: 'use-ref',
    title: '16. useRef',
    category: 'module-5',
    categoryName: 'Module 5: DOM & Reference Hooks',
    badge: 'Mutable Ref',
    summary: 'Persistent mutable container (.current), DOM node binding, and React 19 callback cleanups.',
    mechanics: [
      'Mutation Persistence: Mutating ref.current does NOT trigger component re-render pass.',
      'Identity Stability: The ref object reference remains identical across all re-renders.',
      'React 19 Ref Callback Cleanup: Ref callback functions support returning cleanup handlers on unmount.'
    ],
    scenario: {
      title: '60FPS Canvas Engine & Video Player',
      description: 'Commanding HTML5 video elements and canvas contexts directly without triggering React re-renders.'
    },
    code: `import { useRef } from 'react';

export function FocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <input ref={inputRef} onClick={() => inputRef.current?.focus()} />;
}`,
    pitfalls: [
      'Reading/Writing in Render: Reading or mutating ref.current inside component render body causes non-deterministic bugs.'
    ]
  },
  {
    id: 'use-imperative-handle',
    title: '17. useImperativeHandle',
    category: 'module-5',
    categoryName: 'Module 5: DOM & Reference Hooks',
    badge: 'Imperative Handle',
    summary: 'Customizing imperative handle methods exposed to parent components via ref.',
    mechanics: [
      'Encapsulation: Encapsulates internal DOM nodes while exposing limited imperative methods (play, pause, focus).'
    ],
    scenario: {
      title: 'Custom Audio & Video Player Component',
      description: 'Exposing restricted playVideo() and seekTo() methods to parent control dashboards.'
    },
    code: `import { useRef, useImperativeHandle } from 'react';

export function CustomInput({ ref }: { ref: any }) {
  const internalRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({
    focusInput: () => internalRef.current?.focus()
  }));
  return <input ref={internalRef} />;
}`,
    pitfalls: [
      'Overusing Escape Hatches: Breaking React declarative paradigm by using imperative handles for UI state.'
    ]
  },

  // MODULE 6
  {
    id: 'use-id',
    title: '18. useId',
    category: 'module-6',
    categoryName: 'Module 6: ID, Accessibility & Debug Hooks',
    badge: 'Hydration Safe',
    summary: 'Hydration-safe unique identifier generation for ARIA accessibility attributes across SSR and Client.',
    mechanics: [
      'Hydration Guarantee: Generates matching unique IDs on server and client to prevent hydration mismatches.'
    ],
    scenario: {
      title: 'Accessible Form Field Input & Label Binding',
      description: 'Generating matching htmlFor and id attributes for ARIA accessibility compliance.'
    },
    code: `import { useId } from 'react';

export function AccessibleInput() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Email Address</label>
      <input id={id} type="email" />
    </>
  );
}`,
    pitfalls: [
      'Generating Array Keys: Do NOT use useId for generating database key props in rendered lists.'
    ]
  },
  {
    id: 'use-debug-value',
    title: '19. useDebugValue',
    category: 'module-6',
    categoryName: 'Module 6: ID, Accessibility & Debug Hooks',
    badge: 'DevTools',
    summary: 'Formatting custom label displays inside React Developer Tools for custom hooks.',
    mechanics: [
      'DevTools Formatting: Formats and displays custom state labels inside React DevTools inspector.'
    ],
    scenario: {
      title: 'Custom Hook Debugging in DevTools',
      description: 'Formatting online status labels for custom useOnlineStatus hook inside DevTools.'
    },
    code: `import { useDebugValue, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline] = useState(true);
  useDebugValue(isOnline ? 'Online Status: ACTIVE' : 'Online Status: DISCONNECTED');
  return isOnline;
}`,
    pitfalls: [
      'Production Cost: Formatting functions run when DevTools is active; use deferred formatting callback for heavy objects.'
    ]
  },

  // MODULE 7
  {
    id: 'rsc-directives',
    title: "20. RSC Directives ('use server' / 'use client')",
    category: 'module-7',
    categoryName: 'Module 7: RSC & Server Actions',
    badge: 'RSC Boundary',
    summary: 'React Server Components execution model, Flight serialization protocol, and 0-kb client bundle footprint.',
    mechanics: [
      'Flight Serialization: Server Components return serialized JSX tree instructions (Flight JSON) to browser.',
      'Zero Bundle Size: Heavy DB drivers and markdown parsers execute on server without entering client JS bundle.',
      'Explicit Boundaries: use client defines interactive entry points; use server designates server actions.'
    ],
    scenario: {
      title: 'Enterprise Multi-Tenant CMS Detail Page',
      description: 'Querying PostgreSQL database directly in async component with zero client-side JavaScript overhead.'
    },
    code: `// Server Component (RSC)
import { ReviewClientForm } from './ReviewClientForm';

export async function ProductPage({ id }: { id: string }) {
  const product = await db.product.findUnique({ where: { id } });

  return (
    <div>
      <h1>{product.name}</h1>
      <ReviewClientForm productId={id} />
    </div>
  );
}`,
    pitfalls: [
      'Non-Serializable Props: Passing JS functions or class instances from Server to Client throws Flight serialization crash.'
    ]
  },
  {
    id: 'server-actions',
    title: '21. Server Actions & Mutations',
    category: 'module-7',
    categoryName: 'Module 7: RSC & Server Actions',
    badge: 'Server Mutation',
    summary: 'Handling HTML <form action={serverAction}>, revalidation, and secure server-side mutations.',
    mechanics: [
      'Native Form Integration: Server actions execute directly on server node via HTML form submission or RPC call.',
      'Cache Revalidation: Triggering revalidatePath and revalidateTag to refresh RSC payload streams.'
    ],
    scenario: {
      title: 'Secure Account Settings Mutation',
      description: 'Updating email and password settings directly on server node with CSRF protection.'
    },
    code: `'use server';

export async function updateEmailAction(formData: FormData) {
  const email = formData.get('email');
  await db.user.update({ data: { email } });
}`,
    pitfalls: [
      'Security Authorization: Always verify authentication and user entitlements inside the server action function.'
    ]
  },

  // MODULE 8
  {
    id: 'client-dom-apis',
    title: '22. createRoot & hydrateRoot',
    category: 'module-8',
    categoryName: 'Module 8: React DOM Client & Streaming APIs',
    badge: 'DOM Client',
    summary: 'Concurrent root initialization, client-side rendering, and SSR hydration mismatch fixes.',
    mechanics: [
      'createRoot: Initializes Concurrent React root on client container element.',
      'hydrateRoot: Attaches event listeners to server-rendered HTML payload.'
    ],
    scenario: {
      title: 'Enterprise Application Client Mounting',
      description: 'Hydrating server-rendered HTML into interactive client application without layout shifts.'
    },
    code: `import { hydrateRoot } from 'react-dom/client';
import App from './App';

hydrateRoot(document.getElementById('root')!, <App />);`,
    pitfalls: [
      'Hydration Mismatch: Rendering dynamic dates or window dimensions directly in SSR body causes hydration crashes.'
    ]
  },
  {
    id: 'streaming-ssr-apis',
    title: '23. renderToPipeableStream & Edge Streaming',
    category: 'module-8',
    categoryName: 'Module 8: React DOM Client & Streaming APIs',
    badge: 'Streaming SSR',
    summary: 'Progressive HTML streaming over Node.js Writable streams and Web Edge Streams API.',
    mechanics: [
      'Shell Phase: Renders document shell instantly while data fetching promises run asynchronously.',
      'Suspense Streaming: Streams HTML template chunks and inline scripts down open HTTP connection.'
    ],
    scenario: {
      title: 'Edge-Rendered E-Commerce Product Shell',
      description: 'Streaming page layout instantly from Cloudflare Edge Workers while database queries resolve.'
    },
    code: `// Node.js Express Streaming Server
import { renderToPipeableStream } from 'react-dom/server';

app.get('/', (req, res) => {
  const stream = renderToPipeableStream(<App />, {
    onShellReady() { stream.pipe(res); }
  });
});`,
    pitfalls: [
      'Blocking Shell Render: Putting slow data calls above outer Suspense boundaries delays initial shell delivery.'
    ]
  },
  {
    id: 'asset-preloading-apis',
    title: '24. Resource Preloading APIs',
    category: 'module-8',
    categoryName: 'Module 8: React DOM Client & Streaming APIs',
    badge: 'Asset Preload',
    summary: 'React 19 preloading functions (preload, preinit, preconnect, prefetchDNS) to eliminate asset waterfalls.',
    mechanics: [
      'preload: Injecting <link rel="preload"> for stylesheets, fonts, and scripts.',
      'preinit: Preloading and executing scripts or stylesheets instantly from component tree.'
    ],
    scenario: {
      title: 'Zero-Waterfall Web Font & API Socket Preloading',
      description: 'Opening early TLS connections and preloading fonts before component renders.'
    },
    code: `import { preload, preconnect } from 'react-dom';

export function AssetLoader() {
  preconnect('https://api.gateway.com');
  preload('/fonts/inter.woff2', { as: 'font' });
  return null;
}`,
    pitfalls: [
      'Over-Preloading Assets: Preloading unnecessary scripts congests network bandwidth and delays LCP.'
    ]
  },

  // MODULE 9
  {
    id: 'capstone-50-60-lpa',
    title: '25. 50-60 LPA Capstone Architecture',
    category: 'module-9',
    categoryName: 'Module 9: 50-60 LPA Capstone Architecture',
    badge: '50-60 LPA Tier',
    summary: 'System design for Figma real-time canvas, Bloomberg HFT dashboards, Shopify RSC platforms, and Stripe design systems.',
    mechanics: [
      'Real-Time Collaboration: Combining Web Workers, OffscreenCanvas 60FPS rendering, and Yjs CRDTs.',
      'Sub-50ms INP Tuning: Time-slicing heavy renders via useTransition and virtualized canvas grids.',
      'Enterprise Micro-Frontends: Webpack Module Federation + Storybook WCAG AAA design systems.'
    ],
    scenario: {
      title: 'Figma & Bloomberg Scale Architectures',
      description: 'Demonstrating Staff/Lead Frontend Architect capabilities in top-tier tech interviews.'
    },
    code: `// Enterprise High-Frequency WebSocket Canvas Stream Pattern
export function HFTStreamEngine() {
  return <canvas id="hft-chart" />;
}`,
    pitfalls: [
      'Syntax Memorization vs System Design: 50-60 LPA roles hire for architecture, scale, and performance tuning.'
    ]
  }
];
