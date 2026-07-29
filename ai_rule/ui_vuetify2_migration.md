# Vuetify 2 → Vuetify 4 Migration Guide

> **Identifiers:** All interactive elements must include an `id` per `ai_rule/ui_identifiers_convention.md`.

## Component Props

| Vuetify 2 | Vuetify 3 |
|-----------|-----------|
| `dense` | `density="compact"` |
| `outlined` (VTextField) | `variant="outlined"` |
| `outlined` (VBtn) | `variant="outlined"` |
| `large` (VBtn) | `size="large"` |
| `small` (VBtn) | `size="small"` |
| `block` (VBtn) | `block` or CSS `width: 100%` |
| `v-layout` | `VRow` |
| `v-flex` | `VCol` |
| `@click:append` | `@click:append-inner` |
| `append-icon` | `append-inner-icon` |
| `grey--text text--darken-1` | `text-grey-darken-1` |

## Grid System

Vuetify 3 removed `v-layout` and `v-flex`. Use `VRow` / `VCol` instead:

```diff
-<v-layout align-center justify-center>
-  <v-flex xs12 sm8 md6 lg4>
+<VRow align="center" justify="center">
+  <VCol cols="12" sm="8" md="6" lg="4">

-  </v-flex>
-</v-layout>
+  </VCol>
+</VRow>
```

## Text Fields

```diff
-<v-text-field outlined dense label="Email" :append-icon="showed ? 'mdi-eye' : 'mdi-eye-off'" @click:append="showed = !shown" />
+<VTextField id="login-email" variant="outlined" density="compact" label="Email" :append-inner-icon="shown ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="shown = !shown" />
```

Key changes:
- `outlined` → `variant="outlined"`
- `dense` → `density="compact"`
- `append-icon` → `append-inner-icon`  
- `@click:append` → `@click:append-inner`

## Buttons

```diff
-<v-btn outlined block large class="text-none">
+<VBtn id="login-google-btn" variant="outlined" block size="large" class="text-none">
```

```diff
-<v-btn color="primary" block large class="text-none">Ingresar</v-btn>
+<VBtn id="login-submit" type="submit" color="primary" block size="large" class="text-none">Ingresar</VBtn>
```

## Dividers

```diff
-<v-divider></v-divider>
+<VDivider></VDivider>
```

## List Items

Vuetify 3 removed `VListItemContent`, `VListItemAction`, and `VListItemIcon`. Use the `prepend-icon` prop or `#prepend` slot instead:

```diff
-<v-list-item>
-  <v-list-item-action>
-    <v-icon>{{ item.icon }}</v-icon>
-  </v-list-item-action>
-  <v-list-item-content>
-    <v-list-item-title>{{ item.title }}</v-list-item-title>
-  </v-list-item-content>
-</v-list-item>
+<VListItem id="layout-nav-item" :prepend-icon="item.icon">
  +  <VListItemTitle>{{ item.title }}</VListItemTitle>
  +</VListItem>
```

For more complex prepend content, use the `#prepend` slot:

```diff
-<v-list-item-action>
-  <v-icon>mdi-account</v-icon>
-</v-list-item-action>
+<template #prepend>
+  <VIcon>mdi-account</VIcon>
+</template>
```

## Component Tag Naming

Vuetify 3 recommends **PascalCase** over kebab-case (auto-imported):

| kebab-case (V2) | PascalCase (V3) |
|-----------------|-----------------|
| `<v-app>` | `<VApp>` |
| `<v-main>` | `<VMain>` |
| `<v-container>` | `<VContainer>` |
| `<v-row>` | `<VRow>` |
| `<v-col>` | `<VCol>` |
| `<v-card>` | `<VCard>` |
| `<v-btn>` | `<VBtn>` |
| `<v-text-field>` | `<VTextField>` |
| `<v-form>` | `<VForm>` |
| `<v-list>` | `<VList>` |
| `<v-list-item>` | `<VListItem>` |

## Nuxt Layout

Nuxt 4 changed layouts from `<Nuxt />` to `<slot />`:

```diff
-<Nuxt />
+<slot />
```

Layout root containers must include layout-scoped identifiers:

```diff
-<VAppBar elevation="2" fixed app>
-  <VAppBarNavIcon @click.stop="drawer = !drawer" />
-  <VToolbarTitle>{{ title }}</VToolbarTitle>
+<VAppBar id="layout-app-bar" elevation="2" fixed app>
+  <VAppBarNavIcon id="layout-nav-icon" @click.stop="drawer = !drawer" />
+  <VToolbarTitle id="layout-title">{{ title }}</VToolbarTitle>
```

## Options API → Composition API

```diff
-<script>
-export default {
-  data() {
-    return { email: "", password: "" }
-  },
-  methods: {
-    submitLogin() { ... }
-  }
-}
-</script>
+<script setup lang="ts">
+const email = ref("")
+const password = ref("")
+function submitLogin() { ... }
+</script>
```

## Routing (Nuxt 4)

```diff
-this.$router.push("/login")
+navigateTo("/login")
```

```diff
-this.$route.query.redirect
+route.query.redirect
```

## Page Meta

```diff
-export default {
-  middleware: ["guest"],
-  ...
-}
+<script setup lang="ts">
+definePageMeta({
+  title: "Inicio Sesión",
+})
+</script>
```

## VBtn Props (Fab/Icon)

## VBtn Variants

Vuetify 3/4 adds explicit `variant` prop:

| Variant | Visual |
|---------|--------|
| `elevated` | Solid bg with shadow (default) |
| `flat` | Solid bg, no shadow |
| `tonal` | Muted bg of the color |
| `outlined` | Border only, transparent |
| `text` | No bg, no border |

```diff
-<VBtn color="primary">Guardar</VBtn>
+<VBtn color="primary" variant="elevated">Guardar</VBtn>
```

## VBtn Props (Fab/Icon)

```diff
-<v-btn class="ml-3" small fab color="blue white--text" id="btn-layout-account">
-  <v-icon>mdi-account</v-icon>
-</v-btn>
+<VBtn id="btn-layout-account" class="ml-3" size="small" color="blue" variant="flat" icon>
+  <VIcon color="white">mdi-account</VIcon>
+</VBtn>
```

Key differences:
- `fab` is replaced by `icon` prop
- Vuetify 3 `icon` defaults to `variant="text"` (no background) — add `variant="flat"` or `variant="elevated"` for a solid background
- `color="blue white--text"` → `color="blue"` + `VIcon color="white"`
- `small` → `size="small"`

## VContainer fluid (SSR Hydration)

```diff
-<v-container fluid>
+<VContainer :fluid="true">
```

Bare `fluid` attribute in Vuetify 3 can cause SSR hydration mismatches (server skips the `v-container--fluid` class). Always use `:fluid="true"` (bound boolean prop) to ensure consistency.

## Text Color Classes

Vuetify 2's `text--primary` (high-emphasis dark text) is **not** the same as Vuetify 3's `text-primary`:

| Vuetify 2 | Vuetify 3 | Effect |
|-----------|-----------|--------|
| `text--primary` | `text-grey-darken-4` | Dark text (near-black), safe on any background |
| `text--secondary` | `text-grey-darken-1` | Medium emphasis |
| `text-primary` (V3) | `text-primary` | Theme primary color (often blue) — low contrast on yellow/light backgrounds |

Use `text-grey-darken-4` instead of `text-primary` when you need dark readable text on colored backgrounds.

## VCard flat / outlined

```diff
-<v-card flat outlined>
+<VCard flat border>
```

- `flat` still works in Vuetify 3
- `outlined` was removed — use `border` prop or `variant="outlined"` instead

## VSwitch

```diff
-<v-switch v-model="combinedView" hide-details dense inset class="mt-0 pt-0" />
+<VSwitch v-model="combinedView" hide-details density="compact" inset class="mt-0 pt-0" />
```

- `dense` → `density="compact"` (also applies to VTextField, VSelect, etc.)

## VAvatar

```diff
-<v-avatar color="primary" size="52" class="mr-3">
-  <span class="white--text text-h6">{{ initials }}</span>
-</v-avatar>
+<VAvatar color="primary" size="52" class="mr-3">
+  <span class="text-white text-h6">{{ initials }}</span>
+</VAvatar>
```

- `white--text` → `text-white`

## VProgressCircular

```diff
-<v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
+<VProgressCircular indeterminate color="primary" size="64" />
```

- Self-closing tag is valid in Vue 3

## Absent/Unsupported Components

| Component | Status | Replacement |
|-----------|--------|-------------|
| `v-skeleton-loader` | Migrated | `VSkeletonLoader` (same name, PascalCase) |

## VIcon Props (removed `left` / `right` / `small`)

Vuetify 2's `left` and `right` props on `v-icon` were removed. Use `start` (margin-inline-end) or `end` (margin-inline-start) instead:

```diff
-<VIcon left size="small">mdi-account</VIcon>
+<VIcon start size="small">mdi-account</VIcon>
```

```diff
-<VIcon right>mdi-arrow-right</VIcon>
+<VIcon end>mdi-arrow-right</VIcon>
```

The `small` prop on `VIcon` was also removed. Use `size="small"` instead:

```diff
-<VIcon start small color="primary">mdi-domain</VIcon>
+<VIcon start size="small" color="primary">mdi-domain</VIcon>
```

Alternatively, use spacing classes: `class="mr-1"` or `class="me-1"` for left, `class="ml-1"` or `class="ms-1"` for right.

## VContainer fluid (bare attribute)

Use `:fluid="true"` instead of `fluid` to avoid SSR hydration mismatches:

```diff
-<VContainer fluid />
-<VContainer fluid class="fill-height">
+<VContainer :fluid="true" />
+<VContainer :fluid="true" class="fill-height">
```

## SCSS Style Overrides (avoid conflicting with Vuetify classes)

Do **not** redefine Vuetify utility class names in scoped styles. For example, `logout.vue` defined:

```css
.fill-height {
  height: 100vh;
}
```

## Striped Row Color Override

Vuetify 4 applies stripes via `v-table--striped-odd` class on the `<table>` wrapper using `background-image: linear-gradient(...)`. The Vuetify 2/3 class `v-data-table__tr--striped` does not exist.

```diff
-:deep(.v-data-table__tr--striped) {
-  background-color: #f5fbff !important;
-}
+:deep(.v-table--striped-odd > .v-table__wrapper > table > tbody > tr:nth-child(odd)) {
+  background-image: none !important;
+  background-color: #f5fbff !important;
+}
```

## VIcon Size Inside VBtn icon

Inside a `VBtn` with `icon` prop, `--v-icon-size-multiplier` is `1`. The default VIcon size prop value is `'default'` (not absent), so even omitting `size` gives class `v-icon--size-default` (`1.5em`). To maximize icon size inside a small icon button:

```diff
-<VIcon>mdi-pencil</VIcon>
+<VIcon size="x-large">mdi-pencil</VIcon>
```

Predefined VIcon sizes (relative to parent font):
- default: `1.5em`
- large: `1.75em`
- x-large: `2em`

This overrides Vuetify's `.fill-height` (`height: 100%`) and creates a scrollbar with fixed VAppBar. Remove custom definitions of Vuetify utility class names.

## VChip Props

Vuetify 3's `VChip` retains the `label` prop (removes border-radius). No migration needed.

The `dark` prop was **removed** from VChip (and all other components) in Vuetify 3:

```diff
-<v-chip small color="primary" dark label>{{ role }}</v-chip>
+<VChip size="small" color="primary" variant="elevated" label>{{ role }}</VChip>
```

In Vuetify 3, text color is automatically applied based on the component's `color` — white text on dark backgrounds (primary, secondary, error, etc.), dark text on light backgrounds (outlined, default). Just remove `dark`.

Always specify `variant="elevated"` on solid-background chips (default variant in Vuetify 2 was elevated with shadow). Without an explicit `variant`, Vuetify 3 chips may render as `variant="flat"` depending on context, losing the expected shadow and visual depth.

## VRow Props (dense)

Vuetify 3's `VRow` still supports the `dense` boolean prop (same as Vuetify 2). It does **not** have a `density` prop — only components with sizing variants (VBtn, VTextField, VSelect, VDataTable, etc.) use `density`.

## Vuetify 2–Only Utility Classes

These Vuetify 2 utility classes were removed in Vuetify 3:

| Class | Vuetify 3 Replacement |
|-------|----------------------|
| `fill-height` | Same class — **still works** in Vuetify 3 (`height: 100%`). Do NOT use `min-height: 100vh` — `100vh` doesn't account for the fixed VAppBar (64px padding on VMain), creating a vertical scrollbar. |
| `text-none` (text-transform) | Remove — Vuetify 3 buttons have no text-transform by default, or use inline `style` |
| `text-decoration-none` | `style="text-decoration: none"` (not a Vuetify utility) |

```diff
-<VRow align="center" justify="center" class="fill-height">
+<VRow align="center" justify="center" class="fill-height">
```

```diff
-<VBtn id="login-submit" type="submit" color="primary" block size="large" class="text-none">Ingresar</VBtn>
+<VBtn id="login-submit" type="submit" color="primary" block size="large">Ingresar</VBtn>
```

```diff
-<a href="#" class="text-decoration-none text-primary" @click.prevent="...">
+<a href="#" class="text-primary" style="text-decoration: none" @click.prevent="...">
```

## Autofill CSS Fix

Vuetify 2 classes (`.v-text-field--outlined`, `.v-label`) were renamed in Vuetify 3 (`.v-field--variant-outlined`, `.v-field-label`):

```diff
-:deep(.v-text-field--outlined) input:-webkit-autofill ~ .v-label,
-:deep(.v-text-field--outlined) input:-webkit-autofill:focus ~ .v-label {
+:deep(.v-field--variant-outlined) input:-webkit-autofill ~ .v-field-label,
+:deep(.v-field--variant-outlined) input:-webkit-autofill:focus ~ .v-field-label {
   transform: translateY(-24px) scale(0.75);
   top: 0px;
   background: white;
   padding: 0 4px;
 }
```

## Striped Row Color Override

Vuetify 4 applies stripes via `v-table--striped-odd` class on the `<table>` wrapper using `background-image: linear-gradient(...)`. The Vuetify 2/3 class `v-data-table__tr--striped` does not exist.

```diff
-:deep(.v-data-table__tr--striped) {
-  background-color: #f5fbff !important;
-}
+:deep(.v-table--striped-odd > .v-table__wrapper > table > tbody > tr:nth-child(odd)) {
+  background-image: none !important;
+  background-color: #f5fbff !important;
+}
```

## VIcon Size Inside VBtn icon

Inside a `VBtn` with `icon` prop, `--v-icon-size-multiplier` is `1`. The default VIcon size prop value is `'default'` (not absent), so even omitting `size` gives class `v-icon--size-default` (`1.5em`). To maximize icon size inside a small icon button:

```diff
-<VIcon>mdi-pencil</VIcon>
+<VIcon size="x-large">mdi-pencil</VIcon>
```

Predefined VIcon sizes (relative to parent font):
- default: `1.5em`
- large: `1.75em`
- x-large: `2em`

## VDataTable (v-model:options)

Vuetify 3's `VDataTable` changed from `:options.sync` to `v-model:options`:

```diff
-<v-data-table :options.sync="optionsTable" @update:sort-by="sortTable">
+<VDataTable v-model:options="optionsTable" @update:options="onUpdateOptions">
```

**Important:** Avoid a reactive loop when emitting sorting changes back to the parent. Only emit `"sorting"` from the `@update:options` event (user interaction), not from a deep `watch` on `optionsTable`:

```diff
-// ❌ Bucle infinito: watch emite en cada cambio, padre actualiza options, watch se dispara de nuevo
-watch(optionsTable, (val) => {
-  emit("sorting", val)
-}, { deep: true })

+// ✅ Solo emitir desde el evento del VDataTable (cambio real del usuario)
+function onUpdateOptions(val: Record<string, unknown>) {
+  emit("sorting", val)
+}
```

## Striped Row Color Override

Vuetify 4 applies stripes via `v-table--striped-odd` class on the `<table>` wrapper using `background-image: linear-gradient(...)`. The Vuetify 2/3 class `v-data-table__tr--striped` does not exist.

```diff
-:deep(.v-data-table__tr--striped) {
-  background-color: #f5fbff !important;
-}
+:deep(.v-table--striped-odd > .v-table__wrapper > table > tbody > tr:nth-child(odd)) {
+  background-image: none !important;
+  background-color: #f5fbff !important;
+}
```

## VIcon Size Inside VBtn icon

Inside a `VBtn` with `icon` prop, `--v-icon-size-multiplier` is `1`. The default VIcon size prop value is `'default'` (not absent), so even omitting `size` gives class `v-icon--size-default` (`1.5em`). To maximize icon size inside a small icon button:

```diff
-<VIcon>mdi-pencil</VIcon>
+<VIcon size="x-large">mdi-pencil</VIcon>
```

Predefined VIcon sizes (relative to parent font):
- default: `1.5em`
- large: `1.75em`
- x-large: `2em`

On the parent page, do **not** update `options` ref from the sorting event — use the sorting options directly for the API call:

```diff
-async function indexOrganizations(extraOptions) {
-  if (extraOptions) {
-    options.value = { ...options.value, ...extraOptions }
-  }
-  const op = { filter: filterOrganization.value, ...options.value }
+async function indexOrganizations(sortingOptions) {
+  const op = sortingOptions
+    ? { filter: filterOrganization.value, ...sortingOptions }
+    : { filter: filterOrganization.value, ...options.value }
   response.value = await apiIndex(op)
 }
```

## Striped Row Color Override

Vuetify 4 applies stripes via `v-table--striped-odd` class on the `<table>` wrapper using `background-image: linear-gradient(...)`. The Vuetify 2/3 class `v-data-table__tr--striped` does not exist.

```diff
-:deep(.v-data-table__tr--striped) {
-  background-color: #f5fbff !important;
-}
+:deep(.v-table--striped-odd > .v-table__wrapper > table > tbody > tr:nth-child(odd)) {
+  background-image: none !important;
+  background-color: #f5fbff !important;
+}
```

## VIcon Size Inside VBtn icon

Inside a `VBtn` with `icon` prop, `--v-icon-size-multiplier` is `1`. The default VIcon size prop value is `'default'` (not absent), so even omitting `size` gives class `v-icon--size-default` (`1.5em`). To maximize icon size inside a small icon button:

```diff
-<VIcon>mdi-pencil</VIcon>
+<VIcon size="x-large">mdi-pencil</VIcon>
```

Predefined VIcon sizes (relative to parent font):
- default: `1.5em`
- large: `1.75em`
- x-large: `2em`

## Components Directory (Nuxt 4)

Nuxt 4 scans `app/components/` for auto-imported components, **not** the root `components/` directory. All other user directories are also under `app/`:

```
app/components/   ← ✅ scanned
app/composables/  ← ✅ scanned
app/pages/        ← ✅ scanned
app/layouts/      ← ✅ scanned
app/middleware/    ← ✅ scanned
components/       ← ❌ NOT scanned (Nuxt 4)
```

If components are placed at root `components/`, the build will **not** emit any error but the component will fail to resolve at runtime:

```
[Vue warn]: Failed to resolve component: OrganizationTable
```

## VBtn icon (circular vs square)

Vuetify 2 `v-btn--fab` creates a **circular** icon button. Vuetify 3's `icon` prop creates a **square** button by default:

```diff
-<VBtn title="Editar" color="primary" variant="outlined" size="small" icon>
+<VBtn title="Editar" color="primary" variant="outlined" size="small" icon rounded="circle">
```

The `rounded="circle"` prop applies `border-radius: 50%` for a perfectly circular button that matches the V2 `fab` look.

This is especially common for the layout's back button, which was `outlined fab` in Vuetify 2:

```diff
-<v-btn outlined fab small elevation="0" @click="backHandler">
-  <v-icon>mdi-arrow-left</v-icon>
-</v-btn>
+<VBtn icon variant="outlined" rounded="circle" size="small" @click="handleBack">
+  <VIcon>mdi-arrow-left</VIcon>
+</VBtn>
```

## Data Loading for Auth-Protected APIs

`useAsyncData` runs during SSR, but auth tokens from `localStorage` are **not available** on the server. For pages that require an auth token:

```diff
-const { data: initialResponse, error: initialError } = await useAsyncData("key", () =>
-  apiIndex(options.value)
-)
-if (initialResponse.value) response.value = initialResponse.value
+onMounted(async () => {
+  await loadData()
+})
```

This ensures the API call runs client-side where `localStorage.getItem("auth.token")` is available.

Vuetify 3's VDataTable `@update:options` does **not** fire on mount — it only fires on user interaction (sort, paginate). Do not rely on it for the initial data load.

**Vuetify 4 differs:** `@update:options` fires **immediately on mount** (`immediate: true` in `useOptions`), so the initial `emit("sorting")` in `onUpdateOptions` works as the data load trigger via `@update:options`.

## VDataTable Header Text Color

Vuetify 4's VDataTable uses CSS layers and may not properly inherit the theme text color for header `<th>` elements. The header text can appear white (invisible) on a light background:

```diff
+<style scoped>
+:deep(.v-data-table th) {
+  color: rgba(0, 0, 0, 0.87);
+}
+</style>
```

This explicitly sets the header text to dark (87% opacity black) in the light theme.

## VDataTable Headers (`text` → `title`)

Vuetify 4 changed the header property from `text` to `title`. Using `text` causes the header cell to render with no text:

```diff
 const headers: Header[] = [
-  { text: "name", value: "name", sortable: true },
+  { title: "name", value: "name", sortable: true },
 ]
```

Both `key` and `value` are accepted for the data field identifier (fallback chain: `key` → `value`). The `title` property is the only one that controls the visible header label.

## VDataTableServer (Vuetify 4 Server-Side)

Vuetify 4 removed `v-model:options` from `VDataTable`. For server-side pagination/sorting, use `VDataTableServer` with individual `v-model:page`, `v-model:items-per-page`, and `v-model:sort-by` bindings:

```diff
-<VDataTable v-model:options="optionsTable" @update:options="onUpdateOptions">
+<VDataTableServer
+  v-model:page="page"
+  v-model:items-per-page="itemsPerPage"
+  v-model:sort-by="sortBy"
+  :items="items"
+  :items-length="total"
+  @update:options="onUpdateOptions"
+>
```

### sortBy format

Vuetify 4 uses `{ key: string; order: 'asc' | 'desc' }[]` instead of Vuetify 2's `{ sortBy: string[]; sortDesc: boolean[] }`:

```diff
-// Vuetify 2
-{ sortBy: ["name"], sortDesc: [true] }
+// Vuetify 4
+[{ key: "name", order: "desc" }]
```

### stripped prop (type change)

Vuetify 4 changed `striped` from boolean to string. Use `"even"` or `"odd"`:

```diff
-<VDataTableServer striped>
+<VDataTableServer striped="odd">
```

### v-model:options removed

Replace `v-model:options` with individual `v-model:page`, `v-model:items-per-page`, `v-model:sort-by`. The `@update:options` event still fires (on mount and on change) and the emitted value format matches the v-model bindings:

```js
{
  page: 1,
  itemsPerPage: 5,
  sortBy: [{ key: "name", order: "desc" }],
  groupBy: [],
  search: ""
}
```

## Striped Row Color Override

Vuetify 4 applies stripes via `v-table--striped-odd` class on the `<table>` wrapper using `background-image: linear-gradient(...)`. The Vuetify 2/3 class `v-data-table__tr--striped` does not exist.

```diff
-:deep(.v-data-table__tr--striped) {
-  background-color: #f5fbff !important;
-}
+:deep(.v-table--striped-odd > .v-table__wrapper > table > tbody > tr:nth-child(odd)) {
+  background-image: none !important;
+  background-color: #f5fbff !important;
+}
```

## VIcon Size Inside VBtn icon

Inside a `VBtn` with `icon` prop, `--v-icon-size-multiplier` is `1`. The default VIcon size prop value is `'default'` (not absent), so even omitting `size` gives class `v-icon--size-default` (`1.5em`). To maximize icon size inside a small icon button:

```diff
-<VIcon>mdi-pencil</VIcon>
+<VIcon size="x-large">mdi-pencil</VIcon>
```

Predefined VIcon sizes (relative to parent font):
- default: `1.5em`
- large: `1.75em`
- x-large: `2em`

### firstSortDesc pattern

To make a column sort descending on first click (non-standard), intercept `@update:options` and override the sort order before emitting to the parent:

```ts
const headers: Header[] = [
  { title: "name", value: "name", sortable: true, firstSortDesc: true },
]

function onUpdateOptions(val: Record<string, unknown>) {
  const sortByArr = (val.sortBy as { key: string; order: string }[]) ?? []
  if (sortByArr.length) {
    const first = sortByArr[0]
    const head = headers.find((x) => x.value === first.key)
    if (head?.firstSortDesc && first.order !== 'desc') {
      sortBy.value = [{ key: first.key, order: 'desc' }]
      return // suppress emit, watcher will re-fire with desc
    }
  }
  emit("sorting", val)
}
```

## Striped Row Color Override

Vuetify 4 applies stripes via `v-table--striped-odd` class on the `<table>` wrapper using `background-image: linear-gradient(...)`. The Vuetify 2/3 class `v-data-table__tr--striped` does not exist.

```diff
-:deep(.v-data-table__tr--striped) {
-  background-color: #f5fbff !important;
-}
+:deep(.v-table--striped-odd > .v-table__wrapper > table > tbody > tr:nth-child(odd)) {
+  background-image: none !important;
+  background-color: #f5fbff !important;
+}
```

## VIcon Size Inside VBtn icon

Inside a `VBtn` with `icon` prop, `--v-icon-size-multiplier` is `1`. The default VIcon size prop value is `'default'` (not absent), so even omitting `size` gives class `v-icon--size-default` (`1.5em`). To maximize icon size inside a small icon button:

```diff
-<VIcon>mdi-pencil</VIcon>
+<VIcon size="x-large">mdi-pencil</VIcon>
```

Predefined VIcon sizes (relative to parent font):
- default: `1.5em`
- large: `1.75em`
- x-large: `2em`

This modifies the `sortBy` ref directly (which is `v-model:sort-by` bound), causing a second `@update:options` call with the corrected order. Vue batches DOM updates so no visual flash occurs.

### search prop for filter-triggered page reset

Vuetify 4's `useOptions` composable watches the `search` prop and resets `page.value = 1` when it changes. Pass the filter text as the `search` prop instead of manually watching the filter:

```diff
-<OrganizationTable :filter="filterOrganization" />
+<OrganizationTable :search="filterOrganization" />
```

```diff
-// parent: watch(filterOrganization, ...) → manual API call
-// table: watch(filter, ...) → reset page
+// Vuetify 4 handles page reset + emits @update:options with new search value
```

The `@update:options` event includes `search`, so the parent uses it directly for the API filter parameter.

### onMounted + @update:options (instead of useAsyncData)

Since `@update:options` fires immediately on mount in Vuetify 4, use it as the initial load trigger. Pair with `onMounted` only if the component is conditionally rendered or needs extra initialization:

```ts
// Vuetify 4: @update:options fires on mount, so no separate onMounted load needed
const lastOptions = ref<Record<string, unknown> | null>(null)

async function indexOrganizations(opts: Record<string, unknown>) {
  lastOptions.value = opts
  const params: Record<string, unknown> = {
    page: opts.page ?? 1,
    itemsPerPage: opts.itemsPerPage ?? 5,
  }
  const sortBy = (opts.sortBy as { key: string; order: string }[]) ?? []
  if (sortBy.length > 0) {
    params.sortBy = [sortBy[0].key]
    params.sortDesc = [sortBy[0].order]
  }
  if (filterOrganization.value) {
    params.filter = filterOrganization.value
  }
  loading.value = true
  response.value = await apiIndex(params)
  loading.value = false
}
```

## Striped Row Color Override

Vuetify 4 applies stripes via `v-table--striped-odd` class on the `<table>` wrapper using `background-image: linear-gradient(...)`. The Vuetify 2/3 class `v-data-table__tr--striped` does not exist.

```diff
-:deep(.v-data-table__tr--striped) {
-  background-color: #f5fbff !important;
-}
+:deep(.v-table--striped-odd > .v-table__wrapper > table > tbody > tr:nth-child(odd)) {
+  background-image: none !important;
+  background-color: #f5fbff !important;
+}
```

## VIcon Size Inside VBtn icon

Inside a `VBtn` with `icon` prop, `--v-icon-size-multiplier` is `1`. The default VIcon size prop value is `'default'` (not absent), so even omitting `size` gives class `v-icon--size-default` (`1.5em`). To maximize icon size inside a small icon button:

```diff
-<VIcon>mdi-pencil</VIcon>
+<VIcon size="x-large">mdi-pencil</VIcon>
```

Predefined VIcon sizes (relative to parent font):
- default: `1.5em`
- large: `1.75em`
- x-large: `2em`

For refresh operations, store the last emitted options and re-use them:

```ts
function refresh() {
  if (lastOptions.value) {
    indexOrganizations(lastOptions.value)
  }
}
```

## Striped Row Color Override

Vuetify 4 applies stripes via `v-table--striped-odd` class on the `<table>` wrapper using `background-image: linear-gradient(...)`. The Vuetify 2/3 class `v-data-table__tr--striped` does not exist.

```diff
-:deep(.v-data-table__tr--striped) {
-  background-color: #f5fbff !important;
-}
+:deep(.v-table--striped-odd > .v-table__wrapper > table > tbody > tr:nth-child(odd)) {
+  background-image: none !important;
+  background-color: #f5fbff !important;
+}
```

## VIcon Size Inside VBtn icon

Inside a `VBtn` with `icon` prop, `--v-icon-size-multiplier` is `1`. The default VIcon size prop value is `'default'` (not absent), so even omitting `size` gives class `v-icon--size-default` (`1.5em`). To maximize icon size inside a small icon button:

```diff
-<VIcon>mdi-pencil</VIcon>
+<VIcon size="x-large">mdi-pencil</VIcon>
```

Predefined VIcon sizes (relative to parent font):
- default: `1.5em`
- large: `1.75em`
- x-large: `2em`

## Dynamic NavBar Title (`eventBus.$emit("setNavBar")`)

The AUI app used a global event bus to update the VAppBar title dynamically:

```diff
-mounted() {
-  const eventBus = this.$eventBus || this.$nuxt
-  eventBus.$emit("setNavBar", { title: `Perfiles de: ${this.mUser.name} ${this.mUser.last_name}`, icon: "mdi-account", back: `/user`, showDrawer: false })
-},
```

In Nuxt4, the layout reads `route.meta.title` for the VAppBar title. Set it directly after the async data loads:

```diff
+import { useRoute } from "vue-router"
+const route = useRoute()

 onMounted(async () => {
   const res = await api.show(id)
   mUser.value = res as Record<string, unknown>

+  if (mUser.value.name) {
+    route.meta.title = `Perfiles de: ${mUser.value.name} ${mUser.value.last_name ?? ""}`.trim()
+  }
 })
```

- `route.meta` is reactive — changes reflect immediately in the layout's `computed` title.
- Only set the `title` property. The AUI `icon`, `back`, and `showDrawer` properties are not used by the Nuxt4 layout.
- The static `definePageMeta({ title })` is replaced dynamically after the API call.

## Form Validation (Client + Server)

### Client-side rules — `useVrules` composable

Replaces AUI's Vue `$vrules` global mixin. Drop-in equivalent:

```ts
import { useVrules } from "~/composables/useVrules"
const { vrules } = useVrules()
```

```diff
-:rules="[$vrules.required]"
+:rules="[vrules.required]"
```

For field-specific error messages (matching AUI's `$vrules.requiredField('name')`):

```diff
-:rules="[$vrules.required]"
+:rules="[vrules.requiredField('Nombre')]"
```

Uses the field's display label so validation reads: *"El campo Nombre es obligatorio."* instead of generic *"El campo es obligatorio."*

Available rules: `required`, `requiredField(name)`, `email`, `minLength(n)`, `maxLength(n)`, `between(min,max)`, `numeric`, `integer`, `alpha`, `alphaNum`, `url`, `pattern(regex,msg)`, `confirmed(val)`, `phone`, `min(n)`, `max(n)`.

Import explicitly rather than relying on Nuxt auto-import for newly created composables.

### Server-side validation errors — `useValidationErrors` composable

Replaces AUI's Vuex `validation/errors` store:

```ts
import { useValidationErrors } from "~/composables/useValidationErrors"
const { errors, clearErrors } = useValidationErrors()
```

`errors?.fieldName` is `string[]`. `withNotify.ts` calls `extractFromError(err)` on 422. Call `clearErrors()` on dialog close.

### Form submission — `VForm` + `validate()`

```diff
-<VCardText>...</VCardText>
+<VCardText>
+  <VForm ref="formRef">...</VForm>
+</VCardText>

## Dynamic NavBar Title (`eventBus.$emit("setNavBar")`)

The AUI app used a global event bus to update the VAppBar title dynamically:

```diff
-mounted() {
-  const eventBus = this.$eventBus || this.$nuxt
-  eventBus.$emit("setNavBar", { title: `Perfiles de: ${this.mUser.name} ${this.mUser.last_name}`, icon: "mdi-account", back: `/user`, showDrawer: false })
-},
```

In Nuxt4, the layout reads `route.meta.title` for the VAppBar title. Set it directly after the async data loads:

```diff
+import { useRoute } from "vue-router"
+const route = useRoute()

 onMounted(async () => {
   const res = await api.show(id)
   mUser.value = res as Record<string, unknown>

+  if (mUser.value.name) {
+    route.meta.title = `Perfiles de: ${mUser.value.name} ${mUser.value.last_name ?? ""}`.trim()
+  }
 })
```

- `route.meta` is reactive — changes reflect immediately in the layout's `computed` properties.
- The layout reads `route.meta.icon`, `route.meta.back` (to show a back arrow), and `route.meta.showDrawer` (boolean to toggle the hamburger menu), so set these as well if they were in the AUI event payload.
- The static `definePageMeta({ title })` is replaced dynamically after the API call.

## Form Validation (Client + Server)

### Client-side rules — `useVrules` composable

Replaces AUI's Vue `$vrules` global mixin. Drop-in equivalent:

```ts
import { useVrules } from "~/composables/useVrules"
const { vrules } = useVrules()
```

```diff
-:rules="[$vrules.required]"
+:rules="[vrules.required]"
```

For field-specific error messages (matching AUI's `$vrules.requiredField('name')`):

```diff
-:rules="[$vrules.required]"
+:rules="[vrules.requiredField('Nombre')]"
```

Uses the field's display label so validation reads: *"El campo Nombre es obligatorio."* instead of generic *"El campo es obligatorio."*

Available rules: `required`, `requiredField(name)`, `email`, `minLength(n)`, `maxLength(n)`, `between(min,max)`, `numeric`, `integer`, `alpha`, `alphaNum`, `url`, `pattern(regex,msg)`, `confirmed(val)`, `phone`, `min(n)`, `max(n)`.

Import explicitly rather than relying on Nuxt auto-import for newly created composables.

### Server-side validation errors — `useValidationErrors` composable

Replaces AUI's Vuex `validation/errors` store:

```ts
import { useValidationErrors } from "~/composables/useValidationErrors"
const { errors, clearErrors } = useValidationErrors()
```

`errors?.fieldName` is `string[]`. `withNotify.ts` calls `extractFromError(err)` on 422. Call `clearErrors()` on dialog close.

### Form submission — `VForm` + `validate()`

```diff
-<VCardText>...</VCardText>
+<VCardText>
+  <VForm ref="formRef">...</VForm>
+</VCardText>
```

```diff
-function save() { emit("save", { ...item.value }) }
+const formRef = ref()
+async function save() {
+  const { valid } = await formRef.value?.validate() ?? { valid: false }
+  if (!valid) return
+  emit("save", { ...item.value })
+}
```

## Dynamic NavBar Title — Sub-pages (nested async data)

Same pattern as the `setNavBar` section above, but for deeply nested pages where
both a parent resource (user) and a child resource (profile) are fetched in
parallel before the title can be built.

### AUI source (`pages/user/_id/profile/_profile_id/index.vue`)

```js
// Options API — mounted() fires AFTER asyncData resolves, mUser is already populated
mounted() {
  const eventBus = this.$eventBus || this.$nuxt
  eventBus.$emit("setNavBar", {
    title: `Perfilx: ${this.mUser.name} ${this.mUser.last_name}`,
    icon: "mdi-account",
    back: `/user`,
    showDrawer: false,
  })
},
```

### Nuxt 4 equivalent (`pages/user/[id]/profile/[profile_id]/index.vue`)

```ts
const route = useRoute()

onMounted(async () => {
  const [_mUser, _profile] = await Promise.all([
    User.show(userId).catch(() => null),
    Profile.show(userId, profileId).catch(() => null),
  ])
  mUser.value = (_mUser as Record<string, unknown>) ?? {}
  profile.value = (_profile as Record<string, unknown>) ?? {}

  // Replicates eventBus.$emit("setNavBar", { title: `...`, icon: '...', back: '...', showDrawer: false })
  // layout reads: computed(() => route.meta?.title || 'Latiabetina') (and back, icon, showDrawer)
  if (mUser.value.name) {
    route.meta.title = `Perfil de: ${mUser.value.name} ${mUser.value.last_name ?? ''}`.trim()
    route.meta.icon = "mdi-account"
    route.meta.back = "/user"
    route.meta.showDrawer = false
  }
})
```

### Migration diff

```diff
-mounted() {
-  const eventBus = this.$eventBus || this.$nuxt
-  eventBus.$emit("setNavBar", {
-    title: `Perfilx: ${this.mUser.name} ${this.mUser.last_name}`,
-    icon: "mdi-account",
-    back: `/user`,
-    showDrawer: false,
-  })
-},
+onMounted(async () => {
+  // ... parallel API calls (User.show + Profile.show) ...
+  if (mUser.value.name) {
+    route.meta.title = `Perfil de: ${mUser.value.name} ${mUser.value.last_name ?? ''}`.trim()
+    route.meta.icon = "mdi-account"
+    route.meta.back = "/user"
+    route.meta.showDrawer = false
+  }
+})
```

### Rules

- Set `route.meta.title`, `route.meta.icon`, `route.meta.back`, and `route.meta.showDrawer` **inside `onMounted`**, after all async calls resolve.
  `definePageMeta({ title })` is static and cannot use runtime data.
- Guard with `if (mUser.value.name)` to avoid `"undefined undefined"` if the API fails.
- Use `.trim()` to avoid trailing whitespace when `last_name` is absent.
- `route.meta` is reactive — the layout's `computed` properties update immediately.
