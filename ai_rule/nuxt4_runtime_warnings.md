# Nuxt 4 Runtime Warnings & Diagnostics Prevention

> **Goal:** avoid the recurring browser-console warnings/diagnostics that this app
> has shipped before: the h3 `statusMessage` deprecation, the `NUXT_E1005`
> "app initialization" diagnostic, `VUE_ROUTER_R0121`, and `VUE_ROUTER_R0025`.
> Each section below gives the symptom, the root cause, and the rule that
> prevents a regression.

---

## 1. h3 `createError` — use `message`, never `statusMessage`

### Symptom (bad)

Browser/terminal warning pointing at `createError`:

```
[h3] Please prefer using `message` for longer error messages instead of `statusMessage`.
     In the future, `statusMessage` will be sanitized by default.
  at createError (/node_modules/h3/dist/index.mjs)
  at createError (.../nuxt/dist/app/composables/error.js)
  at .../app/middleware/permission.ts
```

### Root Cause

`createError({ statusCode, statusMessage })` was passed a long human-readable
string in `statusMessage`. h3 warns because `statusMessage` is meant for short
HTTP status phrases and will be sanitized by default in the future.

### Rule

1. Always pass user-facing error text as **`message`**, not `statusMessage`:

   ```ts
   throw createError({
     statusCode: 403,
     message: "No tienes permiso para acceder a esta página.",
     data: { permission: required },
   })
   ```

2. `app/error.vue` already reads `err.message` (`extractErrorMessage()`), so the
   text renders correctly. It never reads `statusMessage` — do not start using it.
3. **No `statusMessage` anywhere** in `app/` — run `grep -rn statusMessage app/`
   and expect zero hits.

### Apply To

- Any `createError(...)` call: route middleware (`app/middleware/permission.ts`),
  page top-level awaits (`app/pages/church-event/[id]/index.vue`), plugins.

---

## 2. `[NUXT_E1005] Error caught during app initialization.`

### Symptom (bad)

Browser console (dev) logs from the `nostics` diagnostic reporter:

```
nostics.js?v=...:38 [NUXT_E1005] Error caught during app initialization.
╰▶ fix: Check your plugins, `app:created`, and `app:beforeMount` hooks for unhandled errors.
```

The console reporter does **not** print the underlying error — the real exception
only appears in the dev overlay's error panel.

### What it actually is

`NUXT_E1005` is a **dev-only diagnostic** that Nuxt logs whenever **any** error
is emitted through the `app:error` hook while the client is booting (before
`app:mounted`). Triggers:

1. A plugin throwing during init
2. `app:created` / `app:beforeMount` hook errors
3. **Any Vue component error during the initial mount render** (Vue's
   `errorHandler` forwards them)
4. Middleware errors thrown during the first navigation

It is *not* itself the bug — it is the diagnostic that accompanies the error.
In production builds it is not shown the same way.

### Root Cause seen in this app (regression to avoid)

`app/middleware/authenticated.ts` had:

```ts
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return   // ❌ skips the check during SSR
  const auth = useAuthStore()
  if (!auth.loggedIn) {
    return navigateTo("/login?redirect=" + encodeURIComponent(to.fullPath))
  }
})
```

Because the auth check was skipped on the server, an **anonymous** SSR request to
a protected page fell through to `app/middleware/permission.ts` (which *does* run
on the server) and threw a 403 → SSR error page → client `app:error` → E1005.

### Rule

1. **Never skip auth middleware on the server.** `authenticated` must run during
   SSR so anonymous users get a clean redirect, not a 403 error page:

   ```ts
   export default defineNuxtRouteMiddleware((to) => {
     const auth = useAuthStore()
     if (!auth.loggedIn) {
       return navigateTo("/login?redirect=" + encodeURIComponent(to.fullPath))
     }
   })
   ```

   Verified: anonymous `/role`, `/user`, `/auditorium`, `/account` now return
   `302 → /login?redirect=…` with no error page and no E1005.

2. **Do not add `if (import.meta.server) return` guards to middleware** that
   protects routes. `guest.ts` is the only middleware allowed to be
   client-only-agnostic (it redirects already-logged-in users away from
   `/login`); even so, prefer letting it run on the server.

3. **Permission middleware ordering:** protected pages must list
   `middleware: ["authenticated", "permission"]` (authenticated first). A page
   with `permission` meta but no `authenticated` will 403 anonymous users.

4. **Permission denials must redirect, never throw.** A thrown `createError`
   from middleware emits `app:error` on the initial navigation → E1005 + the
   generic error layout. `app/middleware/permission.ts` instead redirects to the
   in-app 403 page, which is a **normal route** (no `app:error`, no E1005):

   ```ts
   // app/middleware/permission.ts
   if (!auth.hasPermission(required)) {
     return navigateTo(`/forbidden?permission=${encodeURIComponent(required)}`)
   }
   ```

   `app/pages/forbidden.vue` (middleware: `authenticated`) shows the required
   permission from `route.query.permission` plus back/dashboard actions. Do not
   revert to `throw createError({ statusCode: 403, ... })` in middleware — that
   brings back the E1005 diagnostic and the generic error page.

5. **When you still see E1005** (from sources other than the permission
   middleware, e.g. a 404 `createError` in a page's top-level await, a plugin
   error, or a render error): it accompanies *handled* error pages too — that is
   expected dev-overlay behavior. Look at the **actual exception** in the overlay
   error panel, not the E1005 line, to find a real bug. If a page renders fine
   and only the E1005 line appears, it is dev-only noise.

### Plugin / init checklist

- Plugins that construct third-party objects (`new Echo(...)`, `vueApp.use(...)`)
  must be `.client.ts` when they touch `window`, and should early-return when
  their required config is missing (e.g. `if (!reverbKey) return`).
- Page top-level awaits must be guarded with `.catch(() => fallback)` so a failed
  API call never throws during the initial render.

---

## 3. `[VUE_ROUTER_R0121] history.state was manually replaced`

### Symptom (bad)

```
[VUE_ROUTER_R0121] history.state seems to have been manually replaced without preserving the necessary values.
├▶ fix: Merge the router's state into your own when calling it manually:
│      `history.replaceState({ ...history.state, ...yourState }, '', url)`.
```

### Root Cause

Manual `history.replaceState(null, "", path)` (seen in the Google OAuth callback
when scrubbing the `?token=...` query string) **replaced** vue-router's internal
history state keys (`back`, `forward`, `position`, `replaced`, `scroll`), breaking
scroll restoration and triggering the warning.

### Rule

Always preserve the existing router state when using `history.replaceState`:

```ts
if (window.history.replaceState) {
  // Preserve the router's own history state keys (back/forward/position),
  // otherwise vue-router logs VUE_ROUTER_R0121 and scroll restoration breaks.
  window.history.replaceState({ ...window.history.state }, "", window.location.pathname)
}
```

- Never pass `null` / `{}` as the state argument in a Nuxt 4 app.
- Prefer the router API (`router.replace(...)`) when the URL change is a route
  change; use `history.replaceState({ ...window.history.state }, ...)` only for
  same-route query scrubbing (security cleanup of URL-embedded tokens).

---

## 4. `[Vuetify UPGRADE] 'dense' is deprecated` — use `density="comfortable"`

### Symptom (bad)

Browser console (dev), typically on a page with a `VRow`:

```
[Vue warn]: [Vuetify UPGRADE] 'dense' is deprecated, use 'density="comfortable"' instead. at <VRow>
  at <VContainer>
  at <Calendar>
  ...
```

### Root Cause

The Vue 2 era `dense` prop is gone in Vuetify 3/4 — components now take a
`density` prop (`comfortable`, `compact`, `default`). Any bare `dense` on a
Vuetify component (e.g. `<VRow dense>`) triggers this warning at render.

### Rule

1. **Never use bare `dense` on Vuetify components** (`VRow`, `VCol`, `VContainer`,
   `VTextField`, `VSelect`, ...). Replace with the explicit density:

   ```vue
   <VRow density="comfortable">   <!-- was: <VRow dense> -->
   ```

   - The warning itself recommends `density="comfortable"`; use that for rows
     that previously used `dense`. For form controls that need the tighter
     look, use `density="compact"` (see `ui_vuetify2_migration.md`).
   - `index.vue` pages use `<VRow density="comfortable">` — keep list pages
     consistent with that.
2. **Custom wrappers are the exception**: `My/DatePicker.vue`, `My/TimePicker.vue`
   and `My/DateRange.vue` accept a `dense` **prop** and map it internally to
   `density="compact"` — passing `dense` to them does **not** warn. Only fix
   `dense` passed directly to Vuetify components.
3. **Check new/changed pages** for bare `dense` on Vuetify components before
   merging — `grep -rn "<VRow dense" app/` should return 0 hits.

---

## 5. `[VUE_ROUTER_R0025] next() callback in navigation guards is deprecated`

### Symptom (bad)

Browser console warning when leaving a page with a dirty form:

```
[VUE_ROUTER_R0025] The `next()` callback in navigation guards is deprecated.
├▶ fix: Return the value instead: `next()` becomes `return`, `next(false)` becomes `return false`, `next("/path")` becomes `return "/path"`.
```

### Root Cause

Vue Router 4 deprecated the `next()` callback in navigation guards. The old
pattern stored `next` in a variable to call later (for dirty-form confirmation
dialogs), which triggers this warning.

### Rule

1. **Never pass or call `next` in `onBeforeRouteLeave`** (or any navigation
   guard). Return a value instead:

   ```ts
   // ❌ BAD — triggers VUE_ROUTER_R0025
   onBeforeRouteLeave((_to, _from, next) => {
     if (isDirty.value) {
       showConfirmDialog.value = true
       resolveNext = next  // deprecated callback
     } else {
       next()
     }
   })

   // ✅ GOOD — returns value, no warning
   onBeforeRouteLeave((to, _from) => {
     if (isDirty.value) {
       showConfirmDialog.value = true
       pendingRoute = { to }
       return false  // cancels navigation
     }
     // implicit return = allow navigation
   })
   ```

2. **For deferred navigation** (dirty-form confirm dialogs): store the target
   route, return `false` to cancel, then use `router.push()` after the user
   decides:

   ```ts
   let pendingRoute: { to: unknown } | null = null

   onBeforeRouteLeave((to, _from) => {
     if (isDirty.value) {
       showConfirmDialog.value = true
       pendingRoute = { to }
       return false
     }
   })

   function confirmDiscard() {
     showConfirmDialog.value = false
     if (pendingRoute) {
       router.push(pendingRoute.to as any)
       pendingRoute = null
     }
   }

   function confirmAbort() {
     showConfirmDialog.value = false
     pendingRoute = null  // stay on page
   }
   ```

3. **Import `useRouter`** when using this pattern:
   ```ts
   import { onBeforeRouteLeave, useRouter } from "vue-router"
   const router = useRouter()
   ```

4. **Checklist addition:** `grep -rn "next()" app/pages/` should return 0 hits
   in navigation guards. Any `beforeRouteLeave` / `onBeforeRouteLeave` using
   `next` must be converted to the return-value pattern.

---

## Checklist (run before merging changes)

1. `grep -rn "statusMessage" app/` → **0 hits**.
2. `grep -rn "import.meta.server" app/middleware/` → only `guest.ts` (and only if
   intentional); `authenticated.ts` must NOT skip SSR.
3. `grep -rn "createError" app/middleware/` → **0 hits**; permission denials
   redirect to `/forbidden` (see `app/middleware/permission.ts`).
3. `grep -rn "history.replaceState(null" app/` → **0 hits**.
4. No unguarded top-level `await` in pages/plugins (every call has `.catch` or a
   `try/catch`).
5. Any new plugin touches `window` or constructs network clients → add
   `.client` suffix + config guard.
6. No `next()` callback in `onBeforeRouteLeave` or `beforeRouteLeave` guards —
   use return values instead (`grep -rn "next()" app/pages/` → 0 hits in
   navigation guards).

## References

- `app/middleware/authenticated.ts` — SSR-safe auth redirect (the fixed version).
- `app/middleware/permission.ts` — permission denial → `navigateTo("/forbidden?permission=…")` (no throw).
- `app/pages/forbidden.vue` — in-app 403 page (normal route, no error page).
- `app/pages/auth/google/callback.vue` — token URL scrub with preserved history
  state + `no-referrer`.
- `app/error.vue` — renders `err.message` (never `statusMessage`).
