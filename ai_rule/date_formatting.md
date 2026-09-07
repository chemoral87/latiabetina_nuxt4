# Date Formatting Rules

**Never create a local `formatDate` / `formatDateTime` inside a component.** All date formatting must go through `app/utils/date.ts` so the output is consistent and timezone-safe (string-based, no `new Date()` shifts).

## Utils to Use

| Need | Use |
|---|---|
| `DD MMM YYYY` e.g. `24 Ago 2026` | `formatShortDate(value)` |
| `DD/MMM/YYYY` | `formatShortDateSlash(value)` |
| `DD-MMM-YYYY` | `formatShortDateDash(value)` |
| `DD MMM YYYY HH:mm` (24h) | `formatShortDateTime(value)` |
| `DD MMM YYYY h:mm am/pm` | `formatShortDateTime12h(value)` |
| `h:mm am/pm` from `HH:mm` | `formatHourTime(value)` |

All helpers are **string-based** — they do not construct `new Date()`, so there is no timezone shift.

## Required Pattern

```ts
import { formatShortDateTime12h } from "~/utils/date"

function formatDate(value: unknown): string {
  return formatShortDateTime12h(String(value ?? "")) || "—"
}
```

## Anti-patterns

- `new Date(value).toLocaleDateString(...)` — introduces timezone shift
- Copy-pasting month arrays inside a component — belongs in `utils/date.ts`
- Duplicating format concatenation per component — use `formatShortDateTime12h` instead
