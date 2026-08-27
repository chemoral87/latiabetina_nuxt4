# No `:href` for In-App Navigation

> **Goal:** prevent hard browser page reloads inside the SPA by banning `:href` on
> components used for in-app navigation.

## Symptom (bad)

Clicking a button/link with `:href="/some/route"` triggers a full page reload:
- Data loaded via `useAsyncData` during SSR is re-fetched from scratch.
- The progress bar middleware (`progress.global.ts`) does not fire.
- `onBeforeRouteLeave` guards (dirty-check, etc.) are bypassed.
- User sees a flash of empty content before data loads.

## Root Cause

When a `VBtn` (or `<a>` tag) receives an `href` prop, Vuetify renders a native
`<a>` tag. Clicking it triggers a **hard browser navigation** — the entire SPA is
torn down and reloaded from the server. This bypasses Vue Router entirely.

## Rule

**Never** use `:href` on `VBtn`, `VListItem`, `<a>`, or similar components for
in-app navigation. Always use `@click` with `navigateTo()` (or `<NuxtLink>`) for
SPA navigation.

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

## Apply To

- All `VBtn`, `VListItem`, `VCard`, and similar Vuetify components that accept an
  `href` prop and are used for client-side navigation.
- Components inside `app/components/` and `app/pages/` that link to other app routes.

## Reference

- `app/components/Consolidation/MemberTable.vue` — had `:href` on `VBtn`, fixed to
  `@click="navigateTo(...)"`.
- `app/pages/tracking/index.vue` — correct pattern using `navigateTo()`.

## Do Not

- Use `:href` for any route that belongs to the SPA.
- Use `<a href="/...">` for internal navigation — always prefer `<NuxtLink>` or
  `navigateTo()`.
