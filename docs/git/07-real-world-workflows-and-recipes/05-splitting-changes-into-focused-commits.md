# ✂️ Splitting Mixed Changes Into Focused Commits

> **Priority Badges Legend:**
> 🟢 `[D]` **Daily driver** — expect to use weekly or more
> 🟡 `[O]` **Occasional** — monthly-ish, situational but expected
> 🔴 `[R]` **Rare-but-critical** — rarely touch it, but it saves you when things break

---

## 1. Under-The-Hood Mechanics

`git add <file>` stages the **entire current working-tree state** of that file. `git add -p <file>` (patch mode) instead walks the file's diff **hunk by hunk**, asking `y`/`n`/`s` (split further)/`e` (manually edit the hunk) for each one — letting you stage only *part* of a modified file's changes, while the rest stays unstaged for a later, separate commit.

This only operates on changes to **already-tracked** files by default. A brand-new, fully untracked file has no "diff against what's in the index" for patch mode to walk — `git add -p` simply won't offer it. `git add -N <file>` (`--intent-to-add`) solves this: it registers the file as tracked-with-empty-content in the index *without* staging any of its actual content, which makes the entire new file appear as one big "addition" diff — now patch-stageable like any other change.

```text
Working tree: tracked.txt (modified) + new.txt (brand new, untracked)
                      │
        git add -p tracked.txt   ──►  only SOME hunks of tracked.txt staged
        git add -N new.txt       ──►  new.txt now has an empty index entry — diffable
        git add -p new.txt       ──►  now ITS hunks can be selectively staged too
```

---

## 2. Real-World Engineering Scenario

**Scenario**: An Hour of Work That Accidentally Became Two Unrelated Changes.
While fixing a specific bug, an engineer notices an unrelated typo in a comment three lines away and fixes that too, then adds a small new utility file while they're at it — all in the same working-tree state, none of it staged yet. Committing all of it as one `git commit -am "fix bug"` would bury the typo fix and the new utility inside a commit whose message and diff no longer match each other, making `git blame`, `git bisect`, and code review all harder for anyone who looks at this later. Splitting it into three focused commits — one per logical change — keeps history genuinely useful.

---

## 3. Production-Grade Command Sequence

```bash
# Working tree has: tracked.txt modified (bug fix), new.txt (untracked, a genuinely separate addition)
git status --short
#  M tracked.txt
# ?? new.txt

# 1. Patch-stage ONLY the bug-fix hunk(s) from the modified file 🟢 [D]
git add -p tracked.txt
# diff --git a/tracked.txt b/tracked.txt
# @@ -1,3 +1,3 @@
#  a
# -b
# +b-CHANGED
#  c
# (1/1) Stage this hunk [y,n,q,a,d,e,?]? y

# 2. Commit JUST that — a focused, reviewable, revertible unit 🟢 [D]
git commit -m "fix: correct off-by-one in tracked.txt"

# 3. The new file is still sitting there untouched, uncommitted 🟢 [D]
git status --short
# ?? new.txt

# 4. Register it as an empty tracked entry so patch mode can see it 🟡 [O]
git add -N new.txt
git add -p new.txt
# diff --git a/new.txt b/new.txt
# new file mode 100644
# @@ -0,0 +1,2 @@
# +new file content
# +second line
# (1/1) Stage addition [y,n,q,a,d,e,?]? y

# 5. Second, separately-reviewable commit 🟢 [D]
git commit -m "feat: add new utility file"

git log --oneline
# db4d2b3 fix: correct off-by-one in tracked.txt
# ... (new.txt commit, separately)
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Assuming `git add -p` Alone Handles New Files
```bash
# ❌ WRONG: new.txt is untracked; `-p` on it (or globally) silently skips it, no hunks offered
git add -p
# (walks tracked.txt's hunks, never mentions new.txt at all)

# ✅ CORRECT: git add -N first, THEN -p can walk its content as an "addition" diff
git add -N new.txt && git add -p new.txt
```

### ⚠️ Pitfall 2: `git commit -am` Erasing the Whole Point
```bash
# ❌ WRONG: -a stages EVERY modified tracked file's ENTIRE current state, bypassing whatever
# you carefully patch-staged — this defeats the purpose of splitting changes in the first place
git add -p tracked.txt   # carefully stage just one hunk...
git commit -am "fix bug"  # ...then -a silently ALSO stages every other unstaged change. Oops.

# ✅ CORRECT: once you've patch-staged exactly what you want, commit WITHOUT -a
git commit -m "fix: correct off-by-one in tracked.txt"
```

### ⚠️ Pitfall 3: A Hunk Still Too Coarse — Splitting or Editing It Further
If a single hunk mixes the bug fix with an unrelated adjacent-line change, `s` (split, when the hunk is divisible into smaller ones) or `e` (manually edit the patch text before it's applied) at the `git add -p` prompt goes finer than whole-hunk granularity — useful when two genuinely unrelated one-line changes happen to sit right next to each other in the same diff hunk.
