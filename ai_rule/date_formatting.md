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

## Date and Time Display Rules

- Use `formatHourTime(value)` for standalone service or event times stored as `HH:mm`/`HH:mm:ss`; display as `h:mm am/pm` (for example, `09:45` → `9:45 am` and `20:00` → `8:00 pm`).
- Keep native time inputs and API payloads in 24-hour `HH:mm` format; format only when rendering.
- Import the shared helper from `~/utils/date`; never format a time inline in a component or table slot.

## Required Pattern

```ts
import { formatHourTime } from "~/utils/date"

function displayTime(value: unknown): string {
  return formatHourTime(String(value ?? ""))
}
```

For a date and time together, use `formatShortDateTime12h(value)` instead of combining date and time manually.

## Anti-patterns

- `new Date(value).toLocaleDateString(...)` — introduces timezone shift
- Copy-pasting month arrays inside a component — belongs in `utils/date.ts`
- Duplicating format concatenation per component — use `formatShortDateTime12h` instead
