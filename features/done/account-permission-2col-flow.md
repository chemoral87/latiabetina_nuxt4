# Plan: 2-Column Vertical (Column-First) Flow for Account Permissions

**Status:** done (task 3 manual QA pending — see note)  
**File:** `app/pages/account/index.vue`  
**Affects:** Permisos section in "Separado" + "Por rol" mode  

---

## 0. Problem & Goal

In `app/pages/account/index.vue` (Separado / Por rol view), permissions are rendered in a 2-column grid via `VRow` with `VCol sm="6"`:

```vue
<VRow density="compact">
  <VCol v-for="(orgIds, perm) in sortedPermissionsOrg" :key="perm" sm="6" cols="12">
    ...
  </VCol>
</VRow>
```

Because `VRow` + `VCol` flows horizontally (row-first across flex items), the elements render left-to-right, then top-to-bottom:

```
Current (Horizontal / Row-First):
  Col 1 (Left)                    Col 2 (Right)
  [1] church-member-all           [2] church-member-create
  [3] church-member-delete        [4] church-member-index
  [5] church-member-update        [6] church-member-consolidator-assign
```

### Desired Display Order (Vertical / Column-First: `1 3` / `2 4`):

Reading should flow top-to-bottom down the first column, then top-to-bottom down the second column:

```
Desired (Vertical / Column-First):
  Col 1 (Left)                    Col 2 (Right)
  [1] church-member-all           [4] church-member-index
  [2] church-member-create        [5] church-member-update
  [3] church-member-delete        [6] church-member-consolidator-assign
```

Visual Layout:
```
Row 1:  [1]   [3]   (or [1]  [N/2 + 1])
Row 2:  [2]   [4]   (or [2]  [N/2 + 2])
```

---

## 1. Implementation Approach

Split the sorted permissions entries (`Object.entries(sortedPermissionsOrg)`) into two column halves:

```ts
const sortedPermissionsOrgCols = computed(() => {
  const entries = Object.entries(sortedPermissionsOrg.value)
  const mid = Math.ceil(entries.length / 2)
  return [entries.slice(0, mid), entries.slice(mid)]
})
```

And in the template, render 2 columns:

```vue
<VRow density="compact">
  <VCol v-for="(colEntries, colIdx) in sortedPermissionsOrgCols" :key="colIdx" sm="6" cols="12">
    <div
      v-for="[perm, orgIds] in colEntries"
      :key="perm"
      style="gap: 4px"
      class="d-flex align-center flex-wrap mb-1"
    >
      <VChip :id="'chip-acc-permission-' + perm" label class="mr-1" size="small" color="secondary" variant="elevated">
        {{ perm }}
      </VChip>
      <VChip
        v-for="oid in orgIds"
        :id="'chip-acc-permission-org-' + oid"
        :key="oid"
        size="x-small"
        color="secondary"
        variant="outlined"
      >
        {{ getOrgNameById(oid) }}
      </VChip>
    </div>
  </VCol>
</VRow>
```

### Responsiveness:
- **Desktop / Tablet (`sm="6"`):** Left column contains items `1..mid`, right column contains items `mid+1..N`. Visual flow is down column 1, then down column 2.
- **Mobile (`cols="12"`):** Column 1 (top half `1..mid`) renders in full, followed immediately by Column 2 (bottom half `mid+1..N`), maintaining unbroken logical order.

---

## 2. Tasks

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| 1 | In `app/pages/account/index.vue`, add `sortedPermissionsOrgCols` computed property to split entries into 2 equal halves. | `app/pages/account/index.vue` | Buffy | ✅ done | `Math.ceil(length / 2)` split |
| 2 | Refactor template in `account/index.vue` (under `!combinedView && !combinedOrgView`) to render 2 `<VCol sm="6" cols="12">` columns iterating over `colEntries`. | `app/pages/account/index.vue` | Buffy | ✅ done | Preserves all IDs and chip props |
| 3 | Visual verification: check `/account` in desktop and mobile viewports to confirm vertical reading order (`1 3 / 2 4`). | — | Sergio | ⬜ pending | Manual QA — requires authenticated session |

---

## 3. Done Criteria

- [x] `sortedPermissionsOrgCols` splits sorted entries into 2 column groups
- [x] 2-column display renders down column 1 first, then column 2 (`1 3 / 2 4`)
- [ ] Mobile single-column view renders items 1..N in unbroken sequence (manual QA)
- [x] Move this file to `features/done/account-permission-2col-flow.md`
