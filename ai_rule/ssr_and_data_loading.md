# SSR & Data Loading Rules

## Initial List Data MUST Be Loaded During SSR

Pages must show their first table data **with the route render** (SSR), never loaded afterwards, and without hydration mismatch warnings.

### Rule

1. **Initial list data MUST be loaded during SSR** using `useAsyncData`:

```ts
const { data: initialData } = await useAsyncData(
  "auditorium-index",
  async () => {
    const apiParams = buildApiParams(lastOptions.value)
    return await Auditorium.index<{ data: unknown[]; total: number }>(apiParams)
      .catch(() => ({ data: [] as unknown[], total: 0 }))
  },
  { default: () => ({ data: [] as unknown[], total: 0 }) },
)
response.value = initialData.value
```

`useAsyncData` fetches during SSR, serializes the result into the Nuxt payload, and the client hydrates from that payload (no re-fetch).

2. **Configure the API base URL for the server** in `.env`:

```
BASE_URL=http://localhost:8001/api
SUFFIX_URL=:8001/api
```

Without `BASE_URL`, the `$api` wrapper returns `""` during SSR and all SSR fetches fail.

### Do Not

- Do not fetch only in `onMounted` — the first paint would be empty
- Do not combine `useAsyncData` with `@update:options` pointing to the same fetch — causes double call
- Do not hard-code `sortBy`/`sortDesc` — use `buildApiParams(lastOptions)`

---

## VDataTableServer Duplicate Fetch on Mount

`VDataTableServer` fires `@update:options` on mount. If the page also calls the fetch function in a top-level `await`, the data is fetched twice.

### Rule

1. **Do not manually fetch data that `VDataTableServer` will fetch via `@update:options`**
2. Use `initialLoaded` flag to suppress mount-time duplicate:

```ts
let initialLoaded = false

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    initialLoaded = true
    return
  }
  loadRoles(opts)
}
```

3. For **dynamic datasets** (master-detail, tabbed views), use a request counter instead:

```ts
let requestId = 0

async function fetchData(options: Record<string, unknown> = {}) {
  const id = ++requestId
  loading.value = true
  try {
    const params = buildApiParams({ ...lastOptions.value, ...options })
    const result = await Repository.getAll(params)
    if (id !== requestId) return
    response.value = result
  } finally {
    if (id === requestId) loading.value = false
  }
}
```

---

## Never Skip Auth Middleware on Server

See `auth_and_permissions.md` — authenticated middleware must run during SSR so anonymous users get a clean redirect, not a 403 error page.
