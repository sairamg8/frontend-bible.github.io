# ⚔️ Resolving a Merge Conflict End-to-End

> **Priority Badges Legend:**
> 🟢 `[D]` **Daily driver** — expect to use weekly or more
> 🟡 `[O]` **Occasional** — monthly-ish, situational but expected
> 🔴 `[R]` **Rare-but-critical** — rarely touch it, but it saves you when things break

---

## 1. Under-The-Hood Mechanics

A merge conflict happens when Git's 3-way merge (comparing branch tip A, branch tip B, and their common ancestor) finds that **both sides changed the exact same region of a file differently** — Git can't algorithmically pick a winner, so it stops mid-merge and hands the decision to you.

When this happens, Git writes **conflict markers** directly into the working-tree file, showing both versions inline:

```text
line1
<<<<<<< HEAD
line2-MAIN          ← your current branch's version, up to the ======= divider
=======
line2-FEATURE        ← the branch being merged in's version, up to the closing marker
>>>>>>> feature
line3
```

The repository is left in a special **merging state**: `git status` reports the conflicted file as `UU` (both sides modified, unmerged), and Git refuses `git commit` with a plain message until every conflicted file has been explicitly `git add`-ed — staging a previously-conflicted file is how you tell Git "I've resolved this one."

---

## 2. Real-World Engineering Scenario

**Scenario**: Two Engineers Independently Fix the Same Off-By-One Bug on the Same Line.
Engineer A and Engineer B both notice the same bug in `f.txt` on the same day, each fixes it on their own branch with a slightly different (but both technically valid) correction, and both branches get merged toward `main` — the second merge conflicts, because Git sees the same line changed two different ways since the branches' common ancestor and has no way to know which fix (or neither, or both combined) is the intended final state.

---

## 3. Production-Grade Command Sequence

```bash
# 1. The merge fails and tells you exactly what's wrong 🟢 [D]
git merge feature
# Auto-merging f.txt
# CONFLICT (content): Merge conflict in f.txt
# Automatic merge failed; fix conflicts and then commit the result.

# 2. See which files are conflicted — "UU" = both sides modified 🟢 [D]
git status --short
# UU f.txt

# 3. Open f.txt, look at the markers, and edit it into the state it SHOULD be —
# deleting the <<<<<<<, =======, and >>>>>>> lines entirely, not just picking one side blindly 🟢 [D]
#   line1
#   line2-MAIN-AND-FEATURE      <- manually reconciled, markers removed
#   line3

# 4. Stage the resolved file — this is what tells Git "this conflict is resolved" 🟢 [D]
git add f.txt
git status --short
# M  f.txt        <- no longer UU; it's now a normal staged modification

# 5. Complete the merge — the commit message is pre-filled by Git, --no-edit accepts it as-is 🟢 [D]
git commit --no-edit
# [main e810294] Merge branch 'feature'

git log --oneline --graph
#   *   e810294 Merge branch 'feature'
#   |\
#   | * 7c618ad feature change
#   * | 18fcb8b main change
#   |/
#   * 5449210 base
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Using `checkout --ours` / `--theirs` as a Blind Shortcut
```bash
# ⚠️ RISKY: this doesn't "smart merge" — it discards ALL of the other side's changes to this
# file entirely, including any lines that DIDN'T conflict. Fine for binary files or "one side
# is just definitively right," dangerous as a lazy default for text you haven't actually read.
git checkout --ours f.txt
git add f.txt
```
Prefer reading the actual markers and reconciling by hand (or with a proper 3-way mergetool) unless you're certain an entire file should come from exactly one side.

### ⚠️ Pitfall 2: Forgetting to `git add` After Editing, Then Committing Anyway
```bash
# ❌ Editing the file but skipping `git add` — the commit will REFUSE to proceed while unmerged
# paths remain, so this specific mistake is usually caught immediately, not silently wrong:
git commit -m "fixed it"
# error: Committing is not possible because you have unmerged files.
# hint: Fix them up in the work tree, and then use 'git add/rm <file>' ...

# ✅ Always git add the resolved file(s) before committing
git add f.txt && git commit --no-edit
```

### ⚠️ Pitfall 3: Not Knowing You Can Just Bail Out
```bash
# If a conflict is confusing or you started the merge by mistake, you are NOT stuck —
# this fully reverts the working tree to its exact pre-merge state:
git merge --abort

# (git merge --abort only works while still mid-conflict; once you've committed the merge,
# use `git revert -m 1 <merge-commit-sha>` instead to undo it after the fact)
```
