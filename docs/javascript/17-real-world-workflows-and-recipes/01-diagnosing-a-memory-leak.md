# ⚡ Diagnosing a Memory Leak in a Long-Running Page, End-to-End

## 1. Under-The-Hood Mechanics

Knowing the leak **patterns** (forgotten listeners, detached DOM, unbounded caches — see the [garbage collection doc](../09-memory-management/01-garbage-collection-and-weak-refs.md)) doesn't tell you which one is happening, or where, in an actual running page. That's a separate skill: using Chrome DevTools' Memory panel to go from "memory keeps growing" to "this exact object, held alive by this exact reference chain."

```text
1. CONFIRM it's a real leak, not just normal usage    →  DevTools Performance Monitor / Task Manager,
                                                            watch JS heap size over a repeated action
2. CAPTURE two heap snapshots around the suspected     →  DevTools Memory panel, "Heap snapshot" type,
   leaky action, repeated several times                    before/after, with a forced GC in between
3. COMPARE the two snapshots                            →  "Comparison" view, sorted by "# Delta" —
                                                              objects that shouldn't still be growing
4. TRACE the retainer chain for a growing object type   →  the Retainers pane — WHAT is holding this
                                                              object alive, back to a GC root
```

### Why You Force a Garbage Collection Before Comparing
The heap between two arbitrary points in time naturally contains plenty of garbage that just hasn't been swept yet — comparing two snapshots without forcing collection first mixes "genuinely leaked, permanently reachable" objects together with "temporarily unreachable, about to be collected anyway" noise, making the comparison far less clean. DevTools' Memory panel has a dedicated "force garbage collection" button (a trash can icon) specifically so a snapshot reflects only what's genuinely still reachable.

### Why You Repeat the Suspected Action Several Times, Not Once
A single leaked object is often too small to distinguish from normal heap noise in a diff. Repeating the suspected leaky action (open/close a modal 10 times, navigate to a route and away 10 times) turns a single-object leak into a clearly visible **10x** delta in the comparison view — the repetition amplifies a real leak into an unmistakable signal.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Dashboard That Gets Sluggish After a Few Hours, Traced to a Chart Library's Event Listener.
Users report the dashboard becomes progressively laggier the longer they leave it open in a background tab, eventually needing a manual refresh — no crash, no error, just gradual slowdown. The team can't reproduce it quickly by just "using the app normally" for a few minutes. Simulating the suspected trigger — switching between dashboard tabs, which mounts/unmounts a chart component repeatedly — 20 times in a row, then comparing before/after heap snapshots, makes the leak obvious: a `ChartInstance` constructor shows a `# Delta` of exactly +20, matching the repeat count precisely. The Retainers pane traces each surviving instance back to a `resize` listener registered on `window` by the charting library's mount logic, never removed on unmount — the exact "forgotten listener" pattern, just previously invisible because a few hours of real, varied usage produces far noisier growth than 20 repeats of ONE isolated action.

---

## 3. Production-Grade Diagnostic Sequence

```text
# Step 1: CONFIRM there's a real leak before deep-diving
1. Open the suspect page
2. Chrome menu -> More Tools -> Task Manager (or Shift+Esc) — watch "JS Memory" for that tab
3. Perform the suspected leaky action repeatedly (open/close a modal, navigate back and forth)
4. If JS Memory climbs and NEVER drops back down (even after a manual GC), that's a real leak —
   normal usage causes memory to fluctuate but return to a stable baseline after GC runs
```

```text
# Step 2: CAPTURE two comparable snapshots
1. DevTools -> Memory tab -> select "Heap snapshot" -> Take snapshot ("Snapshot 1" — baseline)
2. Perform the suspected leaky action 10-20 times (repetition is what makes a small leak visible)
3. Click the force-garbage-collection icon (trash can) to clear genuinely-collectable garbage
4. Take a second snapshot ("Snapshot 2")
```

```text
# Step 3: COMPARE — this is where the actual culprit becomes visible
1. Select Snapshot 2 in the left panel
2. Change the view dropdown from "Summary" to "Comparison"
3. Set the comparison baseline to Snapshot 1
4. Sort by "# Delta" (descending) — a constructor/class showing a delta matching (or close to)
   how many times you repeated the action is the leak candidate, not incidental noise
```

```text
# Step 4: TRACE the retainer chain — WHY is this object still alive
1. Expand the suspect constructor's entries in the Comparison view
2. Click one specific surviving instance
3. The bottom "Retainers" pane shows the ACTUAL reference chain keeping it alive, e.g.:
   ChartInstance -> (closure) resizeHandler -> (event listener) window
4. This tells you EXACTLY where to fix it: window.addEventListener('resize', ...) was never
   paired with a removeEventListener on the component's unmount/cleanup
```

```javascript
// Step 5: FIX, targeted at what the retainer chain actually showed
// ❌ BEFORE: the listener closure keeps `this` (and everything it references) alive forever,
// regardless of whether the chart's DOM element still exists
class ChartInstance {
  constructor(el) {
    this.el = el;
    window.addEventListener('resize', () => this.redraw()); // never removed
  }
}

// ✅ AFTER: store the handler reference so it CAN be removed, and actually remove it on cleanup
class ChartInstance {
  constructor(el) {
    this.el = el;
    this.handleResize = () => this.redraw();
    window.addEventListener('resize', this.handleResize);
  }
  destroy() {
    window.removeEventListener('resize', this.handleResize); // breaks the retaining chain
  }
}
```

```text
# Step 6: RE-VERIFY — repeat Steps 2-3 with the fix in place; the delta for the
# previously-growing constructor should now be ~0 after the same repeated action
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Comparing Snapshots Without Forcing GC First
```text
❌ RISKY: skipping the forced-GC step before each snapshot means the comparison includes
objects that are ALREADY unreachable and about to be collected anyway — inflating the delta
with noise that has nothing to do with an actual leak, and potentially masking the real
signal underneath it
```

### ⚠️ Pitfall 2: Testing Only a Fresh Page Load, Never a Long Session
A leak that adds a small, constant amount of retained memory per repeated action might be genuinely imperceptible over a 2-minute manual test but becomes seriously disruptive over the multi-hour sessions real users (especially those who leave a dashboard/tab open all day) actually have. The repeated-action amplification technique (Step 2) exists specifically to compress "would take hours to notice organically" into "visible in a two-minute DevTools session."

### ⚠️ Pitfall 3: Fixing the First Growing Constructor Without Checking If It's Actually the Root Cause
Sometimes the constructor with the biggest `# Delta` is itself just a downstream victim — retained ONLY because something else (the real leak) is holding a reference to a parent object that happens to also reference many instances of this one. Following the Retainers chain (Step 4) all the way back, rather than stopping at the first object in the list, is what distinguishes the actual root cause from an object that's merely along for the ride.

### ⚠️ Pitfall 4: Assuming a Growing Heap Always Means a Bug
Some genuine growth is expected and correct — a cache that's SUPPOSED to accumulate entries as a user browses more content, up to some intentional bound, isn't a leak; it's working as designed. The distinguishing question isn't "did memory grow" but "does it grow WITHOUT BOUND, for objects that should have gone out of scope" — a `WeakMap`-based cache growing alongside genuinely-still-referenced objects is fine; the same growth for objects that were supposed to be unmounted/removed is the actual bug.
