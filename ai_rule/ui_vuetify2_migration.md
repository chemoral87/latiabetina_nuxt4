# Vuetify 2 → Vuetify 3 Migration Guide

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
-<v-text-field outlined dense label="Email" :append-icon="showed ? 'mdi-eye' : 'mdi-eye-off'" @click:append="showed = !showed" />
+<VTextField id="login-email" variant="outlined" density="compact" label="Email" :append-inner-icon="showed ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="showed = !showed" />
```

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

Vuetify 2's `v-btn--fab` button with colored background and white icon:

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

## Vuetify 2–Only Utility Classes

These Vuetify 2 utility classes were removed in Vuetify 3:

| Class | Vuetify 3 Replacement |
|-------|----------------------|
| `fill-height` | `style="min-height: 100vh"` or `align="stretch"` on VRow |
| `text-none` (text-transform) | Remove — Vuetify 3 buttons have no text-transform by default, or use inline `style` |
| `text-decoration-none` | `style="text-decoration: none"` (not a Vuetify utility) |

```diff
-<VRow align="center" justify="center" class="fill-height">
+<VRow align="center" justify="center" style="min-height: 100vh">
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

```css
:deep(.v-text-field--outlined) input:-webkit-autofill ~ .v-label,
:deep(.v-text-field--outlined) input:-webkit-autofill:focus ~ .v-label {
  transform: translateY(-24px) scale(0.75);
  top: 0px;
  background: white;
  padding: 0 4px;
}
```
