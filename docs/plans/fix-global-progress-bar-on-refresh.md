# Bug: Global top progress bar shows on manual "Refrescar" click

## Symptom
On `auditorium-event/index.vue`, clicking the **Refrescar** button correctly shows
the local `VDataTableServer` `loading` spinner, but it *also* triggers the fixed
top-of-page `VProgressLinear` (`.global-progress` in `layouts/default.vue`).
That bar is supposed to appear **only** during a real route navigation (the
page's initial fetch), not for in-page actions like refresh/filter/sort/save.

## How the global progress bar is supposed to work
- `app/composables/useGlobalProgress.ts` exposes a module-level `navigating`
  flag plus an `activeRequests` counter.
- `start()` (called from every `$api` request in `useApi.ts`) only increments
  `activeRequests` **if `navigating === true`**. `finish()` decrements it.
- `isLoading = activeRequests.value > 0` drives the `VProgressLinear` in
  `layouts/default.vue`.
- The intent: `navigating` should be `true` only for the brief window of an
  actual route change, so only requests fired as part of that navigation
  (e.g. a page's top-level `await AuditoriumEvent.index(...)`) light up the
  bar. Manual button clicks happen outside that window, so they should not.

## Root cause
The `navigating` flag is set **on** correctly but never reliably set **off**:

- `app/middleware/progress.global.ts` is a global route middleware, so it
  calls `beginNavigation()` (-> `navigating = true`) on **every** client-side
  route navigation - first load and every subsequent one.
- `endNavigation()` (-> `navigating = false`) is called in exactly one place:
  `app/layouts/default.vue`, inside `onMounted()`.
- `layouts/default.vue` wraps `<NuxtPage>` and is mounted **once**, when the
  app first mounts. Its `onMounted` hook does **not** re-run on subsequent
  client-side route changes (only the page component inside `<NuxtPage>`
  remounts).

Sequence that produces the bug:
1. App loads -> `progress.global.ts` sets `navigating = true` for the first
   navigation -> layout mounts -> `onMounted` sets `navigating = false`.
   Works correctly for the very first page.
2. User navigates to a second route (e.g. via the nav drawer) ->
   `progress.global.ts` sets `navigating = true` again.
3. Nothing ever sets it back to `false` after that, because the layout's
   `onMounted` has already fired once and will not fire again.
4. From this point on, `navigating` is permanently `true` for the rest of the
   session. Every subsequent `$api` call - including manual actions like
   **Refrescar**, filtering, sorting, saving - passes the `if (navigating)`
   check in `start()` and lights up the global top bar, even though it's not
   a real navigation.

## Evidence (files involved)
- `app/composables/useGlobalProgress.ts` - the state machine described above.
- `app/composables/useApi.ts` - `$api()` calls `start()`/`finish()` around
  every request.
- `app/middleware/progress.global.ts` - calls `beginNavigation()` on every
  route change (correct, no change needed).
- `app/layouts/default.vue` - calls `endNavigation()` exactly once in
  `onMounted()` (this is the bug) and renders the `VProgressLinear` bound to
  `isLoading`.
- `app/pages/auditorium-event/index.vue` - `Refrescar` button calls
  `getAuditoriumEvents()`, which calls `AuditoriumEvent.index()` -> `$api()`.

## Fix plan

### Option A - minimal patch (recommended first step)
Replace the one-time `onMounted` call with a hook that fires after **every**
route navigation finishes, using Nuxt's built-in `page:finish` app hook
(fired by `<NuxtPage>` once the incoming page component has resolved,
for both the initial load and subsequent navigations).

1. Add a new client plugin `app/plugins/global-progress.client.ts`:
   ```ts
   export default defineNuxtPlugin((nuxtApp) => {
     const { endNavigation } = useGlobalProgress()
     nuxtApp.hook('page:finish', () => {
       endNavigation()
     })
   })
   ```
2. Remove the `onMounted(() => { endNavigation() })` block from
   `app/layouts/default.vue` (keep the `VProgressLinear` / `isLoading` usage
   as-is).

This keeps `beginNavigation()` in the existing global middleware and only
fixes the missing "end" side, pairing it with a hook that fires on every
navigation instead of only once.

### Option B - cleaner long-term fix
Pair begin/end explicitly using `page:start` / `page:finish` in a single
plugin, and delete `middleware/progress.global.ts` entirely:

```ts
// app/plugins/global-progress.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  const { beginNavigation, endNavigation } = useGlobalProgress()
  nuxtApp.hook('page:start', () => beginNavigation())
  nuxtApp.hook('page:finish', () => endNavigation())
})
```
Then remove `app/middleware/progress.global.ts` and the `onMounted` block in
`default.vue`. This removes the split between a global middleware and a
layout lifecycle hook, so begin/end always live together and can't drift
out of sync again.

Trade-off: `page:start` fires slightly later in the navigation lifecycle than
the current global middleware (which runs before route resolution begins).
Needs a quick check that the top-level `await AuditoriumEvent.index(...)` in
`pages/auditorium-event/index.vue` (and similar pages) still fires after
`navigating` is set to `true`, so the bar still shows during initial page
load. If not, keep the middleware for `beginNavigation()` (as in Option A)
and only replace the `endNavigation()` side.

### Recommendation
Ship **Option A** - smallest change, keeps the existing (working)
begin-navigation path via the global middleware, and only fixes the broken
end-navigation path. Option B can be a follow-up cleanup once Option A is
verified in production.

## Testing checklist
- [ ] Full page load (hard refresh) on any page -> top bar shows briefly, then
      hides once the page's initial data loads.
- [ ] Client-side navigation via the nav drawer to a second, then third page
      -> top bar shows on each navigation, then hides.
- [ ] On `auditorium-event`, click **Refrescar** -> only the table's own
      `VDataTableServer` loading state shows; top bar stays hidden.
- [ ] On `auditorium-event`, change the date filter / org filter (triggers
      `getAuditoriumEvents`) -> top bar stays hidden.
- [ ] Save/edit/delete an auditorium event (dialog actions) -> top bar stays
      hidden.
- [ ] Download CSV action -> top bar stays hidden.
- [ ] Confirm behavior holds after multiple navigations in a row (this is
      the scenario that was previously broken - bug only appeared after the
      *second* navigation).

## Files to change (Option A)
- `app/plugins/global-progress.client.ts` (new)
- `app/layouts/default.vue` (remove the `onMounted` block; remove now-unused
  `endNavigation` import from the composable destructure if `isLoading` is
  the only remaining export used there)
