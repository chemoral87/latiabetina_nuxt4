# Plan: Sort permission chips (group alphabetically, then by depth)

**Status:** todo
**Independent of:** `permission-chip-colors-v3.md` (color/variant) — this only
changes *display order* of the chips within a role's row, not their color.
Can be worked on at the same time as v3 since it touches a different part of
the same file (see file-ownership note below).

**Goal (from Sergio's example):**

```
Input (as returned by the API, order not guaranteed):
  church-member-all
  church-member-consolidator-assign
  church-member-index
  church-member-delete
  church-member-update
  church-member-create

Desired display order:
  church-member-all
  church-member-index
  church-member-delete
  church-member-update
  church-member-create
  church-member-consolidator-assign
```

---

## 0. Sort algorithm (read before claiming a task)

> ⚠️ Assumption flagged for confirmation: the request says "sort by first
> letter alphabetical and number of segments." In the worked example every
> permission is in the *same* group (`church-member`), so there's nothing to
> alphabetize between groups in that example — the only visible effect is
> `church-member-consolidator-assign` (4 segments) sinking to the end, after
> every 3-segment `church-member-*` permission, while `all / index / delete /
> update / create` keep their original relative order. The interpretation
> below reproduces that exactly: **alphabetical applies to ordering the
> distinct groups against each other; segment count (fewer first) orders
> permissions *within* a group; anything still tied keeps its original
> order** (relies on `Array.prototype.sort` being a stable sort, guaranteed
> since ES2019 — true in all supported browsers/Node, so no manual
> tie-break code needed). If Sergio actually wants alphabetical-by-full-name
> as the final tiebreak instead of "keep original order," only the
> comparator in A1 needs a third clause added — nothing else changes.

**Comparator, in order:**
1. `permissionGroupKey(a)` vs `permissionGroupKey(b)` (existing export from
   `app/utils/permissionChipColor.ts`) compared alphabetically
   (`localeCompare`).
2. If equal: segment count (`name.split("-").length`) ascending — fewer
   segments (more general permission) first.
3. If still equal: no explicit tiebreak — leave as-is, stable sort preserves
   original order.

---

## Coordination protocol

Same convention as the color plans: claim a task by setting **Owner**/
**Status** before touching its file(s). Track B codes against the signature
below and doesn't need to wait for Track A's implementation to land.
**File-ownership note:** both this plan's Track B and v3's Track B touch
`Role/Table.vue`. If both are being worked at once, agree who lands first
and the other rebases their diff on top — do not have two agents editing
`Table.vue` in the same window. Whoever's task is smaller/lands first should
go first (this plan's B1 is a one-line `v-for` change, likely smaller than
v3's Track B).

**Signature Track B codes against:**

```ts
// app/utils/permissionChipColor.ts (existing file)
export function sortPermissionsForDisplay<T extends { name: string }>(permissions: T[]): T[]
// Returns a NEW array (does not mutate the input), sorted per §0. Works on
// the actual permission objects (not just names) so id/other fields survive.
```

---

## Track A — sort utility

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| A1 | Add `sortPermissionsForDisplay()` to `app/utils/permissionChipColor.ts` per §0/§1, built on the existing `permissionGroupKey()` export (don't duplicate the group-key logic). JSDoc with the worked example from this file (the `church-member-*` case) so future readers see why `consolidator-assign` sinks to the bottom. | `app/utils/permissionChipColor.ts` | — | ⬜ todo | pure function, no Vue/component dependencies |
| A2 | Vitest cases in `permissionChipColor.test.ts`: the exact worked example above (assert final order matches); a case with two different groups to confirm they cluster and order alphabetically relative to each other (e.g. mix `auditorium-*` and `church-member-*` permissions, assert all `auditorium-*` come before all `church-member-*`); a case confirming the input array itself isn't mutated. | `app/utils/permissionChipColor.test.ts` | — | ⬜ todo | |

## Track B — apply sort in the table

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| B1 | In `Role/Table.vue`, wrap the `v-for` source for the permissions chip list with the new helper — either call `sortPermissionsForDisplay(...)` directly in the `v-for` expression, or add a small local function `sortedPermissions(item)` in `<script setup>` and use that in the template (prefer the latter to keep the template line readable, consistent with the file's existing style of small helper functions like `hasPermissions()`). | `app/components/Role/Table.vue` | — | ⬜ todo | see file-ownership note above before starting if v3's Track B is in flight |
| B2 | Manual check: reload the Roles page, confirm `consolidador` / `consolidador-manager` rows show `church-member-consolidator-assign` (and any other deeper `church-member-*-*` permission) sorted to the end of its group's cluster, with the shallower `church-member-*` permissions keeping their existing relative order ahead of it. | — | — | ⬜ todo | visual QA only |

---

## Done criteria

- [ ] A1–A2 done, tests passing (including the exact worked example)
- [ ] B1–B2 done, manual QA matches the worked example on the real page
- [ ] Move this file to `features/done/`
