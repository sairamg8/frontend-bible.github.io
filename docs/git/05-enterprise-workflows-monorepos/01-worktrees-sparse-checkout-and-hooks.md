# 🏢 Enterprise Workflows, Monorepos & Git Worktrees

> **Priority Badges Legend:**  
> 🟢 `[D]` **Daily driver** — expect to use weekly or more  
> 🟡 `[O]` **Occasional** — monthly-ish, situational but expected  
> 🔴 `[R]` **Rare-but-critical** — rarely touch it, but it saves you when things break  

---

## 1. Under-The-Hood Mechanics

### Git Worktrees (`git worktree`) 🟡 `[O]`
Traditionally, switching branches requires mutating the working tree in-place (`git checkout`), which triggers node_modules re-indexing, build cache invalidation, and lost context. 

`git worktree` enables attaching **multiple working directories to a single underlying `.git` object database**. Each worktree has its own isolated working tree, index file, and `HEAD` pointer, while sharing commits, blobs, and ref logs.

```text
/home/user/project/
├── .git/                      # Central object store & refs
├── main-repo/                 # Worktree 1 (branch: main)
├── feature-auth/              # Worktree 2 (branch: feature/auth)
└── hotfix-bug/                # Worktree 3 (branch: hotfix/prod-bug)
```

### Sparse-Checkout Engine & Scalar 🟡 `[O]`
In massive monorepos containing gigabytes of code, checking out every directory slows down IDE file indexers. `git sparse-checkout` uses cone mode patterns to restrict working tree extraction strictly to specified directories while retaining repository integrity.

### Git Lifecycle Hooks Automation 🟢 `[D]`
Client-side hooks (`pre-commit`, `commit-msg`, `pre-push`) execute scripts locally before actions complete, verifying formatting, linting, and conventional commit standards.

---

## 2. Real-World Engineering Scenario

A senior developer is mid-way through a multi-day refactor in a large monorepo when a critical production P0 hotfix is reported. Instead of stashing changes (`git stash`), risking stash pollution or triggering slow `node_modules` rebuilds, the developer creates a parallel worktree in 1 second, fixes and pushes the hotfix, and deletes the worktree.

---

## 3. Production-Grade Code & Command Examples

```bash
# 1. Git Worktree Operations 🟡 [O]
git worktree add -b hotfix/fix-stripe-webhook ../hotfix-payment origin/main

cd ../hotfix-payment
yarn test
git commit -am "fix(stripe): handle webhook signature verification timeout"
git push origin hotfix/fix-stripe-webhook

cd ../main-repo
git worktree remove ../hotfix-payment

# 2. Sparse-Checkout Configuration for Monorepos 🟡 [O]
git clone --filter=blob:none --no-checkout https://github.com/org/monorepo.git
cd monorepo
git sparse-checkout init --cone
git sparse-checkout set packages/frontend-app packages/shared-ui

# 3. Client-Side Commit Hook Enforcement (.git/hooks/commit-msg) 🟢 [D]
#!/bin/bash
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat $COMMIT_MSG_FILE)
PATTERN="^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"

if ! [[ "$COMMIT_MSG" =~ $PATTERN ]]; then
  echo "❌ ERROR: Commit message does not match Conventional Commits format!"
  echo "Example: feat(auth): add OAuth2 provider support"
  exit 1
fi
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### Worktree Branch Locking 🟡 `[O]`
Git prevents checking out the same branch in two active worktrees simultaneously to avoid index corruption and conflicting ref updates. If you attempt to checkout an already active branch, Git errors with `fatal: 'feature-auth' is already checked out at '/path/to/worktree'`.

### Submodule Detached HEAD Trap 🟡 `[O]`
When running `git submodule update`, Git checks out submodules in a **detached HEAD state** at the specific commit recorded in the parent repository. If a developer commits directly inside a submodule without switching to a branch first, those commits are orphan commits that will be lost on the next `git submodule update`. Always run `git checkout main` inside the submodule directory before committing.
