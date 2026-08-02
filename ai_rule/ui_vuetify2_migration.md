# Vuetify 2 → Vuetify 4 Migration Guide

> **Identifiers:** All interactive elements must include an `id` per `ai_rule/ui_identifiers_convention.md`.

## Component Props

| Vuetify 2 | Vuetify 3/4 |
|-----------|-------------|
| `dense` | `density="compact"` (form controls, tables) / `density="comfortable"` (**VRow only**) |
| `outlined` (VTextField) | `variant="outlined"` |
| `outlined` (VBtn) | `variant="outlined"` |
| `large` (VBtn) | `size="large"` |
| `small` (VBtn) | `size="small"` |
| `block` (VBtn) | `block` (still supported) |
| `v-layout` | `VRow` |
| `v-flex` | `VCol` |
| `@click:append` | `@click:append-inner` |
| `append-icon` | `append-inner-icon` |
| `grey--text text--darken-1` | `text-grey-darken-1` |

> **Note:** `VRow`'s `dense` prop is deprecated. The warning suggests `density="comfortable"` (not `"compact"`), though `VRow` does not officially expose a `density` prop — the deprecation is handled by the framework's prop validation.

## Grid System

Vuetify 3/4 removed `v-layout` and `v-flex`. Use `VRow` / `VCol` instead:

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

## VCardActions (prefer div over VCardActions)

`VCardActions` is **still supported** in Vuetify 3/4, but it applies default styles (gap, padding, button overrides) that can distort `VBtn` appearance. Use a plain `div` with flex utilities for cleaner button rendering:

**VCardText density** — use `class="py-1"` for compact content area (VCardText has no `dense`/`density` prop):

```diff
-<VCardText>
+<VCardText class="py-1">
```

**Button container** — replace `VCardActions` with right-aligned flex div with horizontal and bottom padding only:

```diff
-<VCardActions class="pa-4">
-  <VSpacer />
-  <VBtn color="primary" variant="outlined" class="mr-2">Cancelar</VBtn>
-  <VBtn color="primary" variant="elevated">Guardar</VBtn>
-</VCardActions>
+<div class="d-flex justify-end px-4 pb-4">
+  <VBtn color="primary" variant="outlined" class="mr-4">Cancelar</VBtn>
+  <VBtn color="primary" variant="elevated">Guardar</VBtn>
+</div>
```

Key changes:
- `VCardText` → add `class="py-1"` for tight vertical padding
- `VCardActions` → `<div class="d-flex justify-end px-4 pb-4">` (no top padding — `py-1` on VCardText already provides it)
- Remove `<VSpacer />` — `justify-end` handles right alignment
- `mr-2` → `mr-4` for wider button spacing
- VBtn renders with normal button styling (no VCardActions overrides)

## Dividers

```diff
-<v-divider></v-divider>
+<VDivider></VDivider>
```

## List Items

Vuetify 3/4 removed `VListItemContent`, `VListItemAction`, and `VListItemIcon`. Use the `prepend-icon` prop or `#prepend` slot instead:

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

Vuetify 3/4 recommends **PascalCase** over kebab-case (auto-imported):

| kebab-case (V2) | PascalCase (V3/4) |
|-----------------|-------------------|
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

### Page Icon

Add an `icon` property to `definePageMeta` to display an icon next to the page title in the VAppBar. The layout reads `route.meta.icon` and renders a `VIcon` before the title:

```vue
<VIcon v-if="icon" class="mr-0">{{ icon }}</VIcon>
<VToolbarTitle id="layout-title">{{ title }}</VToolbarTitle>
```

**Usage:**

```diff
 definePageMeta({
   title: "Roles",
+  icon: "mdi-redhat",
   middleware: "authenticated",
 })
```

**Recommended icons by page:**

| Page | Icon |
|------|------|
| Dashboard | `mdi-view-dashboard` |
| Organization | `mdi-domain` |
| Role | `mdi-redhat` |
| User | `mdi-account` |
| Permission | `mdi-key-variant` |
| Account/Profile | `mdi-account-circle` |
| Login | `mdi-login` |
| Logout | `mdi-logout` |
| Google Auth | `mdi-google` |

This is the **static** icon — used for top-level index pages. For detail/child pages, set `route.meta.icon` dynamically after the async data loads (see [Dynamic NavBar Title](#dynamic-navbar-title-eventbusemitsetnavbar--avoid-dry-with-a-helper)).

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

## VBtn Spacing Between Adjacent Buttons

Add `class="mr-4"` to each button except the last in a group to maintain consistent spacing:

```diff
+<VBtn id="btn-org-refresh" color="primary" class="mr-4" @click="refresh">
+  Refrescar
+</VBtn>
+<VBtn id="btn-org-new" color="success" @click="newOrganization()">
+  Nueva Organización
+</VBtn>
```

## VBtn icon (circular vs square)

Vuetify 2 `v-btn--fab` creates a **circular** icon button. Vuetify 3/4's `icon` prop creates a **square** button by default:

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

### VIcon Size Inside VBtn icon

Inside a `VBtn` with `icon` prop, `--v-icon-size-multiplier` is `1`. The default VIcon size prop value is `'default'` (not absent), so even omitting `size` gives class `v-icon--size-default` (`1.5em`). To maximize icon size inside a small icon button:

```diff
-<VIcon>mdi-pencil</VIcon>
+<VIcon size="x-large">mdi-pencil</VIcon>
```

Predefined VIcon sizes (relative to parent font):
- default: `1.5em`
- large: `1.75em`
- x-large: `2em`

**Rule:** Always use `size="x-large"` for icons inside `VBtn` with `icon` prop — in table action columns (`AuditoriumEvent/Table.vue`, `User/Table.vue`, `Role/Table.vue`, etc.), the user profile actions, and the layout back button. `size="large"` (`1.75em`) is noticeably smaller and produces inconsistent icon sizing across tables.

## VBtn Props (Fab/Icon) — Vuetify 2 pattern

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
- Vuetify 3/4 `icon` defaults to `variant="text"` (no background) — add `variant="flat"` or `variant="elevated"` for a solid background
- `color="blue white--text"` → `color="blue"` + `VIcon color="white"`
- `small` → `size="small"`

## VContainer fluid (SSR Hydration)

```diff
-<v-container fluid>
+<VContainer :fluid="true">
```

Bare `fluid` attribute in Vuetify 3/4 can cause SSR hydration mismatches (server skips the `v-container--fluid` class). Always use `:fluid="true"` (bound boolean prop) to ensure consistency.

## Text Color Classes

Vuetify 2's `text--primary` (high-emphasis dark text) is **not** the same as Vuetify 3/4's `text-primary`:

| Vuetify 2 | Vuetify 3/4 | Effect |
|-----------|-------------|--------|
| `text--primary` | `text-grey-darken-4` | Dark text (near-black), safe on any background |
| `text--secondary` | `text-grey-darken-1` | Medium emphasis |
| `text-primary` (V3/4) | `text-primary` | Theme primary color (often blue) — low contrast on yellow/light backgrounds |

Use `text-grey-darken-4` instead of `text-primary` when you need dark readable text on colored backgrounds.

## VCard flat / outlined

Vuetify 3/4 replaces the `outlined` boolean prop with the unified `variant` prop system. The old `v-card flat outlined` can be migrated in two ways:

| Approach | Code | Effect |
|----------|------|--------|
| CSS border | `<VCard flat border>` | Adds a thin CSS `border`, keeps default background |
| Outlined variant | `<VCard variant="outlined">` | Uses the outlined style (border + transparent background) |

```diff
-<v-card flat outlined>
+<VCard flat border>
```

- `flat` still works in Vuetify 3/4 — removes elevation/shadow

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

## VChip Props

Vuetify 3/4's `VChip` retains the `label` prop (removes border-radius). No migration needed.

The `dark` prop was **removed** from VChip (and all other components) in Vuetify 3/4:

```diff
-<v-chip small color="primary" dark label>{{ role }}</v-chip>
+<VChip size="small" color="primary" variant="elevated" label>{{ role }}</VChip>
```

In Vuetify 3/4, text color is automatically applied based on the component's `color` — white text on dark backgrounds (primary, secondary, error, etc.), dark text on light backgrounds (outlined, default). Just remove `dark`.

Always specify `variant="elevated"` on solid-background chips (default variant in Vuetify 2 was elevated with shadow). Without an explicit `variant`, Vuetify 3/4 chips may render as `variant="flat"` depending on context, losing the expected shadow and visual depth.

## VRow Props (dense → density)

Vuetify 4 **deprecates** the `dense` boolean prop on `VRow`. Use `density="comfortable"` instead:

```diff
-<VRow dense>
+<VRow density="comfortable">
```

Note: `VRow` uses `density="comfortable"` (not `"compact"`) to match the reduced gap of the old `dense` prop. However, `VRow` does **not officially expose** a `density` prop in the standard Vuetify 3/4 API — the deprecation warning and replacement are handled by the framework's prop validation system.

## Vuetify 2–Only Utility Classes

These Vuetify 2 utility classes were removed in Vuetify 3/4:

| Class | Vuetify 3/4 Replacement |
|-------|-------------------------|
| `fill-height` | Same class — **still works** in Vuetify 3/4 (`height: 100%`). Do NOT use `min-height: 100vh` — `100vh` doesn't account for the fixed VAppBar (64px padding on VMain), creating a vertical scrollbar. |
| `text-none` (text-transform) | Remove — Vuetify 3/4 buttons have no text-transform by default, or use inline `style` |
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

Vuetify 2 classes (`.v-text-field--outlined`, `.v-label`) were renamed in Vuetify 3/4 (`.v-field--variant-outlined`, `.v-field-label`):

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

## SCSS Style Overrides (avoid conflicting with Vuetify classes)

Do **not** redefine Vuetify utility class names in scoped styles. For example, `logout.vue` defined:

```css
.fill-height {
  height: 100vh;
}
```

This overrides Vuetify's `.fill-height` (`height: 100%`) and creates a scrollbar with fixed VAppBar. Remove custom definitions of Vuetify utility class names.

## Absent/Unsupported Components

| Component | Status | Replacement |
|-----------|--------|-------------|
| `v-skeleton-loader` | Migrated | `VSkeletonLoader` (same name, PascalCase, fully supported) |
| `v-select` `menu-icon` prop | Removed | Use `append-inner-icon` prop or `#append-inner` slot instead |

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

## Filter Debounce Pattern

All index/list pages must use a consistent debounced filter pattern with **300ms** delay:

```ts
// Debounced filter
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

Rules:
- Always use `300` (not 500) as the debounce delay — inconsistent timing across pages causes confusing UX.
- Always clear `filter*` immediately when `filterInput` becomes empty (no debounce on clear).
- The `filterInput` ref is bound to the `VTextField`; the `filter*` ref drives the actual API call via the `search` prop on `VDataTableServer` / `VDataTable`.

## VDataTable Headers (`text` → `title`)

Vuetify 4 changed the header property from `text` to `title`. Using `text` causes the header cell to render with no text:

```diff
 const headers: Header[] = [
-  { text: "name", value: "name", sortable: true },
+  { title: "name", value: "name", sortable: true },
 ]
```

Both `key` and `value` are accepted for the data field identifier (fallback chain: `key` → `value`). The `title` property is the only one that controls the visible header label.

## VDataTable Header Text Color

Vuetify 4's VDataTable uses CSS layers and may not properly inherit the theme text color for header `<th>` elements. The header text can appear white (invisible) on a light background:

```diff
+<style scoped>
+:deep(.v-table th) {
+  color: rgba(0, 0, 0, 0.87);
+}
+</style>
```

**Important:** The CSS class changed from Vuetify 2/3's `.v-data-table` to Vuetify 4's `.v-table`. If you have global styles targeting `.v-data-table`, update them:

```diff
-.v-data-table th {
+.v-table th {
   color: #00000099;
   font-weight: bold;
 }
```

This explicitly sets the header text to dark (87% opacity black) in the light theme.

## VDataTable (v-model:options) — Vuetify 3 pattern

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

> **Note:** Vuetify 4 removed `v-model:options` from `VDataTable`. Use `VDataTableServer` instead (see next section).

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

### striped prop (type change)

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

### mustSort behavior (force column to stay sorted)

Vuetify 4's `VDataTableServer` does not natively expose a `mustSort` prop. To enforce a column to always stay sorted (cycling desc → asc → desc without an unsorted state), intercept `@update:options` and re-apply a default sort when `sortBy` is empty:

```ts
function onUpdateOptions(val: Record<string, unknown>) {
  const sortByArr = (val.sortBy as { key: string; order: string }[]) ?? []
  if (sortByArr.length === 0) {
    // Re-apply default sort (unsorted state is not allowed)
    sortBy.value = [{ key: "name", order: "asc" }]
    return // suppresses emit — watcher on sortBy re-fires with the default
  }
  emit("sorting", val)
}
```

This modifies the `v-model:sort-by` bound ref directly, causing a second `@update:options` call with the enforced sort. Vue batches DOM updates so no visual flash occurs.

### On the parent page

Do **not** update `options` ref from the sorting event — use the sorting options directly for the API call:

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

### CRITICAL: `:search` must propagate into `VDataTableServer`

Both the parent **page** AND the child **table component** must bind the `:search` prop to `VDataTableServer`. This is the most common overlooked step.

**Page → Table component:**

```vue
<RoleTable :search="filterRole" />
```

**Table component → VDataTableServer (INSIDE the component):**

```vue
<VDataTableServer
  ...
  :search="props.search"   <!-- ✅ REQUIRED: without this, filter changes never reach useOptions -->
  @update:options="onUpdateOptions"
>
```

Without the `:search="props.search"` binding on `VDataTableServer`, Vuetify 4's `useOptions` composable **never detects search changes** and **never emits `@update:options`**. The debounce sets the filter ref, the parent passes it as a prop, but the table component doesn't forward it internally → the API call is never triggered.

**Checklist for a new index page with search:**
1. ✅ Debounced `filterInput` → `filterRole` (300ms)
2. ✅ Table component gets `:search="filterRole"` from the page
3. ✅ `VDataTableServer` inside the component gets `:search="props.search"`
4. ✅ `@update:options="onUpdateOptions"` emits `sorting` event
5. ✅ Parent `loadRoles(opts)` reads `filterRole.value` for the API filter param

**Auditing existing tables:** If the filter works on one table but not another, check the component's template for the missing `:search="props.search"` on `VDataTableServer`. This was the root cause of the Role table filter not working — both `Organization/Table.vue` and `User/Table.vue` had the binding, but `Role/Table.vue` was missing it.

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

function refresh() {
  if (lastOptions.value) {
    indexOrganizations(lastOptions.value)
  }
}
```

## Momentary Row Highlight After Edit (`row-props` + `highlight-id`)

Vuetify 4's `VDataTable` / `VDataTableServer` has **no `item-class` prop**. To
apply a class (or any attribute) to a specific row, use **`row-props`**: a
function `({ item, index, internalItem }) => attrs` whose returned object is
merged onto each `<tr>`. This powers the "flash the edited row" pattern used by
the **Role**, **User**, **Organization**, **Permission**, **Auditorium** and
**AuditoriumEvent** tables.

> **Why animate `td` and not `tr`:** Vuetify 4 paints `striped="odd"` via
> `background-image` on the `<tr>`, which would cover a `background-color`
> animation applied to the `<tr>`. Animating the row's `<td>` cells keeps the
> flash visible on every row.

### Table component (e.g. `Role/Table.vue`)

1. Add a `highlightId` prop.
2. Bind `:row-props="rowProps"` on `VDataTableServer`.
3. Return the `row-highlight` class only for the matching row:

```vue
<VDataTableServer ... :row-props="rowProps" />
```

```ts
const props = defineProps<{
  // ...
  highlightId?: number | null
}>()

function rowProps(data: { item: unknown }) {
  const id = (data.item as Record<string, unknown>)?.id
  return {
    class: props.highlightId != null && id === props.highlightId ? 'row-highlight' : undefined,
  }
}
```

No scoped CSS in the component — the animation lives **once** in
`app/assets/css/global.css` (already loaded via `css: ['@/assets/css/global.css']`):

```css
/* Momentary row flash after edit — driven by row-props + highlight-id in table components */
.row-highlight td {
  animation: row-highlight-flash 1.4s ease-out;
}

@keyframes row-highlight-flash {
  0% {
    background-color: rgba(var(--v-theme-success), 0.35);
  }
  100% {
    background-color: transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .row-highlight td {
    animation: none;
  }
}
```

### Parent page (e.g. `role/index.vue`)

Use the shared **`useRowHighlight`** composable
(`app/composables/useRowHighlight.ts`) — it owns the `highlightId` ref, the
**resettable** timer, the `null` → `nextTick` re-set (so the animation
re-triggers even when the **same** row is edited twice in a row), and the
`onUnmounted` timer cleanup:

```ts
import { useRowHighlight } from "~/composables/useRowHighlight"

const { highlightId, flash } = useRowHighlight()
```

Import it **explicitly** (per the Form Validation section — do not rely on Nuxt
auto-import for newly created composables). Then call `flash(id)` after a
successful create/update and pass `:highlight-id` to the table component:

```vue
<RoleTable ... :highlight-id="highlightId" />
```

```ts
// Update branch — after data[idx] = updated
const updatedId = updated.id
if (updatedId != null) {
  flash(updatedId as number)
}
```

### Rules

1. Vuetify 4 uses **`row-props`**, not `item-class` (does not exist).
2. Animate `td` cells, not the `tr` — the striped `background-image` on the
   `tr` would hide a `tr` `background-color` flash on odd rows.
3. Keep the CSS **global** (single definition in `app/assets/css/global.css`).
   Do **not** add scoped `:deep(.row-highlight td)` copies per component.
4. Use the shared `useRowHighlight` composable — do **not** copy the
   ref/timer/`nextTick` helper into pages. Import it explicitly.
5. `flash()` clears the id and re-sets it on `nextTick` — otherwise a fast
   re-edit of the same row silently no-ops (the class never leaves the DOM, so
   the animation never restarts).
6. The timer (1600ms) must be ≥ the CSS animation (1.4s); the animation
   settles on its own, JS just removes the class for hygiene.
7. The highlight is **id-driven** — if the row is not rendered (different
   page/filter after a re-sort), it is a harmless no-op.
8. Tables that re-fetch after save (e.g. `permission/index.vue`,
   `auditorium/index.vue`, `auditorium-event/index.vue`) must flash **after**
   the reload so the refreshed row receives the class.

## Initial Data Load (asyncData Replacement)

Replaces AUI's `async asyncData()` hook. Loads the initial page data **before the component renders** (component suspends during the await), then suppresses the mount-time `@update:options` to avoid a duplicate request.

### Problem

Vuetify 4's `VDataTableServer` fires `@update:options` **immediately on mount**. If you do a top-level await for initial data AND let `@update:options` fire, you get **2 API calls** on page load (one wasted).

### Solution

1. **Top-level await** — load initial data with backend-compatible params (`sortBy: ["name"]`, `sortDesc: [false]`)
2. **`lastOptions` in Vuetify 4 format** — store `[{ key: "name", order: "asc" }]` so `loadRoles()` conversion works on refresh
3. **`initialLoaded` flag** — suppress the first (mount-time) `@update:options` call
4. **`handleSorting` wrapper** — checks the flag, then delegates to the actual loader

### Reference implementation (`role/index.vue`)

```ts
const response = ref({ data: [], total: 0 })
const loading = ref(false)
const lastOptions = ref<Record<string, unknown> | null>(null)

// 1. Top-level await — backend-compatible format for the API call
//    Vuetify 4 format in lastOptions so loadRoles() conversion works.
{
  const apiParams: Record<string, unknown> = {
    page: 1,
    itemsPerPage: 10,
    sortBy: ["name"],        // ← backend format
    sortDesc: [false],
  }
  const initialResponse = await Role.index(apiParams).catch(() => ({ data: [], total: 0 }))
  response.value = initialResponse as { data: unknown[]; total: number }
  lastOptions.value = {
    page: 1,
    itemsPerPage: 10,
    sortBy: [{ key: "name", order: "asc" }],  // ← Vuetify 4 format
  }
}

// 2. Data loader — converts Vuetify 4 sortBy to backend format
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

async function refreshRoles() {
  if (lastOptions.value) {
    await loadRoles(lastOptions.value)
  }
}

// 3. Suppress mount-time duplicate with initialLoaded flag
let initialLoaded = false

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    // Suppress mount-time @update:options — data was already loaded by top-level await
    initialLoaded = true
    return
  }
  loadRoles(opts)
}
```

### Template wiring

```vue
<!-- Parent page passes :search and @sorting to handleSorting -->
<RoleTable
  :search="filterRole"
  :response="response"
  :loading="loading"
  @sorting="handleSorting"
/>
```

### CRITICAL: Repository must be declared BEFORE the await

```diff
 const lastOptions = ref<Record<string, unknown> | null>(null)
+const { Role } = useRepository()   // ← MUST be here, before the await!

 // Top-level await
 {
   const initialResponse = await Role.index(apiParams)...
```

`const` is in the **temporal dead zone** — accessing it before the declaration throws `ReferenceError`. Always declare `const { Repository } = useRepository()` **before** the top-level await block.

### Comparison: AUI asyncData vs Nuxt 4 pattern

| AUI Nuxt 2 (`asyncData`) | Nuxt 4 (`<script setup>`) |
|---|---|
| `async asyncData({ app, params }) { const res = await api.show(params.id); return { mRole: res } }` | `const res = await api.show(route.params.id); mRole.value = res` |
| Runs before page mount | Runs before component render (component suspends) |
| Data merged into component data | Manually assigned to refs |
| Single fetch, no duplicate | Top-level await + `initialLoaded` flag to prevent duplicate |
| Error: `error({ statusCode: ... })` | `.catch(() => fallbackData)` |

### Rules

1. Use **backend-compatible params** (`sortBy: ["name"]`, `sortDesc: [false]`) for the API call
2. Store **Vuetify 4 format** (`[{ key: "name", order: "asc" }]`) in `lastOptions` so refresh/sort work
3. Always declare the repository **before** the top-level await (avoid temporal dead zone)
4. The `refreshRoles()` / `refresh()` function calls `loadRoles(lastOptions.value)` / `indexOrganizations(lastOptions.value)` directly, bypassing the `initialLoaded` flag
5. This pattern only applies to **index pages** with `VDataTableServer` — detail pages without a table need only the top-level await (no flag)

## Dynamic NavBar Title (`eventBus.$emit("setNavBar")`) — avoid DRY with a helper

The AUI app used a global event bus to update the VAppBar title dynamically:

```js
mounted() {
  const eventBus = this.$eventBus || this.$nuxt
  eventBus.$emit("setNavBar", { title: `...`, icon: "...", back: `/...`, showDrawer: false })
},
```

In Nuxt 4, the layout reads `route.meta` properties (`title`, `icon`, `back`, `showDrawer`).
Set them directly after the async data loads.

### Helper function (avoid repeating 4 assignments)

Every detail page sets the same 4 `route.meta` properties. Instead of repeating:

```ts
route.meta.title = `...`
route.meta.icon = "..."
route.meta.back = "/..."
route.meta.showDrawer = false
```

Create a reusable helper:

```ts
function setNavBar({ title, icon, back, showDrawer = false }: {
  title?: string
  icon?: string
  back?: string
  showDrawer?: boolean
}) {
  const route = useRoute()
  if (title !== undefined) route.meta.title = title
  if (icon !== undefined) route.meta.icon = icon
  if (back !== undefined) route.meta.back = back
  if (showDrawer !== undefined) route.meta.showDrawer = showDrawer
}
```

Then each detail page calls a single line:

```ts
// Simple detail page
if (mRole.value.name) {
  setNavBar({
    title: `Rol ${mRole.value.name}`,
    icon: "mdi-redhat",
    back: "/role",
  })
}

// Nested sub-pages (parallel fetches)
onMounted(async () => {
  const [userRes, profileRes] = await Promise.all([
    User.show(userId).catch(() => null),
    Profile.show(profileId).catch(() => null),
  ])
  // ... assign to refs ...

  if (mUser.value.name) {
    setNavBar({
      title: `Perfil de: ${mUser.value.name} ${mUser.value.last_name ?? ''}`.trim(),
      icon: "mdi-account",
      back: `/user/${userId}/profile`,
    })
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
+if (mUser.value.name) {
+  setNavBar({
+    title: `Perfil de: ${mUser.value.name} ${mUser.value.last_name ?? ''}`.trim(),
+    icon: "mdi-account",
+    back: "/user",
+  })
+}
```

### Rules

- `route.meta` is reactive — changes reflect immediately in the layout's `computed` properties.
- The static `definePageMeta({ title })` is replaced dynamically after the API call — keep the fallback static title.
- Guard with `if (entity.value.name)` to avoid `"undefined undefined"` if the API fails.
- Use `.trim()` to avoid trailing whitespace when last_name is absent.
- `showDrawer` defaults to `false` in the helper — only pass it when you need `true` (main pages with the navigation drawer).

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

## Prevent Double-Submit on Dialog Save Buttons

**Problem:** Vuetify 3/4's `VBtn loading` prop does **NOT** disable clicks. In `VBtn.js`, `isDisabled` only includes `props.disabled` — `loading` only sets `tabindex="-1"` and `aria-busy`. So `:loading` alone never blocks a double-click on "Guardar"; two rapid clicks fire the save handler twice (two API calls).

**Strategy:** A local `saving` ref in the dialog guards re-entry, backed by the parent's `saving` ref passed down as `:loading`. The parent sets its `saving` around the API call so the guard resets and the button visually locks during the request.

### Dialog side

```diff
 const props = defineProps<{
   // ...
+  loading?: boolean        // ← parent's `saving` ref
 }>()

 const formRef = ref()
 const dialogVisible = ref(true)
+const saving = ref(false)

+// Reset the local guard when the parent finishes the API call (success or error)
+watch(() => props.loading, (val) => {
+  if (!val) saving.value = false
+}, { immediate: true })

 async function save() {
+  if (saving.value || props.loading) return
   const { valid } = await formRef.value?.validate() ?? { valid: false }
   if (!valid) return
+  // Re-check AFTER the async gap — two overlapping clicks both pass the first
+  // guard while validate() is pending, so only the first one may proceed.
+  if (saving.value || props.loading) return
+  saving.value = true
   emit("save", { ...item.value })
 }
```

```diff
-<VBtn color="primary" variant="elevated" :loading="loading" ...>Guardar</VBtn>
+<VBtn color="primary" variant="elevated"
+  :loading="saving || loading"
+  :disabled="saving || loading" ...>Guardar</VBtn>
```

Always pair `:loading` with `:disabled` — the button must be truly unclickable while saving. Apply the same `:disabled="saving || loading"` to the Cancel button and any disabled inputs.

### Parent side

```diff
 const loading = ref(false)   // table / refresh loading (separate concern)
+const saving = ref(false)    // dialog save in-flight

 async function saveX(item: Record<string, unknown>) {
+  saving.value = true
   try {
     // ... create / update API call ...
     dialog.value = false
   } catch (e) {
     console.error(e)
   } finally {
+    saving.value = false
   }
 }
```

```diff
-<XDiaolog v-if="dialog" ... @save="saveX" />
+<XDiaolog v-if="dialog" :loading="saving" ... @save="saveX" />
```

### Rules

1. `loading` alone never disables clicks — always add `:disabled`.
2. The guard must be re-checked **after** `await validate()`; both clicks pass the first check before the emit fires, so the second check is what blocks the duplicate.
3. Reset `saving` via `watch(() => props.loading)` so a **failed** save re-enables the button for retry (the parent closes the dialog on success, so remount handles that case).
4. Keep the parent's table `loading` separate from the dialog `saving` (see `permission/index.vue` / `role/index.vue` for the reference implementation).

## Never Disable the Save/Guardar Button

**Rule:** The dialog's Save/Guardar button must **never** be `:disabled` based on form state. Remove AUI's `:disabled="!isFormValid"` (or any `isFormValid`-style computed gating the button). The button stays clickable; validation feedback is shown via the field `:rules` when the user clicks Save.

```diff
-<VBtn color="primary" :loading="saving" :disabled="!isFormValid">Guardar</VBtn>
+<VBtn color="primary" :loading="saving">Save</VBtn>
```

Replace the silent `if (!isFormValid) return` guard in the handler with an explicit `VForm.validate()` so the user *sees* which fields are wrong:

```diff
-function saveEvent() {
-  if (!isFormValid.value) return
+async function saveEvent() {
+  const form = eventForm.value
+  if (form) {
+    const { valid } = await form.validate()
+    if (!valid) return
+  }
```

Rules:
1. Never gate the Save button with `:disabled="!isFormValid"` / `:disabled="!formIsValid"`.
2. Use `formRef.value.validate()` in the save handler — validation errors render inline on the fields.
3. Drop the now-unused `isFormValid` computed (dead code).
4. Only `:disabled="saving"` (in-flight guard) is allowed, per the double-submit section above.

## VCombobox / VAutocomplete `#selection` Slot (Vuetify 3/4 Proxy Quirks)

Vuetify 3/4's slot proxy system can break simple `typeof` checks and interpolation inside `#selection` slots. The same slot proxy also affects `selected` and `item.raw` access.

### Chip rendering — remove `v-if` and `:model-value`

```diff
-<template #selection="{ item, selected }">
-  <VChip
-    v-if="typeof item.raw === 'object'"
-    color="primary"
-    :model-value="selected"
-  >
-    <span class="pr-2">{{ item.raw.name }}</span>
-  </VChip>
-</template>
+<template #selection="{ item }">
+  <VChip color="primary" closable @click:close="removeRole(item.raw as RoleItem)">
+    {{ item.raw.name }}
+  </VChip>
+</template>
```

Key changes:
- **Remove `v-if="typeof item.raw === 'object'"`**: Returns `false` for slot proxy objects even though `item.raw` IS an object. The proxy intercept breaks `typeof`.
- **Remove `:model-value="selected"`**: `selected` is `undefined` when VCombobox can't match model values to items (see items requirement below).
- **Remove `variant="flat"`**: Causes invisible text in some Vuetify 4 themes. Let the chip use its default variant.
- **Remove `<span>` wrapper**: Not needed, use `{{ item.raw.name }}` directly.
- **Use `item.raw.name`** instead of `item.raw?.name` or `item.title` — the raw object always has the property.

### Items must contain selected values

Vuetify 3/4's VCombobox needs the selected model values to also exist in the `:items` array for chip rendering to work. Unlike Vuetify 2 (which renders chips from model alone), Vuetify 3/4 tries to match model values against items to determine selection state.

```diff
 watch(
   () => props.roles,
   (val) => {
     model.value = val && val.length > 0 ? [...val] : []
+    if (val && val.length > 0) {
+      items.value = [...val]
+    }
   },
   { immediate: true },
 )
```

### Search must merge selected items back

When the user types to search, the API results exclude already-selected items (via the `ids` parameter). Without merging them back, chips disappear because the selected items are no longer in `:items`.

```diff
 async function loadRoles(queryText: string) {
   const result = await Role.filter({ queryText, ids: rolesId.value })
   items.value = (Array.isArray(result) ? result : []) as RoleItem[]
+  const selected = model.value
+  if (selected.length > 0) {
+    const existingIds = new Set(items.value.map((r) => r.id))
+    for (const role of selected) {
+      if (!existingIds.has(role.id)) {
+        items.value.push(role)
+      }
+    }
+  }
 }
```

Without this merge, searching the combobox overwrites `items` with API results that exclude selected roles, and VCombobox loses the match → chips disappear.

### Summary

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Chips not rendering | `v-if="typeof item.raw === 'object'"` returns false for slot proxies | Remove the `v-if` |
| Chips render without text | `variant="flat"` hides text in some themes | Use default variant (omit `variant`) |
| `selected` always `undefined` | VCombobox can't match model values to empty `items` | Populate `items` from props |
| Chips disappear after search | API result overwrites `items`, removing selected items | Merge selected items back into search results |
