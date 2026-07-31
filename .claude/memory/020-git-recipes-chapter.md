---
name: git-recipes-chapter
description: Added SECTION 7 (Real-World Workflows & Recipes) to the git bible - a task-driven chapter distinct from the mechanics-driven sections 1-6, all 5 commands sandbox-verified before writing.
metadata:
  type: project
---

# Git bible: real-world recipes chapter (2026-07-31)

User's own trigger case: "I have a local project, want to connect it to a repo, and push -
where does the bible answer this?" Checked `docs/git/06-remotes-and-maintenance/` - it assumes
a remote already exists (covers `fetch`/`pull`/`--force-with-lease` only), never covers
`git remote add` or a first push. Confirmed real content gap (see [[git-bible-review]] for the
prior accuracy pass on sections 1-6).

## Structural decision

User wanted more scenarios like this as their own chapter, not folded into section 6. Added
**SECTION 7: Real-World Workflows & Recipes** to `syllabus/git_bible_syllabus.txt` and
`docs/git/07-real-world-workflows-and-recipes/` (5 files) - explicitly framed as task-driven
("how do I do X") rather than mechanics-driven (sections 1-6), matching how
`frontend-architecture` already deviates from the catalog format for a different reason.
File-per-topic-within-folder matches the deeper bibles' convention (react/js one-file-per-hook),
not the git bible's own prior one-file-per-section pattern (sections 1-6 only had 1 subtopic
each so far, so this wasn't previously tested).

## The 5 recipes (all commands run for real in a scratch sandbox before writing, not guessed)

1. `01-connecting-a-local-project-to-a-remote.md` - `git remote add`, why `-u` matters, unrelated-histories rejection.
2. `02-fork-and-upstream-sync.md` - origin (fork) + upstream (source) two-remote workflow, never push to upstream.
3. `03-recovering-from-an-accidental-force-push.md` - reflog-based recovery after a bad `reset --hard` + `push --force`. Caught my OWN error before publishing: `gc.pruneExpire` defaults to **2 weeks**, not 90 days (90 days is `gc.reflogExpire`, a different setting) - verified against `git help gc`/`git help config` before committing to the number.
4. `04-resolving-a-merge-conflict-end-to-end.md` - real conflict markers, `UU` status, `--abort` vs post-hoc `revert -m 1`.
5. `05-splitting-changes-into-focused-commits.md` - `git add -p`, and `git add -N` for patch-staging brand-new untracked files (verified `-p` alone silently skips untracked files).

## Process note

Same rigor as [[git-bible-review]] and [[punch-list-correctness-fixes]]: every command was
actually executed in `/tmp/.../scratchpad/git-recipe-test` (two bare repos simulating
origin/upstream) before being written into the docs, catching one real error (the GC expiry
mixup) pre-publish rather than post-review. `yarn build` clean. Also updated the one-line git
bible summaries in `docs/index.md` and `README.md` to mention the new recipes chapter.
