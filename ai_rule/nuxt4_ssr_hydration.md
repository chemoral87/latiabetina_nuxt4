# Nuxt 4 SSR Data Loading Rule

> **Goal:** list pages show their first table data **with the route render** (SSR),
> never loaded afterwards, and without `[Vue warn]: Hydration node mismatch` warnings.

## Symptom (bad)

Browser console shows a hydration mismatch inside a `VDataTableServer`:

```
[Vue warn]: Hydration node mismatch:
- rendered on server: <tr class="v-data-table-rows-no-data">…</tr>
- expected on client: Symbol(v-fgt)
  at <VDataTableRows ...>
```

## Root Cause

- The repository/`$api` layer needs an API base URL and the auth token. The token is
  stored in a cookie (`auth.token`) and is available during SSR.
- The API base URL must be configured for the **server** too. `useApi().getBaseUrl()`
  returns `runtimeConfig.public.baseUrl` when set, otherwise it builds the URL only on
  the client (`import.meta.client`) and returns `""` during SSR — so any SSR fetch
  fails unless `BASE_URL` is set.
- If a page fetches in setup (top-level `await`) while SSR can't reach the API, the
  server renders the empty "no data" row but the client fetch succeeds → mismatch.
- If a page fetches only in `onMounted`, there is no mismatch but the first paint is
  empty — **data loads after the route**, which is not acceptable.

## Rule

1. **Initial list data MUST be loaded during SSR** so the first paint contains it:

   ```ts
   const { data: initialData } = await useAsyncData(
     "auditorium-index",
     async () => {
       const apiParams: Record<string, unknown> = { page: 1, itemsPerPage: 10, sortBy: ["name"], sortDesc: [false] }
       return await Auditorium.index<{ data: unknown[]; total: number }>(apiParams)
         .catch(() => ({ data: [], total: 0 }))
     },
     { default: () => ({ data: [] as unknown[], total: 0 }) },
   )

   response.value = initialData.value
   lastOptions.value = { page: 1, itemsPerPage: 10, sortBy: [{ key: "name", order: "asc" }] }
   ```

   `useAsyncData` fetches during SSR, serializes the result into the Nuxt payload, and
   the client hydrates from that payload (no re-fetch) — identical server/client
   output, no mismatch, and the table is already filled on the first render.

2. **Configure the API base URL for the server** in `.env` (dev):

   ```
   BASE_URL=http://localhost:8001/api
   SUFFIX_URL=:8001/api
   ```

   Without `BASE_URL`, SSR cannot reach the API and the page renders empty.
   **A `.env` change requires a dev server restart** (`Ctrl+C` then `npm run dev`).

3. **Never** fetch through `useRepository()` / `$api` with a **top-level `await` in
   setup** (double-fetch during hydration + mismatch risk), and **do not** defer the
   initial load to `onMounted` (empty first paint / "loading after route").

## Apply To

- `app/pages/**` index/list pages rendering a `VDataTableServer` (or any data table)
  fed by a repository call.

## Reference

- `app/pages/auditorium/index.vue` — uses `useAsyncData("auditorium-index", ...)`.

## Do Not

- Add `@click:clear`/`onClick:clear` hacks to shared components to work around a page
  not reacting to filter changes. Fix the page's data flow (watch → reload with empty
  filter) instead.
