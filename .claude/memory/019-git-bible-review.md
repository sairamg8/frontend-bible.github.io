---
name: git-bible-review
description: First accuracy review of the new docs/git/ bible (6 files) - 3 real bugs found and fixed, no prior review pack existed for it.
metadata:
  type: project
---

# Git bible review (2026-07-31)

New `docs/git/` (6 files, matches `syllabus/git_bible_syllabus.txt`) appeared as untracked
alongside `.agy/memories/023_git_bible_created.json` - created outside this assistant's
sessions, no `review/` pack exists for it yet (unlike the 14 bibles in [[review-authentication]]).
Read all 6 files fresh and verified specific claims against real `git` behavior on this
machine (git 2.43.0) rather than trusting the prose.

## Real bugs found and fixed

1. **Fabricated hash-object output** - `docs/git/01-core-architecture/01-object-store-and-git-topology.md`.
   Example hashed real content (`console.log('Hello Git Internals');`) but showed the output
   as `e69de29bb2d1d6434b8b29ae775ad8c2e48c5391` - that's the famous well-known SHA-1 of an
   **empty** blob (verified: `printf "" | git hash-object --stdin` = that exact value), copy-pasted
   without actually running the command. Real output for that content, verified locally:
   `a0d9600b09c93836025512c026b3363a175f6375`. Fixed both the `hash-object` and `cat-file` output lines.
2. **Wrong merge engine name** - `docs/git/03-branching-merging-rebase/01-dag-traversal-merging-and-rebase.md`
   AND `syllabus/git_bible_syllabus.txt`. Both called it the "**Orort**" merge engine. Real Git
   strategy name is `ort` (verified against `git merge` docs on this machine: "ort when merging a
   single head"). The "Ostensibly Recursive's Twin" backronym attached to it was actually correct -
   only the name itself was garbled. Also softened an unverifiable "500x faster" claim to
   "workload-dependent, multiple-orders-of-magnitude in Git's own pathological-case benchmarks."
3. **Invalid `git worktree add` syntax** - `docs/git/05-enterprise-workflows-monorepos/01-worktrees-sparse-checkout-and-hooks.md`.
   `git worktree add ../hotfix-payment hotfix/fix-stripe-webhook origin/main` passes 3 positional
   args; real syntax is `git worktree add [-b <branch>] <path> [<commit-ish>]` (one commit-ish
   only). Verified this exact command errors with `usage: git worktree add...`. Fixed to
   `git worktree add -b hotfix/fix-stripe-webhook ../hotfix-payment origin/main`.

## Not flagged as bugs (checked, held up)

- `--force-with-lease` auto-fetch caveat: real, well-known gotcha, accurate.
- `gc.auto 6700`: matches Git's actual default (redundant as an "optimization" but not wrong).
- `.git-blame-ignore-revs` full-40-char-SHA usage: correct.
- Submodule detached-HEAD-on-`git submodule update` trap: accurate.
- SHA-1(40)/SHA-256(64) + `--object-format=sha256`: accurate.

## Verdict

Same failure mode as the original (non-grok) `review/` pack for the other 14 bibles: fluent,
well-structured prose with occasional fabricated/unverified specifics (a copy-pasted "famous"
hash, a garbled tool name, a plausible-looking but syntactically wrong command) that only surface
under adversarial, run-it-yourself checking - never trust CLI output or tool names in these docs
without executing them. `yarn build` clean after fixes.
