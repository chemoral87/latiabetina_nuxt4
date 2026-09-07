# Navigation Rules

## No `:href` for In-App Navigation

**Never** use `:href` on `VBtn`, `VListItem`, `<a>`, or similar components for in-app navigation. Always use `@click` with `navigateTo()` (or `<NuxtLink>`) for SPA navigation.

### Why

When a `VBtn` receives an `href` prop, Vuetify renders a native `<a>` tag. Clicking it triggers a **hard browser navigation** — the entire SPA is torn down and reloaded. This bypasses Vue Router entirely, causing:
- Re-fetch of `useAsyncData` data
- Progress bar middleware skipped
- `onBeforeRouteLeave` guards bypassed
- Flash of empty content

### Bad

```html
<VBtn :href="`/church-member/${item.id}`">Ver</VBtn>
<VListItem :href="`/consolidation/${id}/details`">Detalles</VListItem>
<a :href="`/role/${item.id}/children`">Permisos</a>
```

### Good

```html
<VBtn @click="navigateTo(`/church-member/${item.id}`)">Ver</VBtn>
<VListItem @click="navigateTo(`/consolidation/${id}/details`)">Detalles</VListItem>
<NuxtLink :to="`/role/${item.id}/children`">Permisos</NuxtLink>
```
