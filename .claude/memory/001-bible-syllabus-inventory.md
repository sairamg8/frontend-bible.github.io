---
name: bible-syllabus-inventory
description: The 14 syllabus/*.txt reference bibles authored in this project, their shared format, and known gaps.
metadata:
  type: project
---

# Bible Syllabus Files

Authored across several Claude Code sessions as plain-text API/concept reference
files, one per technology. Format convention: ASCII header block, numbered
`SECTION N:` dividers separated by dashed lines, sub-numbered concept lists
each with a one-line description. New bibles should match this format unless
explicitly told otherwise (see the architecture bible below for the one
intentional exception).

Originally written directly into `/home/sairam/Documents/frontend/`, later
moved into `syllabus/` by a separate tool ("agy") during an unrelated session.

## Files
1. `react_bible_syllabus.txt` - all 20 hooks (originally cataloged as 19;
   patched 2026-07-30 to add React 19.2 additions: `useEffectEvent`,
   `<Activity>`, `cache()`/`cacheSignal`) + client/server/RSC/resource APIs.
2. `webpack_bible_syllabus.txt`
3. `vite_bible_syllabus.txt`
4. `nextjs_bible_syllabus.txt` (App Router first, Pages Router as legacy reference)
5. `redux_toolkit_bible_syllabus.txt` (incl. RTK Query)
6. `jest_rtl_bible_syllabus.txt`
7. `playwright_bible_syllabus.txt`
8. `typescript_bible_syllabus.txt`
9. `tanstack_query_bible_syllabus.txt`
10. `storybook_bible_syllabus.txt`
11. `web_vitals_performance_bible_syllabus.txt`
12. `framer_motion_bible_syllabus.txt`
13. `javascript_bible_syllabus.txt`
14. `frontend_architecture_bible_syllabus.txt` - the one deliberate exception:
    written as decisions/tradeoffs (folder structure, state-management
    decision tree, CI/CD, observability, team practices) instead of an API
    catalog, per explicit user request for "real world scenarios."

## Known gap (applies to all except #14)
These are concept/API catalogs, not tutorials - no exercises, no progression,
no "why choose X over Y." Flagged to the user early on; #14 was created
specifically to cover the "real world" side, but the other 13 still read as
reference tables, not learning paths.

## Unresolved user request from this thread
User asked to add Tailwind+shadcn/Zustand bibles as a possible next batch
(suggested by the assistant, not yet confirmed/requested). Not created.
