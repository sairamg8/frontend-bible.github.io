---
name: long-task-workflow-preferences
description: User's working-style preferences for long, multi-part tasks (like the 14-bible expansion) - autonomous continuation, per-unit memory checkpoints, save-on-request.
metadata:
  type: feedback
---

# Long-Task Workflow Preferences

Observed across the multi-session bible expansion effort ([005](005-redux-toolkit-expansion.md)
through [014](014-frontend-architecture-expansion.md)), consistently reinforced by the user's
own mid-task instructions rather than inferred:

## 1. Continue autonomously through a queue of similar sub-tasks - don't wait for re-prompting
When given a task that's really a queue of similar units of work (e.g. "expand each bible"),
and told things like "do not wait for me", "continue, I'm stepping out", and "if you're done
before I'm back, pick the next topic and continue filling the ecosystem" - treat that as
standing authorization to keep working through the ENTIRE remaining queue unprompted, not just
the next single item.
**Why:** explicitly stated mid-task, repeated in different words across multiple messages -
this is a strong, deliberate preference, not a one-off.
**How to apply:** once a queue-style task is defined and this kind of go-ahead is given, keep
executing every remaining item in the queue until it's genuinely exhausted, then stop and report
completion rather than assuming there's more to do (see [014](014-frontend-architecture-expansion.md)'s
closing note - don't invent new scope once the defined queue is empty).

## 2. Checkpoint memory at each completed unit, not just at the end
Explicitly requested: "update the memory when a chapter completes and continue." For a task
made of discrete units (one bible = one unit here), write/update a memory entry as EACH unit
finishes, rather than batching one big memory write at the very end.
**Why:** stated directly mid-task; also protects against losing all progress tracking if the
session is interrupted or compacted partway through a long queue.
**How to apply:** for any future multi-unit effort in this project, default to a memory file
per completed unit (plus an index.md line), even if no one asks again.

## 3. "Save progress" mid-task means write an exact resumability checkpoint, not a status summary
When asked to "save progress" partway through a unit (not at a clean boundary), the useful
memory is a concrete, file-by-file checkpoint of exactly what's done vs. pending (see
[007](007-nextjs-typescript-javascript-plan.md), which was updated this way mid-TypeScript/
JavaScript work) - specific enough that a future session (or a compaction) could resume without
re-deriving state from scratch.
**Why:** the point of the checkpoint is surviving context loss; a vague "made progress on X"
summary doesn't achieve that.
**How to apply:** when asked to save progress mid-unit, list exact file paths/sections
completed and exact ones remaining, not just a narrative summary.
