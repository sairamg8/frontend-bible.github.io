# 🔍 Forensics, History Scrubbing & Automated Debugging

> **Priority Badges Legend:**  
> 🟢 `[D]` **Daily driver** — expect to use weekly or more  
> 🟡 `[O]` **Occasional** — monthly-ish, situational but expected  
> 🔴 `[R]` **Rare-but-critical** — rarely touch it, but it saves you when things break  

---

## 1. Under-The-Hood Mechanics

### Binary Search Debugging (`git bisect`) 🔴 `[R]`
`git bisect` uses a binary search algorithm on the DAG topology to locate the exact commit that introduced a regression or bug in $O(\log N)$ time. Given 1,000 commits between a known working revision and a broken revision, `git bisect` isolates the culprit in ~10 steps.

### Deep Pickaxe Searches (`git log -S` / `-G`) 🟡 `[O]`
Unlike standard file searches, Git's pickaxe engine searches the diff tree across history.
- `git log -S "symbol"`: Matches commits where the number of occurrences of `"symbol"` changed (added or removed).
- `git log -G "regex"`: Matches commits where the diff block matches a regular expression.

### Line Author Inspection (`git blame`) 🟢 `[D]`
Inspects line-by-line commit authorship, timestamps, and commit hashes for any file in the workspace.

---

## 2. Real-World Engineering Scenario

An enterprise application experiences a subtle memory leak introduced somewhere in the last 500 commits. Manual inspection of 500 commits is impossible. By writing an automated test script (`test-memory-leak.sh`) that exits with code `0` (good) or code `1` (bad), `git bisect run` automatically checks out commits, runs the script, and pinpoints the breaking commit within 2 minutes.

---

## 3. Production-Grade Code & Command Examples

```bash
# 1. Daily Driver Line Blame 🟢 [D]
git blame -L 40,60 src/services/auth.ts

# 2. Automated Bisect Execution with Test Script 🔴 [R]
git bisect start
git bisect bad HEAD                # Current HEAD has the memory leak
git bisect good v2.4.0             # Release v2.4.0 was clean

git bisect run npm test -- --grep="Memory Leak Audit"
git bisect reset

# 3. History Scrubbing: Permanently Purge Secrets via git-filter-repo 🔴 [R]
git filter-repo --invert-paths --path .env --path config/private_key.pem

# 4. Git Blame Noise Exclusion (.git-blame-ignore-revs) 🟡 [O]
echo "a1b2c3d4e5f67890123456789012345678901234" >> .git-blame-ignore-revs
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### Deprecated `git filter-branch` vs Modern `git filter-repo` 🔴 `[R]`
`git filter-branch` is deprecated by the core Git team due to extreme execution slowness (taking hours on large repos) and unsafe ref updating behavior. Always use `git filter-repo`, which is written in Python, directly manipulates fast-import streams, and executes in seconds.

### Bisecting Through Unbuildable Commits 🔴 `[R]`
During a bisect run, if Git checks out an intermediate commit where the build is broken due to unrelated syntax errors, `git bisect run` will misinterpret exit codes.

**Solution**: Use `git bisect skip` or return exit code `125` from your test script when the commit cannot be tested, forcing Git to pick an adjacent commit.
