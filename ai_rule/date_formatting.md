# Date formatting rule — use `app/utils/date.ts`

**Never create a local `formatDate` / `formatDateTime` inside a component.** All date formatting must go through `app/utils/date.ts` so the output is consistent and timezone-safe (string-based, no `new Date()` shifts).

## Utils to use

| Need | Use |
|---|---|
| `DD MMM YYYY` e.g. `24 Ago 2026` | `formatShortDate(value)` |
| `DD/MMM/YYYY` | `formatShortDateSlash(value)` |
| `DD-MMM-YYYY` | `formatShortDateDash(value)` |
| `DD MMM YYYY HH:mm` (24h) | `formatShortDateTime(value)` |
| `DD MMM YYYY h:mm am/pm` e.g. `24 Ago 2026 1:05 pm` | `formatShortDateTime12h(value)` |
| `h:mm am/pm` from `HH:mm` | `formatHourTime(value)` |

All helpers are **string-based** (split `YYYY-MM-DD` / regex `(?:T|\s)HH:mm`) — they do not construct `new Date()`, so there is no timezone shift. Values like `2026-08-24 13:05:00` or `2026-08-24T13:05:00` work identically.

## Required pattern

```ts
import { formatShortDateTime12h } from "~/utils/date"

function formatDate(value: unknown): string {
  return formatShortDateTime12h(String(value ?? "")) || "—"
}
```

```vue
<template #[`item.last_contacted`]="{ item }">
  {{ formatDate(item.last_contacted) }}
</template>
```

## Anti-patterns

- `new Date(value).toLocaleDateString(...)` — introduces timezone shift and locale-dependent output.
- Copy-pasting month arrays or `pad()` inside a component — belongs in `utils/date.ts`.
- `formatShortDate(val) + ' ' + formatHourTime(...)` duplicated per component — use `formatShortDateTime12h` instead.

## Checklist

1. `grep -rn "function formatDate" app/` → 0 hits (except `utils/date.ts`).
2. `grep -rn "new Date(" app/components` → no date formatting via `new Date`.
3. `Tracking/Table.vue` and `ChurchMember/TrackingLogTable.vue` both delegate to `formatShortDateTime12h` — same output for `last_contacted` / `contact_datetime`.

## References

- `app/utils/date.ts` — single source of truth.
- `app/components/Tracking/Table.vue:123` — uses `formatShortDateTime12h`.
- `app/components/ChurchMember/TrackingLogTable.vue:172` — uses `formatShortDateTime12h`.
