# 🔀 Branching, Merging & Interactive Rebase Mechanics

> **Priority Badges Legend:**  
> 🟢 `[D]` **Daily driver** — expect to use weekly or more  
> 🟡 `[O]` **Occasional** — monthly-ish, situational but expected  
> 🔴 `[R]` **Rare-but-critical** — rarely touch it, but it saves you when things break  

---

## 1. Under-The-Hood Mechanics

### Branch References & DAG Topology 🟡 `[O]`
A branch in Git is simply a lightweight, mutable pointer (a 41-byte text file inside `.git/refs/heads/<branch-name>`) referencing a commit object SHA. Creating a branch (`git branch feature`) takes 0.001ms because it only creates a text file containing the current commit hash.

### Merge Engines & 3-Way Merge Mechanics 🟢 `[D]` / 🔴 `[R]`
When merging two non-linear branches (Feature into Main):
1. **Fast-Forward Merge 🟢 `[D]`**: Advancing branch pointers without creating a merge commit when history is linear.
2. **3-Way Merge 🟢 `[D]`**: Combining branch tip A, branch tip B, and common merge base with merge commit generation.
3. **`ort` Merge Engine 🔴 `[R]`**: Modern Git (v2.34+) uses the **`ort`** ("Ostensibly Recursive's Twin") merge engine as the default for regular merges, dramatically faster than the legacy `recursive` strategy in rename-heavy and directory-restructuring merges — the exact speedup is workload-dependent, but Git's own benchmarks on pathological rename cases showed multiple-orders-of-magnitude gains, not a fixed universal multiplier.

```text
       (Merge Base: C1)
           ┌──────► C2 ──────► C3 (main)
           │                    ▲
  C0 ──────┴──────► C4 ──────► C5 (feature)
                                (Merge Commit C6)
```

### Interactive Rebase Mechanics (`git rebase -i`) 🟢 `[D]`
Rebase rewrites history by calculating the delta of commits on the current branch relative to the target upstream commit, saving those deltas as temporary patches, and applying them sequentially onto the target upstream tip to create **new commit objects with new SHAs**.

---

## 2. Real-World Engineering Scenario

In enterprise teams, maintaining a clean, linear commit history before merging Pull Requests is critical for bisecting regressions and automated changelog generation. Rebase allows developers to clean up messy local work (`wip`, `fix typo`, `refactor`) into atomic logical commits via `squash` and `fixup`.

---

## 3. Production-Grade Code & Command Examples

```bash
# 1. Interactive Rebase onto origin/main 🟢 [D]
git fetch origin
git rebase -i origin/main

# Rebase Todo List example:
# pick a1b2c3d feat(auth): add JWT token refresh handler
# fixup d4e5f6a fix lint error in auth handler
# squash f7g8h9i docs(auth): document token rotation flow

# 2. Rebase onto a different branch tip (--onto) 🟡 [O]
# Syntax: git rebase --onto <new-base> <old-base> <branch>
git rebase --onto main feature-v1 feature-v2

# 3. Reflog Recovery (Restoring lost commits after accidental hard reset) 🔴 [R]
git reflog
# Output:
# 4f8b912 HEAD@{0}: reset: moving to HEAD~3
# a9c8e10 HEAD@{1}: commit: feat(user): implement avatar upload

# Restore lost commit:
git reset --hard a9c8e10
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### The Golden Rule of Rebase 🟢 `[D]`
**Never rebase commits that have been pushed to shared public remote branches.** Rebasing changes commit SHAs. If team members have based work on original SHAs, rebasing creates duplicate parallel commits and severe merge conflicts for the entire team.

### Ghost Conflict Loops during Rebase 🟡 `[O]`
If a rebase encounters conflicts across 10 sequential commits, resolving the conflict on commit #1 may cause repeated conflicts on commits #2–#10.

**Solution**: Use `git rerere` (Reuse Recorded Resolution):
```bash
git config --global rerere.enabled true
```
When enabled, Git records how you resolved a conflict snippet and automatically applies the exact same resolution when the conflict recurs.
