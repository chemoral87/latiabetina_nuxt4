# Repository & API Convention

> **Goal:** all server communication goes through the `$api` wrapper and the
> repository layer — never raw `$fetch` in pages/components. This file documents
> the layering, the auth/refresh flow, param serialization, and how to add a new
> resource.

## Architecture

```
app/composables/useApi.ts          $api wrapper (auth token, refresh, progress, serialization)
app/repositories/factory/          createCommonRepository / createParentRepository / withNotify
app/repositories/RoleRepository.ts custom repository example (extends common)
app/composables/useRepository.ts   the ONLY entry point exposed to pages/components
app/pages/**                       call useRepository(), never $api directly
```

Data flow: **page/component → `useRepository()` → repository method → `$api` →
`$fetch`** to the backend.

## The `$api` wrapper (`app/composables/useApi.ts`)

`$api<T>(path, opts)` does three things automatically:

1. **Resolves the base URL** via `getBaseUrl()`:
   - `runtimeConfig.public.baseUrl` when set (from `.env` `BASE_URL`), otherwise
   - builds `http://{hostname}{SUFFIX_URL}` **on the client only** — returns `""`
     during SSR (see `ai_rule/nuxt4_ssr_hydration.md` for the SSR consequence).
2. **Attaches the Bearer token** from the `auth.token` cookie, refreshing it when
   near expiry via `tryRefreshToken()`. On a `401` it retries once with the
   refreshed token. A failed refresh clears the auth cookies and redirects to
   `/login`.
3. **Wraps the request with the global progress bar** (`useGlobalProgress`) so
   the top progress line only shows during route navigation.

### Param serialization quirk

`serializeParams` turns arrays into repeated `key[]=` query params:

```ts
params = { sortBy: ["name"], sortDesc: [false], page: 1 }
// → ?sortBy[]=name&sortDesc[]=false&page=1
```

`undefined` and `null` values are skipped. Never pass raw arrays expecting JSON
encoding — the backend expects the `[]` suffix form.

### `$api` opts

Same shape as `ofetch`/`$fetch`: `{ method, body, params, headers, ... }`.
`headers` are merged on top of the defaults (`Content-Type`, `Accept`,
`Authorization`).

## Repository factory

### `createCommonRepository($api, resource)` — flat CRUD

Exposes `index(params)`, `show(id)`, `filter(params)`, `create(payload)`,
`update(id, payload)`, `delete(id)`. Every method returns `withNotify(...)`.

```ts
const Auditorium = createCommonRepository($api, "/auditorium")
await Auditorium.index({ page: 1, itemsPerPage: 10 })
await Auditorium.create({ name: "Principal" })
```

### `createParentRepository($api, resource)` — nested under a parent id

First arg is always the **parent id**, second the entity id:

```ts
const Profile = createParentRepository($api, "/profile")
await Profile.index(parentId)
await Profile.update(parentId, id, payload)
```

### Custom repository (e.g. `RoleRepository.ts`)

Extend the common methods with resource-specific endpoints:

```ts
export function createRoleRepository(api: ApiFn, resource: string) {
  const common = createCommonRepository(api, resource)
  function distribution<T = unknown>(id: number | string, params?: Record<string, unknown>) {
    return api<T>(`${resource}/${id}/distribution`, { params })
  }
  return { ...common, distribution }
}
```

Export the return type (`export type RoleRepository = ReturnType<typeof createRoleRepository>`)
so pages can type the destructured value.

## Registering a new resource

1. In `app/composables/useRepository.ts`, add the resource:

   ```ts
   const MyResource = {
     ...createCommonRepository($api, "/my-resource"),
     // custom endpoint
     activate<T = unknown>(id: number | string) {
       return withNotify($api<T>(`/my-resource/${id}/activate`, { method: "POST" }))
     },
   }
   ```

2. Add it to the returned object: `MyResource,`.
3. Use it from pages/components:

   ```ts
   const { MyResource } = useRepository()
   ```

   Always destructure inside `<script setup>`; `useRepository()` reads
   `useApi()` so it must run in the setup context.

## `withNotify` behavior (`app/repositories/factory/withNotify.ts`)

Every repository method wraps the promise with `withNotify`, which:

- **Success:** shows a snackbar when the payload contains `success`, `warning`,
  or `error` fields. Client-only.
- **Error:** shows a toast for status `401/403/404/405` (message from
  `err.data.message`), a network toast when `status` is `undefined`, and a
  generic toast otherwise. **422 is NOT toasted** — field validation errors are
  extracted instead.
- **Validation:** on `422`, calls `useValidationErrors().extractFromError(err)`
  so `errors?.fieldName` is populated for inline `VTextField` rules.
- **Re-throws** the error — callers still need `try/catch` or `.catch()`.

## Rules

1. **Never call `$fetch` directly in pages/components.** Always go through
   `useRepository()` (or the repository layer). Use `$api` directly only inside
   repository factories.
2. **Always destructure `useRepository()` in setup** and **before any top-level
   `await`** (temporal dead zone — see `nuxt4_ssr_hydration.md`).
3. **Pass `params` as an object**, not a URL string — `serializeParams` handles
   encoding and the `[]` array suffix.
4. **Use `withNotify`** on every repository method, including custom endpoints,
   so success/error feedback and 422 field errors are consistent.
5. **Type responses**: `await Resource.index<{ data: unknown[]; total: number }>(params)`.
   Default generic is `unknown`.
6. For list calls, params follow the backend contract:
   `{ page, itemsPerPage, sortBy: [...], sortDesc: [...] }` (see the index-page
   pattern in `ai_rule/ui_vuetify2_migration.md`).
7. **Do not** duplicate existing methods (`index`/`show`/`filter`/`create`/
   `update`/`delete`) in a custom repository — spread `createCommonRepository`
   and only add the extra endpoints.
