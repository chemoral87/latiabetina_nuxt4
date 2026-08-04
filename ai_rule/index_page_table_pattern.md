# Index Page + Table Component Pattern

> **Goal:** every list/index page (Role, User, Permission, Organization,
> AuditoriumEvent, ...) must follow the same structure so behavior stays
> consistent: filter debounce, SSR initial load, one loader function, delete
> confirmation, and row highlight after save.

## Architecture

A list page is split in three parts:

```
app/pages/<module>/index.vue        page: state, data loading, save/delete handlers
app/components/<Module>/Table.vue   table: VDataTableServer, headers, action column, delete dialog
app/components/<Module>/Dialog.vue  create/edit dialog (optional, shown with v-if)
```

Reference implementations: `role/index.vue`, `user/index.vue`,
`permission/index.vue`, `organization/index.vue`, `auditorium-event/index.vue`.

## Page template layout (`index.vue`)

```
<VContainer :fluid="true">
  <VRow>
    <VCol cols="12" md="2">            filter VTextField (filterInput)
    <VCol cols="auto">                 Refrescar + Nuevo buttons
    <VCol cols="12">                   <ModuleTable />   (filters + table)
  </VRow>
  <ModuleDialog v-if="dialog" ... />   create/edit dialog
</VContainer>
```

- Filter input: `id="tf-{view}-index-filter-1"`, `v-model="filterInput"`,
  `append-inner-icon="mdi-magnify"`, `variant="outlined"`, `density="compact"`,
  `clearable`, `hide-details`.
- Buttons: `btn-{view}-refresh` (`color="primary"`, `:loading="loading"`,
  `class="mr-4"`, `@click="refreshX"`) and `btn-{view}-new`
  (`color="success"`, `@click="newX"`). Icons `mdi-reload` / `mdi-plus` with
  `VIcon start`.
- Table gets `:search`, `:response`, `:loading`, `:highlight-id`, and
  `v-model:dialog-delete` plus the event handlers.

## Page script setup — the standard pattern

All pages share this exact skeleton:

```ts
const { Role } = useRepository()          // BEFORE any top-level await

const filterInput = ref("")               // bound to the VTextField
const filterRole = ref("")                // drives the API call (debounced)
const role = ref<Record<string, unknown> | null>(null)
const response = ref({ data: [], total: 0 })
const loading = ref(false)
const saving = ref(false)
const roleDialog = ref(false)
const roleDialogDelete = ref(false)
const { highlightId, prependCreated, updateRow } = useRowHighlight()
const lastOptions = ref<Record<string, unknown> | null>(null)
```

### 1. SSR initial load — top-level await

```ts
{
  const apiParams: Record<string, unknown> = {
    page: 1,
    itemsPerPage: 10,                    // organization uses 5
    sortBy: ["name"],                    // backend format
    sortDesc: [false],
  }
  const initialResponse = await Role.index(apiParams).catch(() => ({ data: [], total: 0 }))
  response.value = initialResponse as { data: unknown[]; total: number }
  lastOptions.value = {
    page: 1,
    itemsPerPage: 10,
    sortBy: [{ key: "name", order: "asc" }],   // Vuetify 4 format
  }
}
```

- **Backend format** (`sortBy: ["name"]`) for the API call.
- **Vuetify 4 format** (`sortBy: [{ key, order }]`) stored in `lastOptions` so
  the loader's conversion works on refresh.
- The repository must be destructured **before** this block (temporal dead zone).

### 2. Debounced filter (300ms)

```ts
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(filterInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val) {
    filterRole.value = ""
    return
  }
  debounceTimer = setTimeout(() => {
    filterRole.value = val
  }, 300)
})
```

Clear immediately when the input empties; never debounce the clear.

### 3. Single loader function

```ts
async function loadRoles(opts: Record<string, unknown>) {
  try {
    loading.value = true
    lastOptions.value = opts
    const params: Record<string, unknown> = {
      page: opts.page ?? 1,
      itemsPerPage: opts.itemsPerPage ?? 10,
    }
    const sortBy = (opts.sortBy as { key: string; order: string }[]) ?? []
    if (sortBy.length > 0) {
      params.sortBy = [sortBy[0].key]
      params.sortDesc = [sortBy[0].order === 'desc']
    }
    if (filterRole.value) {
      params.filter = filterRole.value
    }
    response.value = await Role.index(params)
  } catch (e) {
    console.error("Error al cargar roles", e)
  } finally {
    loading.value = false
  }
}
```

Converts Vuetify 4 `sortBy` → backend `sortBy[]` / `sortDesc[]`, adds the
`filter`, wraps with `loading`.

### 4. Suppress mount-time duplicate with `initialLoaded`

```ts
let initialLoaded = false

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    initialLoaded = true     // first @update:options fires on mount; data already loaded
    return
  }
  loadRoles(opts)
}

function refreshRoles() {
  if (lastOptions.value) {
    loadRoles(lastOptions.value)   // refresh bypasses the flag
  }
}
```

### 5. Save / delete handlers

```ts
function newX() {
  useValidationErrors().clearErrors()
  role.value = {}
  roleDialog.value = true
}

function editX(item: Record<string, unknown>) {
  useValidationErrors().clearErrors()
  role.value = { ...item }
  roleDialog.value = true
}
```

```ts
async function saveX(item: Record<string, unknown>) {
  try {
    saving.value = true
    if (item.id) {
      const res = await Role.update<Record<string, unknown>>(item.id as number, item)
      const updated = (res as Record<string, unknown>)?.data as Record<string, unknown> | undefined
      if (updated) updateRow(response, updated)
    } else {
      const res = await Role.create<Record<string, unknown>>(item)
      const created = (res as Record<string, unknown>)?.data as Record<string, unknown> | undefined
      if (created) prependCreated(response, created)
    }
    roleDialog.value = false
    role.value = null
  } catch (e) {
    console.error("Error al guardar el rol", e)
  } finally {
    saving.value = false
  }
}
```

- **Update:** `updateRow(response, updated)` replaces the row in place + flash.
- **Create:** `prependCreated(response, created)` unshifts + bumps total + flash.
- Tables that re-fetch after save (`permission/index.vue`,
  `auditorium-event/index.vue`) call `await refreshX()` then `flash(id)` instead.

```ts
async function deleteX(item: Record<string, unknown>) {
  try {
    saving.value = true
    await Role.delete(item.id as number)
    const data = response.value.data as Record<string, unknown>[]
    const idx = data.findIndex((r) => r.id === item.id)
    if (idx !== -1) {
      data.splice(idx, 1)
      response.value.total = Math.max(0, (response.value.total ?? 0) - 1)
    }
    roleDialogDelete.value = false
  } catch (e) {
    console.error("Error al eliminar el rol", e)
  } finally {
    saving.value = false
  }
}
```

Remove the row locally — do **not** re-fetch the whole list after delete.

### 6. closeDialog

```ts
function closeDialog() {
  roleDialog.value = false
  role.value = null
  useValidationErrors().clearErrors()
}
```

## Table component pattern (`<Module>/Table.vue`)

```vue
<div id="cmp-role-table">                       <!-- root component id -->
  <VDataTableServer
    id="dt-role-table-items-1"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    v-model:sort-by="sortBy"
    density="compact"
    :headers="headers"
    :items="items"
    :items-length="total"
    :loading="loading"
    :row-props="rowProps"
    class="elevation-1"
    striped="odd"
    mustSort
    :search="props.search"
    items-per-page-text="Filas por página"
    :items-per-page-options="[10, 15, 30]"
    @update:options="onUpdateOptions"
  >
    ...
  </VDataTableServer>
  <DialogDelete v-if="dialogDelete" ... />
</div>
```

- Local state: `page = ref(1)`, `itemsPerPage = ref(10)`,
  `sortBy = ref([{ key: "name", order: "asc" }])`.
- Props: `response`, `loading`, `search`, `highlightId`, `dialogDelete` (for
  the `v-model:dialog-delete`).
- Computeds: `total = props.response?.total ?? 0`, `items = props.response?.data ?? []`,
  `loading = props.loading ?? false`.
- Headers use `title`/`value`/`sortable` (`title`, NOT `text` — Vuetify 4).

### Emits + `onUpdateOptions`

```ts
const emit = defineEmits<{
  (e: 'update:dialogDelete', val: boolean): void
  (e: 'sorting', val: Record<string, unknown>): void
  (e: 'edit', val: unknown): void
  (e: 'delete', val: unknown): void
  // + module-specific: editPermissions, distribution, config, editProfiles, mark, download...
}>()

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val)
}
```

Emit `sorting` only from `@update:options` — never from a deep `watch` on the
options (avoids the reactive loop).

### Action column

```vue
<template #[`item.actions`]="{ item }">
  <VBtn title="Editar" class="ma-1" color="primary" variant="outlined" size="small"
    icon rounded="circle" id="btn-role-table-edit" @click="emitEdit(item)">
    <VIcon size="x-large">mdi-pencil</VIcon>
  </VBtn>
  ...
</template>
```

Icons inside icon buttons always `size="x-large"`; buttons `rounded="circle"`.

### Row highlight

```ts
import { rowPropsFor } from "~/composables/useRowHighlight"
const rowProps = rowPropsFor(() => props.highlightId)
```

### Delete confirmation (DialogDelete)

```ts
function confirmDelete(item: unknown) {
  dialogDeleteProp.value = {
    text: "¿Desea eliminar el Rol ",
    strong: (item as Record<string, unknown>).name,
    payload: item,
  }
  emit("update:dialogDelete", true)
}
```

```vue
<DialogDelete
  v-if="dialogDelete"
  :dialog="dialogDeleteProp"
  @ok="(item) => emit('delete', item)"
  @close="emit('update:dialogDelete', false)"
/>
```

The table owns the confirmation; the page only listens for `@delete`. The
`v-model:dialog-delete` prop mirrors the page's `roleDialogDelete` ref.

## Differences between the reference pages (keep the common core)

| Aspect | role / user / permission / organization | auditorium-event |
|---|---|---|
| Initial load | plain top-level await | `useAsyncData("auditorium-event-index", ...)` |
| Filter | single `VTextField` + `filter` param | `MyDateRange` + `OrganizationSelect` (org_id param) |
| Table wrapper | `<div id="cmp-x-table">` root | no wrapper root |
| `:search` prop | present on `VDataTableServer` | not used (date-range filter) |
| Delete dialog | inside `Table.vue` (DialogDelete) | at page level, `DialogDelete` + `dialogDelete` data |
| Loader signature | `loadX(opts)` | `getAuditoriumEvents(overrides)` merged over `options` ref |

**Rules for new pages:**
1. Follow the **role/user/permission/organization** core (top-level await +
   `initialLoaded` + one loader + `updateRow`/`prependCreated` + local delete).
2. Use `useAsyncData` with a scoped key only when SSR serialization is required
   (see `ai_rule/nuxt4_ssr_hydration.md`).
3. Always give the table component a `<div id="cmp-x-table">` root and bind
   `:search="props.search"` when the page has a text filter.
4. Put the `DialogDelete` confirmation **inside** the table component with the
   `v-model:dialog-delete` contract.
5. Keep a single sortable column as default (`sortBy` default matches the
   initial `lastOptions` key).
6. Do **not** use bare `fluid` on `VContainer` — use `:fluid="true"` (SSR
   hydration, see migration guide).

## Do Not

- Do not re-fetch the list after delete — splice locally and decrement total.
- Do not watch `options` deeply to emit sorting — use `@update:options` only.
- Do not skip the `initialLoaded` guard — the page will double-fetch on mount.
- Do not use `onMounted` for the initial list load — the first paint would be
  empty (see `ai_rule/nuxt4_ssr_hydration.md`).
- Do not omit `:search="props.search"` on `VDataTableServer` when the page
  passes a search prop — filter changes silently never reach `useOptions`.
