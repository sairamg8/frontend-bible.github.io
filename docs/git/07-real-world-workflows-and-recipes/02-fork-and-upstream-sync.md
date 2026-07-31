# 🍴 Fork & Upstream Sync Workflow

> **Priority Badges Legend:**
> 🟢 `[D]` **Daily driver** — expect to use weekly or more
> 🟡 `[O]` **Occasional** — monthly-ish, situational but expected
> 🔴 `[R]` **Rare-but-critical** — rarely touch it, but it saves you when things break

---

## 1. Under-The-Hood Mechanics

Contributing to a repo you don't have write access to (most open-source projects, or an internal repo where only maintainers can push directly) uses a **fork**: a full copy of the repo under your own account, which you *do* have push access to. This workflow needs **two remotes** on your local clone, not one:

- **`origin`** — your fork (`github.com/you/project`). You push your work-in-progress branches here; PRs are opened from here into upstream.
- **`upstream`** — the original repo (`github.com/original-org/project`). You only ever `fetch` from this, never push to it (you usually don't have permission anyway).

```text
upstream/project (source of truth, you fetch-only)
        │
        │  fork (one-time, on GitHub's servers)
        ▼
origin = your-username/project  ◄──── git clone ────  your local machine
        ▲                                                      │
        └──────────────── git push (your branches) ────────────┘
```

### Why Not Just Keep Pulling From `origin`?
Your fork's `main` branch only updates when **you** sync it — GitHub doesn't auto-update forks. If you only ever `git pull origin main`, you're pulling your own fork's stale copy, not the original project's actual latest state. `upstream` is what gives you a direct line to the real, currently-evolving source.

---

## 2. Real-World Engineering Scenario

**Scenario**: Contributing a Bug Fix to an Open-Source Library Three Months After Forking It.
An engineer forked a library three months ago to submit one PR, which got merged. Now they want to fix a different bug — but their fork's `main` is three months stale, and branching a fix off of it would carry a three-month-old baseline into the PR, creating unrelated merge noise when the maintainers eventually merge it. Syncing `upstream/main` into the fork's `main` first means the new fix branch starts from the actual current state of the project, producing a clean, easily-reviewable diff.

---

## 3. Production-Grade Command Sequence

```bash
# 1. Clone YOUR fork (not the original) — this becomes "origin" automatically 🟢 [D]
git clone https://github.com/your-username/project.git
cd project

# 2. Register the ORIGINAL repo as a second remote, "upstream" 🟢 [D]
git remote add upstream https://github.com/original-org/project.git
git remote -v
# origin    https://github.com/your-username/project.git (fetch/push)
# upstream  https://github.com/original-org/project.git (fetch/push — but you won't push here)

# 3. Sync your local main with upstream's CURRENT state 🟢 [D]
git checkout main
git fetch upstream
git merge upstream/main   # or: git rebase upstream/main, if you prefer linear history

# 4. Push the synced main back to YOUR fork, so origin/main matches upstream/main too 🟡 [O]
git push origin main

# 5. NOW branch your fix off the freshly-synced main 🟢 [D]
git checkout -b fix/null-pointer-in-parser
# ... make changes, commit ...
git push -u origin fix/null-pointer-in-parser
# Open the PR from your-username:fix/null-pointer-in-parser -> original-org:main
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Accidentally Trying to Push to `upstream`
```bash
# ❌ WRONG: you almost never have write access to the original repo
git push upstream main
# remote: Permission to original-org/project.git denied to your-username.
# fatal: unable to access ... The requested URL returned error: 403

# ✅ CORRECT: sync FROM upstream, push TO origin (your fork)
git fetch upstream && git merge upstream/main
git push origin main
```

### ⚠️ Pitfall 2: A Diverged Fork `main` Needing Force-Push — Only Ever to `origin`
If your fork's `main` was pushed to directly at some point (rather than only ever merged from `upstream`), a later sync can produce a history that needs `--force` to reconcile on your fork. This is safe **only** because it's your own fork:
```bash
git fetch upstream
git reset --hard upstream/main   # local main now EXACTLY matches upstream/main
git push --force origin main     # rewrite YOUR fork's main to match — never do this to upstream
```
Force-pushing here is fine specifically because `origin` is your fork and nobody else's work lives on it; the same command aimed at a shared team repo's `main` would be the exact catastrophic mistake `--force-with-lease` exists to prevent (see the remotes & maintenance chapter).

### ⚠️ Pitfall 3: PR Branch Built on Stale `main` Carries Unrelated Diff Noise
Branching your fix directly off an unsynced fork `main` (skipping steps 3-4 above) means your PR's diff includes every commit upstream has merged since your fork was last synced, even though none of it is your work — reviewers see a huge, confusing diff instead of just your actual change. Always sync `main` with `upstream` **before** cutting a new feature/fix branch, not after.
