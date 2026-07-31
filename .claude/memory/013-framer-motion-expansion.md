---
name: framer-motion-expansion
description: Framer Motion bible expanded from a single stub file into 15 folders/files, 1:1 with syllabus sections.
metadata:
  type: project
---

# Framer Motion Bible Expansion

Continuing the ecosystem-filling work after [012](012-storybook-expansion.md). Only
frontend-architecture remains after this one.

## Structure Created
15 folders, 15 files, 1:1 with `syllabus/framer_motion_bible_syllabus.txt`'s 15 sections:
01-core-concepts (motion.div drop-in, motion(Component) forwardRef requirement),
02-basic-animation-props (initial/animate/exit/transition, animate re-evaluates on every
render enabling correct mid-animation reversal), 03-transition-types (tween vs spring vs
inertia - spring's natural interruptibility is why it's the default), 04-variants (named
states, staggerChildren orchestration on the PARENT, propagation requiring matching key
names), 05-gestures (whileHover/whileTap/whileFocus, drag/dragConstraints/dragElastic),
06-animatepresence (React unmounts synchronously - AnimatePresence is what delays removal
for exit to play; mode sync/wait/popLayout), 07-layout-animations (FLIP technique
explained step by step, layoutId shared/magic-move transitions), 08-scroll-linked-animations
(whileInView discrete trigger vs useScroll+useTransform continuous drive), 09-motion-values
(useMotionValue bypasses React's render cycle entirely - the key perf mechanism, .get()
during render is a common stale-read bug), 10-animation-controls (useAnimate awaitable
sequencing, useAnimation for imperative variant triggers), 11-keyframes (array syntax,
times array for non-uniform pacing), 12-svg-animations (pathLength stroke-drawing effect,
morphing caveat on mismatched point counts), 13-orchestration-and-staggering
(staggerDirection, custom prop + variant functions for non-sequential/distance-based
stagger), 14-performance-considerations (transform/opacity GPU-composited vs
width/top/left triggering layout every frame, will-change tradeoffs), 15-advanced-patterns
(Next.js App Router client-boundary isolation for AnimatePresence, useReducedMotion
accessibility).

## Housekeeping
- Old stub `docs/framer-motion/01-animation-engine.md` deleted (untracked in git).
- `docs/index.md` link updated to `./framer-motion/01-core-concepts/01-declarative-animation-philosophy.md`.
- `yarn build` verified clean.

## Remaining gap
Only 1 bible still stub-depth: frontend-architecture. This is the LAST one - once done,
all 14 bibles in the syllabus inventory ([001](001-bible-syllabus-inventory.md)) will be
at full per-concept depth.
