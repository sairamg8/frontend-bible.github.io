# ESLint & Oxlint Bible Syllabus

## Created
- File: `syllabus/eslint_oxlint_bible_syllabus.txt`
- Date: 2026-08-01
- Trigger: User asked to add oxlint and eslint with complete docs; syllabus first for review.

## Scope decisions
- **One combined bible** (like Jest & RTL), not two separate files — coexistence/migration is a first-class production pattern.
- Catalogs lint tooling (ESLint + Oxlint): architecture, config, rules, plugins, type-aware, dual-run, migration.
- Formatting (Prettier/Oxfmt) only at the lint/format boundary — not a formatter bible.
- Cross-links frontend architecture CI/team sections where relevant.
- Matches standard format: ASCII header, DOCUMENTATION STANDARD (4-tier), SECTION N, one-line concept bullets.
- Scope snapshot dated 2026: ESLint flat-config modern path; Oxlint 800+ rules, type-aware via tsgolint, JS plugins alpha.

## Section map (21 sections)
1. Linting landscape & decisions
2. ESLint core architecture
3. ESLint flat config
4. Language options / globals / parsing
5. Rules system
6. Plugin ecosystem
7. typescript-eslint
8. CLI / output / cache / fixes
9. Suppressions / ignores / governance
10. Custom rules & processors
11. Editor & local workflow
12. Oxlint core architecture
13. Oxlint install / CLI / config
14. Native plugins & categories
15. Type-aware & multi-file analysis
16. JS plugins (alpha)
17. Fixes / ignores / diagnostics
18. Coexistence ESLint + Oxlint
19. Migration paths
20. CI / monorepos / performance
21. Real-world workflows & recipes

## Status
- Syllabus only — user reviewing before `docs/eslint-oxlint/` authoring.
- Not wired into docs/index.md, README, or sidebars yet.
