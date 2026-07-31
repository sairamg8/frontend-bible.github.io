---
name: redux-toolkit-expansion
description: Redux Toolkit docs expanded from a single stub file into 13 folders / 16 files covering all 15 syllabus sections, matching the React bible's depth.
metadata:
  type: project
---

# Redux Toolkit Bible Expansion

Following the same pattern used for the React bible (see [002](002-agy-react-docs-review.md) and
[004](004-site-architecture-fixes.md)), `docs/redux-toolkit/` was rebuilt from a single
150-word-per-topic stub file (`01-rtk-core-and-query.md`) into a full-depth structure mirroring
`docs/react/`'s folder layout, covering all 15 sections of
`syllabus/redux_toolkit_bible_syllabus.txt`.

## Structure Created
13 numbered folders, 16 markdown files, each following the site's 4-part skeleton
(Under-The-Hood Mechanics / Real-World Scenario / Production-Grade Code / Senior Edge Cases):

1. `01-store-setup` - configureStore
2. `02-slices-and-actions` - createSlice, createAction/matchers (2 files)
3. `03-async-thunks` - createAsyncThunk
4. `04-rtk-query` - API slice/endpoints, cache management/tags (2 files)
5. `05-selectors-and-normalization` - createSelector/Reselect, createEntityAdapter (2 files)
6. `06-middleware` - default stack + listenerMiddleware
7. `07-react-redux-integration` - useSelector/useDispatch/typed hooks
8. `08-immutability-and-immer` - Immer draft/proxy internals
9. `09-typescript-integration` - RootState/AppDispatch/PayloadAction/typed thunks
10. `10-devtools-and-debugging` - Redux DevTools time-travel/trace mode
11. `11-code-splitting` - combineSlices/injectEndpoints dynamic injection
12. `12-testing` - reducer/thunk/RTK Query/connected-component testing
13. `13-migration` - incremental migration from classic Redux (createStore/sagas)

## Housekeeping
- Old stub `docs/redux-toolkit/01-rtk-core-and-query.md` deleted (was untracked in git -
  `docs/redux-toolkit/` had never been committed prior to this session).
- `docs/index.md`'s Redux Toolkit Bible link updated to point at the new first file
  (`./redux-toolkit/01-store-setup/01-configure-store.md`).
- `yarn build` verified clean (no broken links/anchors) after fixing one self-introduced
  broken-anchor cross-reference (linked to a `#-pitfall-1` heading anchor that Docusaurus's
  slugifier didn't actually generate that way - switched to a plain file link instead).

## Remaining gap
Webpack and web-vitals-performance were expanded next - see [006](006-webpack-and-web-vitals-expansion.md).
Per [001](001-bible-syllabus-inventory.md), 10 bibles remain stub-depth (vite, nextjs, jest-rtl,
playwright, typescript, tanstack-query, storybook, framer-motion, javascript, frontend-architecture).
