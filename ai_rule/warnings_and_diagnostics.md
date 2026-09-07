# Warnings & Diagnostics Prevention

## 1. h3 `createError` — use `message`, never `statusMessage`

```ts
// ❌ WRONG
throw createError({ statusCode: 403, statusMessage: "No tienes permiso" })

// ✅ CORRECT
throw createError({ statusCode: 403, message: "No tienes permiso" })
```

`app/error.vue` reads `err.message` — never `statusMessage`. Run `grep -rn statusMessage app/` and expect zero hits.

---

## 2. `[NUXT_E1005]` App Initialization Error

This diagnostic appears when any error is emitted during client boot. Common causes:
- Plugin throwing during init
- Auth middleware skipped on server (see `auth_and_permissions.md`)
- Permission middleware throwing instead of redirecting

**Fix:** Never skip `authenticated` middleware on server. Permission denials must `navigateTo("/forbidden?...")`, never `throw createError(...)`.

---

## 3. `[VUE_ROUTER_R0121]` history.state manually replaced

When using `history.replaceState`, always preserve the existing router state:

```ts
// ❌ WRONG
window.history.replaceState(null, "", path)

// ✅ CORRECT
window.history.replaceState({ ...window.history.state }, "", path)
```

---

## 4. `[Vuetify UPGRADE] 'dense' is deprecated`

Replace bare `dense` with explicit density:

```vue
<!-- ❌ WRONG -->
<VRow dense>

<!-- ✅ CORRECT -->
<VRow density="comfortable">
```

- `VRow` → `density="comfortable"`
- Form controls → `density="compact"`

---

## 5. `[VUE_ROUTER_R0025]` next() callback deprecated

Never pass or call `next` in navigation guards. Return a value instead:

```ts
// ❌ WRONG
onBeforeRouteLeave((_to, _from, next) => {
  if (isDirty.value) {
    showConfirmDialog.value = true
    resolveNext = next
  } else {
    next()
  }
})

// ✅ CORRECT
onBeforeRouteLeave((to, _from) => {
  if (isDirty.value) {
    showConfirmDialog.value = true
    pendingRoute = { to }
    return false
  }
})
```

For deferred navigation, store the target route and use `router.push()` after user decides.

---

## 6. VDataTableServer Duplicate Fetch on Mount

The table fires `@update:options` on mount. If the page also calls fetch in top-level `await`, data is fetched twice.

**Fix:** Use `initialLoaded` flag or request counter (see `ssr_and_data_loading.md`).

---

## 7. `ReferenceError: <prop> is not defined` in `<script setup>`

In `<script setup>`, props are accessible only through the `props` object:

```ts
const props = defineProps<{ loading?: boolean }>()

async function save() {
  if (props.loading) return  // ✅ correct
  // if (loading) return     // ❌ ReferenceError
}
```

Never destructure props that need to stay reactive.

---

## 8. `VUE_ROUTER_R0025` — next() in navigation guards

See section 5 above.

---

## Pre-Merge Checklist

1. `grep -rn "statusMessage" app/` → **0 hits**
2. `grep -rn "import.meta.server" app/middleware/` → only `guest.ts`
3. `grep -rn "createError" app/middleware/` → **0 hits** (use redirect)
4. `grep -rn "history.replaceState(null" app/` → **0 hits**
5. No unguarded top-level `await` — every call has `.catch` or `try/catch`
6. `grep -rn "next()" app/pages/` → **0 hits** in navigation guards
7. Pages with `VDataTableServer` must not manually call the same fetch that `@update:options` triggers
8. Never run `migrate:fresh` — always `php artisan migrate`
9. In `<script setup>` functions, always access props via `props.xxx`
