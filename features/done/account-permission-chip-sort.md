# Plan: Sort permission chips in Account page (group alphabetically, then by depth & column-first order)

**Status:** done (B6 manual QA pending — see note)  
**Target:** `app/pages/account/index.vue` & `app/utils/permissionChipColor.ts`  
**Reference:** `features/done/permission-chip-sort.md`

---

## Goal

1. **Sort order:** In `app/pages/account/index.vue`, permissions are currently sorted naively using standard alphabetical comparison (`a.localeCompare(b)`):
   - In `sortedPermissionsOrg` (Separado / Por rol view)
   - In `sortedRolesPermissions` (Combinado views)
   - In `orgGroups` (Separado & Combinado / Por Org views)

   This causes deeper action permissions (like `church-member-consolidator-assign`, 4 segments) to be alphabetized directly between shallower 3-segment permissions (e.g. before `church-member-create` or `church-member-update`), instead of clustering at the end of their group.

2. **Column-first 2-column layout (Top-to-Bottom, Left-to-Right):**
   In the 2-column view (`Separado` / `Por rol`), items currently render row-by-row in flex/grid order:
   ```
   Current (row-first):
     Col 1 (Left)                    Col 2 (Right)
     [1] church-member-all           [2] church-member-create
     [3] church-member-delete        [4] church-member-index
     [5] church-member-update        [6] church-member-consolidator-assign
   ```
   The desired reading order is column-first (down column 1, then down column 2):
   ```
   Desired (column-first: 1 3 / 2 4):
     Col 1 (Left)                    Col 2 (Right)
     [1] church-member-all           [4] church-member-index
     [2] church-member-create        [5] church-member-update
     [3] church-member-delete        [6] church-member-consolidator-assign
   ```

---

## 0. Sort Algorithm & Column Splitting

### Sort Algorithm
The sorting comparator follows `sortPermissionsForDisplay()`:
1. **Group alphabetical:** Compare `permissionGroupKey(a)` vs `permissionGroupKey(b)` alphabetically via `localeCompare`.
2. **Segment count ascending:** If groups are equal, compare segment depth (`name.split("-").length` ascending) — shallower/more general permissions appear first.
3. **Alphabetical tiebreak within same group & depth:** If segment count is also equal, compare full permission names with `localeCompare`.

### 2-Column Vertical Layout (`1 3 / 2 4`)
In `account/index.vue`, the 2-column grid (`sm="6"`) should split the sorted list of $N$ permissions into two halves:
- `leftColumn = items.slice(0, Math.ceil(N / 2))`
- `rightColumn = items.slice(Math.ceil(N / 2))`

Each column is rendered inside its own `<VCol sm="6" cols="12">`:
- On `sm+` screens (2 columns): Column 1 shows items `1..half`, Column 2 shows items `(half+1)..N`. Visually, Row 1 is `[1]` & `[half+1]`, Row 2 is `[2]` & `[half+2]`.
- On mobile `cols="12"`: Column 1 renders in full (`1..half`), followed seamlessly by Column 2 (`(half+1)..N`).

---

## 1. Signatures & Helpers

In `app/pages/account/index.vue`, permissions are primarily arrays of string names (`string[]`) or entries `[permName, orgIds]`.

To cleanly support `account/index.vue`:

```ts
// app/utils/permissionChipColor.ts

/**
 * Comparator function to compare two permission names by group, then segment depth, then name.
 */
export function comparePermissionNames(a: string, b: string): number

/**
 * Sort a list of permission name strings for display.
 * Returns a NEW array without mutating the input.
 */
export function sortPermissionNamesForDisplay(names: string[]): string[]
```

---

## 2. Coordination Protocol & Tasks

### Track A — Sort utilities & Vitest

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| A1 | Export `comparePermissionNames(a: string, b: string): number` and `sortPermissionNamesForDisplay(names: string[]): string[]` in `app/utils/permissionChipColor.ts`, reusing `permissionGroupKey()`. Refactor `sortPermissionsForDisplay()` to use `comparePermissionNames`. | `app/utils/permissionChipColor.ts` | Buffy | ✅ done | Already implemented from previous session; JSDoc examples updated to match the §0 alphabetical tiebreak |
| A2 | Add Vitest test cases in `permissionChipColor.test.ts` for `comparePermissionNames` and `sortPermissionNamesForDisplay` (depth sorting, cross-group alphabetical sorting, immutability). | `app/utils/permissionChipColor.test.ts` | Buffy | ✅ done | 19/19 tests pass; stale "keep original order" expectations updated to the §0 tiebreak |

### Track B — Apply in `account/index.vue`

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| B1 | Import `comparePermissionNames` and `sortPermissionNamesForDisplay` in `app/pages/account/index.vue`. | `app/pages/account/index.vue` | Buffy | ✅ done | Explicit import, matches `Role/Table.vue` convention |
| B2 | Update `sortedPermissionsOrg` computed property to sort permission entries using `comparePermissionNames(a, b)`. | `app/pages/account/index.vue` | Buffy | ✅ done | |
| B3 | Implement 2-column split (e.g. `sortedPermissionsOrgCols = computed(() => { const entries = Object.entries(sortedPermissionsOrg.value); const mid = Math.ceil(entries.length / 2); return [entries.slice(0, mid), entries.slice(mid)] })`) in `account/index.vue`. Render `<VCol sm="6" cols="12">` for each column half so reading order flows top-to-bottom down column 1, then top-to-bottom down column 2 (`1 3 / 2 4`). | `app/pages/account/index.vue` | Buffy | ✅ done | Inner rows keep all original chip IDs & props; `mb-1` added for row spacing |
| B4 | Update `sortedRolesPermissions` computed property to sort `perms` array with `sortPermissionNamesForDisplay(perms)`. | `app/pages/account/index.vue` | Buffy | ✅ done | |
| B5 | Update `orgGroups` computed property to sort `perms` array with `sortPermissionNamesForDisplay(...)`. | `app/pages/account/index.vue` | Buffy | ✅ done | |
| B6 | Manual QA on `/account`: verify 2-column layout displays column-first (`1 3 / 2 4`) and all 4 view switch combinations (`Separado` vs `Combinado`, `Por rol` vs `Por Org`) show correctly sorted chips. | — | Sergio | ⬜ pending | Requires authenticated session; page is behind `middleware: "authenticated"` |

---

## Done Criteria

- [x] A1–A2 completed: unit tests pass in `permissionChipColor.test.ts` (19/19)
- [x] B1–B5 completed: all computed properties and 2-column vertical flow implemented in `account/index.vue`
- [ ] B6 completed: manual QA confirms column-first vertical ordering and correct group/depth sorting
- [x] Move this file to `features/done/account-permission-chip-sort.md`
