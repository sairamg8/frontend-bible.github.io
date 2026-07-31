# 🆘 Recovering From an Accidental Force-Push

> **Priority Badges Legend:**
> 🟢 `[D]` **Daily driver** — expect to use weekly or more
> 🟡 `[O]` **Occasional** — monthly-ish, situational but expected
> 🔴 `[R]` **Rare-but-critical** — rarely touch it, but it saves you when things break

---

## 1. Under-The-Hood Mechanics

The critical fact that makes this recovery possible at all: **Git almost never actually deletes objects immediately.** When a bad `git reset --hard` moves a branch pointer backward, the commits it used to point to don't vanish — they become **unreachable** (no ref points to them anymore), but the objects themselves stay in `.git/objects/` until garbage collection eventually prunes them (`git gc`'s default grace period for unreachable objects is **2 weeks**, via `gc.pruneExpire`; the reflog entries pointing at them separately default to a **90-day** expiry, via `gc.reflogExpire`).

`git reflog` is the map back to them: it's a **local-only** log of everywhere `HEAD` (and each branch ref) has pointed, in order — every commit, reset, rebase, and checkout leaves an entry. Reflog entries persist independently of the branch's current position, which is exactly why "the commit is gone" is almost always "the commit is unreachable, but its SHA is sitting right there in the reflog."

```text
Before accident:  main ──► C1 ──► C2 ──► C3   (reflog: HEAD@{0} = C3)
git reset --hard HEAD~2:
                   main ──► C1                (reflog: HEAD@{0} = C1, HEAD@{1} = C3 ← still logged!)
                                  ╲
                                   C2 ──► C3   (unreachable from any ref, but objects
                                               still physically exist in .git/objects/)
```

**Important scope note**: `git push --force` only rewrites the **remote's** ref pointer. It does not touch anyone else's local repository. If a teammate authored the commits that got force-pushed away, their own local branch almost always still has them intact — the fastest recovery is often just asking "does anyone still have this locally?" before reaching for reflog archaeology.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Bad `git reset --hard` Followed by a Force-Push, Wiping Two Merged Commits From the Shared Branch.
An engineer means to discard one bad local commit, runs `git reset --hard HEAD~2` instead (off-by-one), doesn't notice, makes an unrelated new commit, and force-pushes — silently overwriting two legitimate, already-shared commits on the remote with a history that never had them. Nobody else happened to have those two commits checked out locally at the time. The reflog on the original engineer's own machine is the only remaining trail back to them.

---

## 3. Production-Grade Recovery Sequence

```bash
# 1. Find the lost commit's SHA in your OWN local reflog 🔴 [R]
git reflog show HEAD --date=iso
# aa957dc HEAD@{2026-07-31 12:32}: commit: unrelated fix        <- current (bad) tip
# edadb47 HEAD@{2026-07-31 12:32}: reset: moving to HEAD~2      <- the accident
# 6575f67 HEAD@{2026-07-31 12:32}: commit: c3: add c.txt        <- LOST commit, still has a SHA
# 0b5b767 HEAD@{2026-07-31 12:32}: commit: c2: add b.txt        <- LOST commit, still has a SHA

# 2. Point a new branch at the last-good SHA before the accident — inspect it, confirm it's right 🔴 [R]
git branch recovery 6575f67
git log --oneline recovery
# 6575f67 c3: add c.txt
# 0b5b767 c2: add b.txt
# ... (rest of shared history)

# 3. Rebuild the intended history: the recovered commits PLUS whatever legitimate work
# happened after the accident (here, "unrelated fix") 🔴 [R]
git branch -f main-fixed recovery
git checkout main-fixed
git cherry-pick aa957dc     # replay the post-accident commit on top of the recovered history

# 4. Force-push the corrected history back — WITH LEASE, scoped to the exact bad SHA you're
# overwriting, so you can't accidentally clobber something a teammate pushed in the meantime 🔴 [R]
git push --force-with-lease=main:aa957dc origin main-fixed:main
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Reaching for Reflog Recovery Before Checking If a Teammate Has It Locally
Reflog is **per-clone** — it does not exist on the remote server and isn't shared. If the commits were authored by someone else and they still have their local branch sitting on top of them, `git push origin their-branch --force-with-lease` from *their* machine is instant and risk-free. Spend 30 seconds asking before spending 30 minutes on SHA archaeology.

### ⚠️ Pitfall 2: Trusting Reflog After It's Expired
```bash
# ❌ WRONG assumption: reflog entries are permanent
# Reality: unreachable OBJECTS expire via gc.pruneExpire (default 2 weeks), and the REFLOG
# ENTRIES pointing at them expire separately via gc.reflogExpire (default 90 days) — either
# clock running out means an old-enough accident may already be gone by the time someone checks
git reflog expire --expire=now --all && git gc --prune=now
# ⚠️ Running this INTENTIONALLY (e.g. as repo maintenance) destroys recovery options for anything
# currently unreachable — never run it while an active recovery is in progress
```

### ⚠️ Pitfall 3: Force-Pushing the Fix Without `--force-with-lease`, Compounding the Damage
```bash
# ❌ WRONG: a bare --force during recovery can overwrite work a teammate pushed
# to the SAME branch in the window between the accident and your fix
git push --force origin main-fixed:main

# ✅ CORRECT: lease against the exact bad SHA you know is currently on the remote —
# if the remote has moved since (someone else pushed), this is REJECTED instead of overwriting it
git push --force-with-lease=main:aa957dc origin main-fixed:main
```
