# Auth & Permissions Rules

## Single-Org Scope

When a permission grants the authenticated user access to exactly one org, the UI must not ask for / show the org (selector, filter, column, label) and the API must not receive `org_id` — the backend resolves the org from the auth token context.

### Shared Helpers

All single-org logic goes through the auth store helpers in `app/composables/useAuth.ts`:

```ts
const auth = useAuthStore()
auth.orgIdsFor("auditorium-index")       // (number|string)[] — org ids granted for the permission
auth.hasSingleOrgFor("auditorium-index") // boolean — true when exactly one org is accessible
```

Wrap in `computed` when used in a component:

```ts
const singleOrg = computed(() => auth.hasSingleOrgFor("auditorium-index"))
```

### Where It Applies

| Situation | How |
|-----------|-----|
| Hide org **column** in table | `v-if` on the header/column |
| Hide org **selector/filter** | `v-if="!singleOrg"` |
| Hide org **label** on detail page | `v-if="!singleOrg"` on the org `VCol` |
| Skip `org_id` in API params | `watch(filterOrgId, (val) => { if (singleOrg.value) return; ... })` |

### Rules

1. Always use the store helpers (`orgIdsFor`, `hasSingleOrgFor`) — never re-derive inline
2. Pass the **permission that grants the data access** (e.g. `conso-sheet-index`, `auditorium-index`)
3. Wrap calls in `computed` so they stay reactive
4. When only one org is accessible, do not send `org_id`
5. Hide the org UI for *display* and *input* alike

---

## Auth Middleware Rules

### `authenticated` must run during SSR

Never skip auth middleware on the server:

```ts
// ❌ WRONG — skips check during SSR
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const auth = useAuthStore()
  if (!auth.loggedIn) {
    return navigateTo("/login?redirect=" + encodeURIComponent(to.fullPath))
  }
})

// ✅ CORRECT — runs on both server and client
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (!auth.loggedIn) {
    return navigateTo("/login?redirect=" + encodeURIComponent(to.fullPath))
  }
})
```

### Permission middleware must redirect, never throw

```ts
// ❌ WRONG — throws, triggers E1005
throw createError({ statusCode: 403, message: "No tienes permiso" })

// ✅ CORRECT — redirects to in-app 403 page
return navigateTo(`/forbidden?permission=${encodeURIComponent(required)}`)
```

### Page middleware ordering

Protected pages must list `middleware: ["authenticated", "permission"]` (authenticated first).

### Login/logout must NOT require `authenticated`

- `login.vue` uses `middleware: ["guest"]` (redirects already-logged-in users)
- `logout.vue` carries **no** middleware (must work even with expired token)

---

## `createError` — use `message`, never `statusMessage`

```ts
// ❌ WRONG
throw createError({ statusCode: 403, statusMessage: "No tienes permiso" })

// ✅ CORRECT
throw createError({ statusCode: 403, message: "No tienes permiso" })
```

`app/error.vue` reads `err.message` — never `statusMessage`.
