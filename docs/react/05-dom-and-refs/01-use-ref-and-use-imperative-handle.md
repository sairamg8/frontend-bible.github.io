# ⚛️ `useRef` & `useImperativeHandle`: Escape Hatches & Imperative APIs

## 1. Under-The-Hood Mechanics

### `useRef` (Persistent Mutable Container)
`useRef` returns a plain JavaScript object `{ current: initialValue }` attached to the Fiber node's `memoizedState`.

The two defining characteristics of `useRef` are:
1. **Mutation Persistence**: Changing `ref.current = newValue` does **NOT trigger a re-render pass** of the component.
2. **Identity Stability**: The `{ current: ... }` object reference remains **100% identical** across every re-render of the component lifecycle.

### React 19 Ref Props & Callback Cleanups
- In React 19, `forwardRef` is deprecated! You can now pass `ref` directly as a standard prop to function components `<MyComponent ref={myRef} />`.
- React 19 ref callbacks support **cleanup functions**:

```tsx
// React 19 Ref Callback Cleanup
<div ref={(node) => {
  if (node) console.log('DOM node attached:', node);
  return () => console.log('DOM node detached!'); // Cleanup callback on unmount
}} />
```

### `useImperativeHandle`
`useImperativeHandle` customizes the ref handle object exposed to parent components, allowing component authors to encapsulate internal DOM nodes while exposing limited imperative methods (e.g. `play()`, `pause()`, `focus()`, `scrollToBottom()`).

---

## 2. Real-World Engineering Scenario

**Scenario**: High-Performance Canvas 2D Renderer / Video Player Imperative Controller.
In an interactive graphics engine (like Figma or an audio/video editor), components must directly command underlying DOM nodes (`HTMLCanvasElement` or `HTMLVideoElement`) to draw 60 FPS frames without triggering React re-renders.

---

## 3. Production-Grade Code Example

```tsx
import React, { useRef, useImperativeHandle } from 'react';

// 1. Interface for exposed imperative handle methods
export interface VideoPlayerHandle {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number) => void;
}

// 2. Component accepting ref directly as a prop (React 19 pattern!)
export function ImperativeVideoPlayer({
  src,
  ref,
}: {
  src: string;
  ref?: React.Ref<VideoPlayerHandle>;
}) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);

  // 3. Expose restricted imperative methods to parent
  useImperativeHandle(
    ref,
    () => ({
      playVideo: () => {
        internalVideoRef.current?.play();
      },
      pauseVideo: () => {
        internalVideoRef.current?.pause();
      },
      seekTo: (seconds: number) => {
        if (internalVideoRef.current) {
          internalVideoRef.current.currentTime = seconds;
        }
      },
    }),
    []
  );

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl max-w-md text-white">
      {/* React 19 ref callback with cleanup */}
      <video
        ref={(node) => {
          internalVideoRef.current = node;
          if (node) console.log('[DOM] Video element attached to DOM');
          return () => console.log('[DOM] Video element unmounted cleanup!');
        }}
        src={src}
        controls={false}
        className="w-full h-40 bg-black rounded"
      />
    </div>
  );
}

// 4. Parent Component exercising imperative controls
export function VideoControlDashboard() {
  const playerRef = useRef<VideoPlayerHandle>(null);

  return (
    <div className="p-6 bg-slate-950 text-white space-y-4 max-w-md">
      <h3 className="font-bold text-sm text-cyan-400">Media Controller</h3>
      
      <ImperativeVideoPlayer
        ref={playerRef}
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      />

      <div className="flex gap-2 text-xs font-mono">
        <button
          onClick={() => playerRef.current?.playVideo()}
          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded font-bold"
        >
          ▶ Play
        </button>
        <button
          onClick={() => playerRef.current?.pauseVideo()}
          className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 rounded font-bold"
        >
          ⏸ Pause
        </button>
        <button
          onClick={() => playerRef.current?.seekTo(10)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded"
        >
          ⏩ Jump to 10s
        </button>
      </div>
    </div>
  );
}
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Reading/Writing `ref.current` During Render Phase
Never read or mutate `ref.current` directly inside the top-level body of a component render function!
```tsx
// ❌ WRONG: Non-deterministic rendering behavior
function BadComponent() {
  const countRef = useRef(0);
  countRef.current += 1; // MUTATION DURING RENDER! Breaks Concurrent Mode & StrictMode!

  return <div>{countRef.current}</div>; // READING REF IN RENDER BODY!
}

// ✅ CORRECT: Mutate ref.current inside useEffect or event handlers ONLY
useEffect(() => {
  countRef.current += 1;
});
```

### ⚠️ Pitfall 2: Overusing Imperative Escape Hatches
Refs are escape hatches. Do not use refs to manipulate DOM nodes for state that React should declaratively manage (e.g. manually setting `element.style.display = 'none'` instead of using React state conditional rendering).
