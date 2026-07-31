# 🔧 Git Core Architecture & Object Engine

> **Priority Badges Legend:**  
> 🟢 `[D]` **Daily driver** — expect to use weekly or more  
> 🟡 `[O]` **Occasional** — monthly-ish, situational but expected  
> 🔴 `[R]` **Rare-but-critical** — rarely touch it, but it saves you when things break  

---

## 1. Under-The-Hood Mechanics

Git is fundamentally a **content-addressable filesystem** built on top of a Directed Acyclic Graph (DAG) of immutable cryptographic objects. Rather than storing file diffs or deltas, Git captures snapshots of the directory structure over time.

### The Four Core Object Types

All objects in Git reside inside `.git/objects/` identified by their SHA-1 (40-char) or SHA-256 (64-char) hash. Objects are compressed using zlib and consist of a header format: `<type> <size>\0<payload>`.

```text
       ┌─────────────┐
       │ Commit Object│  (Author, Committer, Commit Message, Timestamp)
       └──────┬──────┘
              │ points to
              ▼
       ┌─────────────┐
       │ Tree Object │  (Directory listing: Mode + Path + Object SHA)
       └──────┬──────┘
              │
      ┌───────┴───────┐
      ▼               ▼
┌───────────┐   ┌───────────┐
│Blob Object│   │Sub-Tree   │
└───────────┘   └───────────┘
```

1. **Blob Objects 🔴 `[R]`**: Contain raw file content only. File names, execution permissions, and directory locations are **not** stored in the blob.
2. **Tree Objects 🔴 `[R]`**: Represent directories. A tree maps file modes (e.g., `100644` for normal file, `100755` for executable, `040000` for subdirectory), file names, and child object SHAs (blobs or nested trees).
3. **Commit Objects 🔴 `[R]`**: Point to a root tree SHA, zero or more parent commit SHAs (merge commits have multiple parents, root commits have zero), author metadata, committer metadata, and the commit message string.
4. **Tag Objects 🟡 `[O]`**: Reference a specific commit SHA, storing tagger name, PGP signature, timestamp, and message.
5. **Cryptographic Hashing 🔴 `[R]`**: Object headers (`blob 14\0hello world\n`) hashed via SHA-1/SHA-256 to produce deterministic object IDs.

### Internal Topology of the `.git` Directory

```text
.git/
├── HEAD               # 🟡 [O] Symbolic reference pointing to current active branch ref or detached commit hash
├── config             # 🟡 [O] Repository-specific configuration overrides
├── index              # 🟢 [D] Binary staging area index file caching stat data & SHAs
├── objects/           # 🔴 [R] Loose object fan-out storage (objects/xx/yyyy...) & packed archives
└── refs/              # 🟡 [O] Heads (refs/heads/), Remotes (refs/remotes/), and Tags (refs/tags/)
```

---

## 2. Real-World Engineering Scenario

In enterprise production pipelines and automated build tools (e.g., CI/CD agents, monorepo tooling), manipulating Git at the porcelain level (`git commit`, `git checkout`) can be slow and unpredictable. Infrastructure scripts interact directly with Git's object database to craft commits programmatically without mutating working trees or triggering index locks.

---

## 3. Production-Grade Code & Command Examples

```bash
# 1. Manually compute object SHA and write blob into .git/objects 🔴 [R]
echo "console.log('Hello Git Internals');" | git hash-object -w --stdin
# Output: a0d9600b09c93836025512c026b3363a175f6375
# (the SHA-1 of THIS exact content + header — NOT the famous e69de29b... empty-blob hash
# every tutorial reuses; any change to the content changes this hash)

# 2. Inspect object type and payload via plumbing commands 🔴 [R]
git cat-file -t a0d9600b09c93836025512c026b3363a175f6375
# Output: blob

git cat-file -p a0d9600b09c93836025512c026b3363a175f6375
# Output: console.log('Hello Git Internals');

# 3. Inspect branch head resolution 🟡 [O]
cat .git/HEAD
# Output: ref: refs/heads/main

cat .git/refs/heads/main
# Output: 4f8b912c7d... (Latest commit SHA)
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### SHA-1 Collisions & SHA-256 Migration 🔴 `[R]`
In 2017, the SHAttered attack demonstrated practical SHA-1 collisions (two different PDF files generating identical SHA-1 hashes). Modern Git implementations support SHA-256 repositories (`git init --object-format=sha256`).

### Object Store Bloat from Sensitive Secrets 🔴 `[R]`
Because objects are immutable and content-addressable, deleting a file in a new commit (`git rm secret.env && git commit`) **does not remove the blob object** from `.git/objects/`. Anyone with repository access can reconstruct the secret using `git cat-file`. Purging secrets requires history scrubbing via `git filter-repo`.
