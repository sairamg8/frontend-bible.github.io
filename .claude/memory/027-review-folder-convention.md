---
name: review-folder-convention
description: User wants all content reviews (bible accuracy/coverage checks) written as files under review/<bible-name>/, not only summarized in memory.
metadata:
  type: feedback
---

Write the full review output to `review/<bible-name>/README.md` (create the
folder if needed) whenever asked to review a bible's docs - don't just note
findings in a memory file or reply inline in chat and stop there.

**Why:** User explicitly interrupted an in-progress CSS review to say "Keep
all your reviews inside the review folder" - the existing `review/` dir
already holds prior review packs (currently all moved under `review/.legacy/`
per [[017-review-authentication]], e.g. `review/.legacy/grok/react/README.md`),
so new reviews should follow that location, just outside `.legacy` since
`.legacy` specifically holds the old/untrusted pre-authentication pack.

**How to apply:** After finishing a review, still write a short memory file
pointing at the `review/` file (for fast future recall of *what* was found),
but the memory file should be a pointer + summary, not the full findings -
those belong in `review/<bible>/README.md` per this convention.
