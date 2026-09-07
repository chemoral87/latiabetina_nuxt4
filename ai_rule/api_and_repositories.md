# Repository & API Convention

All server communication goes through the `$api` wrapper and the repository layer — never raw `$fetch` in pages/components.

## Architecture

```
app/composables/useApi.ts          $api wrapper (auth token, refresh, progress)
app/repositories/factory/          createCommonRepository / createParentRepository / withNotify
app/composables/useRepository.ts   the ONLY entry point exposed to pages/components
app/pages/**                       call useRepository(), never $api directly
```

Data flow: **page/component → `useRepository()` → repository method → `$api` → `$fetch`**.

## The `$api` Wrapper

`$api<T>(path, opts)` does three things automatically:

1. **Resolves the base URL** via `getBaseUrl()` — `runtimeConfig.public.baseUrl` when set, otherwise builds `http://{hostname}{SUFFIX_URL}` on client only (returns `""` during SSR).
2. **Attaches the Bearer token** from the `auth.token` cookie, refreshing it when near expiry. On a `401` it retries once with the refreshed token.
3. **Wraps the request** with the global progress bar.

### Param Serialization

`serializeParams` turns arrays into repeated `key[]=` query params. **Do NOT add `[]` to param keys** — `serializeParams` already appends `[]` for array values.

```ts
// ❌ WRONG — double brackets
params["sortBy[]"] = ["name"]

// ✅ CORRECT — serializeParams adds [] automatically
params["sortBy"] = ["name"]
```

## Repository Factory

### `createCommonRepository($api, resource)` — flat CRUD

Exposes `index(params)`, `show(id)`, `filter(params)`, `create(payload)`, `update(id, payload)`, `delete(id)`.

### `createParentRepository($api, resource)` — nested under a parent id

First arg is always the **parent id**, second the entity id.

### Custom Repository

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

## Registering a New Resource

1. In `app/composables/useRepository.ts`, add the resource using `createCommonRepository`
2. Add it to the returned object
3. Use it from pages/components: `const { MyResource } = useRepository()`

## `withNotify` Behavior

Every repository method wraps the promise with `withNotify`:
- **Success:** shows snackbar when payload contains `success`/`warning`/`error`
- **Error:** shows toast for `401/403/404/405`; network toast when `status` is undefined
- **Validation:** on `422`, calls `useValidationErrors().extractFromError(err)` for inline field rules
- **Re-throws** the error — callers still need `try/catch`

## Rules

1. **Never call `$fetch` directly** in pages/components — always go through `useRepository()`
2. **Always destructure `useRepository()` in setup** and **before any top-level `await`**
3. **Pass `params` as an object** — `serializeParams` handles encoding
4. **Use `withNotify`** on every repository method including custom endpoints
5. **Type responses**: `await Resource.index<{ data: unknown[]; total: number }>(params)`
6. **Never** use `sortBy[]` as the key — `serializeParams` adds brackets automatically
7. **Do not** duplicate existing methods in a custom repository — spread `createCommonRepository` and only add extras
