# Feature: Momentary row highlight after editing a Role

## Goal
In `app/components/Role/Table.vue`, after a role is successfully edited (via
`RoleDialog` -> `saveRole()` in `app/pages/role/index.vue`), briefly highlight
the corresponding row in the table so the user can visually confirm which
row changed, then have it fade back to normal automatically.

## Current flow (relevant pieces)
- `app/pages/role/index.vue` owns `response.value.data` (the array rendered
  by the table) and `saveRole(item)`:
  - On update, calls `Role.update(item.id, item)`, finds the matching row in
    `response.value.data` by `id`, and replaces it in place
    (`data[idx] = updated`).
  - Closes the dialog on success.
- `app/components/Role/Table.vue` renders `response.data` via
  `VDataTableServer` (Vuetify 3.7). It receives `response`/`loading`/`search`
  as props and emits `edit`, `editPermissions`, `distribution`, `delete`,
  `sorting`.
- There's no existing per-row styling hook in the table today.

## Design
Vuetify 3's `VDataTable`/`VDataTableServer` (v3.4+, project is on 3.7.16)
supports a `row-props` prop: a function `({ item, index, internalItem }) =>
attrs` whose returned object (e.g. `{ class, style }`) is merged onto each
`<tr>`. This lets us add a highlight class to just the edited row without
restructuring the table's rendering (no need to touch the `#item` slot).

Flow:
1. **Parent (`role/index.vue`) tracks which row to highlight.**
   - Add `const highlightRoleId = ref<number | null>(null)`.
   - In `saveRole()`, after a successful **update** (not create) and after
     `data[idx] = updated`, set `highlightRoleId.value = updated.id as
     number`.
   - Clear it automatically after the highlight duration so it can be
     re-triggered on the next edit even if the same row is edited twice in a
     row:
     ```ts
     const idToHighlight = updated.id as number
     highlightRoleId.value = idToHighlight
     setTimeout(() => {
       if (highlightRoleId.value === idToHighlight) {
         highlightRoleId.value = null
       }
     }, 1600) // slightly longer than the CSS animation below
     ```
   - Pass it down: `<RoleTable ... :highlight-id="highlightRoleId" />`.

2. **Child (`Role/Table.vue`) applies the highlight via `row-props`.**
   - Add prop: `highlightId?: number | null`.
   - Add a `rowProps` function and bind it: `:row-props="rowProps"` on
     `VDataTableServer`.
     ```ts
     function rowProps(data: { item: unknown }) {
       const id = (data.item as Record<string, unknown>)?.id
       return {
         class: props.highlightId != null && id === props.highlightId
           ? 'row-highlight'
           : undefined,
       }
     }
     ```
   - Add scoped CSS using a one-shot `@keyframes` animation (not a
     `transition`), so it plays once when the class is applied and settles
     back to normal on its own — no need to time a class removal exactly
     against a fade:
     ```css
     <style scoped>
     :deep(.row-highlight) {
       animation: role-row-highlight 1.4s ease-out;
     }
     @keyframes role-row-highlight {
       0% { background-color: rgba(var(--v-theme-success), 0.35); }
       100% { background-color: transparent; }
     }
     </style>
     ```
     `:deep()` is required because `VDataTableServer` renders its own
     internal `<tr>` elements, which scoped styles can't reach directly.

## Why this approach
- No change to how rows are rendered (keeps existing `#item.permissions` and
  `#item.actions` slots untouched).
- Highlight is driven by `id` matching, so it correctly follows the *edited*
  row even if sorting/pagination changes its position.
- CSS `animation` (vs. `transition`) plays once from 0% -> 100% as soon as
  the class is added; we don't need pixel-perfect timing between adding and
  removing the class in JS — the `setTimeout` in the parent just needs to be
  ≥ the animation duration so the class doesn't linger indefinitely (mostly
  a cleanup/hygiene concern, not a visual one).
- Reusable pattern: the same `highlight-id` prop + `row-props` approach can
  be copied to other tables (e.g. `AuditoriumEvent/Table.vue`,
  `Organization` tables) if this pattern is liked.

## Edge cases to handle
- **Create (not update):** new roles are `unshift`-ed to the top of
  `response.value.data`. Decide whether newly created rows should also
  flash (probably yes, for consistency) — if so, set `highlightRoleId.value
  = created.id` in the create branch too.
- **Row not currently visible:** if the edited row is on a different page
  after the update (unlikely here since we mutate in place rather than
  re-fetching, but possible after a re-sort), the highlight prop simply
  won't match any rendered row — harmless no-op.
- **Rapid successive edits:** the `setTimeout` clears only if
  `highlightRoleId` still equals the id it was set for, so editing a second
  row while the first row's highlight is still fading won't prematurely
  clear the second row's highlight.
- **Reduced motion:** consider wrapping the animation in
  `@media (prefers-reduced-motion: reduce) { animation: none; }` for
  accessibility, matching best practice for motion-based UI feedback.

## Files to change
- `app/pages/role/index.vue` — add `highlightRoleId` ref, set/clear it in
  `saveRole()`, pass `:highlight-id` to `RoleTable`.
- `app/components/Role/Table.vue` — add `highlightId` prop, `rowProps`
  function, `:row-props` binding, and the scoped `row-highlight`
  animation CSS.

## Testing checklist
- [ ] Edit a role's name -> its row flashes green-ish then returns to
      normal after ~1.4s.
- [ ] Edit a role, then immediately edit a different role before the first
      animation finishes -> only the second row is highlighted; no stuck
      highlight on the first row.
- [ ] Edit the same role twice in a row (fast) -> highlight restarts /
      re-triggers rather than silently no-op-ing.
- [ ] Create a new role -> decide/confirm whether it should also flash (per
      "Edge cases" above) and verify it does/doesn't as decided.
- [ ] Sort or paginate right after an edit -> no console errors, no stuck
      highlight class on the wrong row.
- [ ] Works with `prefers-reduced-motion: reduce` enabled (row updates
      instantly without animation, if that guard is added).
