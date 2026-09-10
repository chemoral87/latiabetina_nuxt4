# Plan v2: Prefix-highlight permission chips (refines v1)

**Status:** todo
**Supersedes:** `features/todo/permission-chip-colors.md` (v1 — already implemented:
`app/utils/permissionChipColor.ts` + `Role/Table.vue` currently color the
*whole chip* per group). Don't delete v1; this plan only changes the two
points below. Move v1 to `features/done/` once this v2 is merged.

**What's wrong with the current result** (per the second screenshot):
grouping is too coarse. `church-member-medal-update`, `church-member-update`,
and `church-member-tracking-logs-index` all render as the *same* solid color
because the key is capped at the first two segments (`church-member` for all
three). Also the whole chip background changes color per group, which is
noisier than needed.

---

## 0. New spec (confirmed from Sergio's example)

```
<v-chip color="primary">
  <span style="background: <group-color>">life-group-</span>index
</v-chip>
```

Two changes from v1:

1. **Deeper grouping key** — drop *only* the last hyphen segment (the action
   word), keep everything else, no cap at 2 segments:
   - `church-member-medal-update` → key `church-member-medal`
   - `church-member-update` → key `church-member`
   - `church-member-tracking-logs-index` → key `church-member-tracking-logs`
   - `church-member-tracking-logs-all` → key `church-member-tracking-logs` (same as above — merges with the one above, correct)

   These are now three (not one) distinct keys → three distinct colors.
   Singletons (key appears once on the page) still mean "no color" — see below.

2. **Rendering changes from whole-chip color → prefix-only highlight:**
   - The `VChip` itself always keeps `color="primary"` (constant, not
     per-permission any more).
   - The label is split into two parts: `prefix` (the group key + trailing
     `-`) and `last` (the final action segment).
   - `prefix` gets wrapped in a small inline pill/span using the group's
     color as its **background** (existing palette — already dark/saturated,
     so white text on it stays readable; no new palette needed).
   - `last` stays plain, inheriting the chip's own default text color — this
     is the "preserve" part of the request.
   - When the group is a singleton (no repeats → mapped color is `"primary"`),
     skip the pill wrapper entirely so it just renders as plain text — a
     primary-colored pill on a primary chip would be invisible anyway.

No change needed to the existing palette or to `buildPermissionColorMap`'s
overall approach (count ≥ 2 → palette color via hash, else `"primary"`) — it
already keys by full permission name, and will produce the right value per
name automatically once the grouping key (item 1 above) changes. Only the
key-extraction function and the chip template change.

---

## Coordination protocol

Same as v1: claim a task by setting **Owner**/**Status** before touching its
file(s); each track owns its file(s) exclusively; leave notes instead of
cross-editing. Track B can start immediately — it only needs the two
signatures in §1, not Track A's finished implementation.

**Signatures Track B codes against:**

```ts
// app/utils/permissionChipColor.ts (existing file, both exports already present)
export function permissionGroupKey(name: string): string
// CHANGES: no more "cap at first two segments" — now `parts.slice(0, -1).join("-")`

export function buildPermissionColorMap(names: string[]): Record<string, string>
// unchanged signature/behavior, output values shift because the key changed

// NEW export Track A adds:
export function permissionLabelParts(name: string): { prefix: string; last: string }
// prefix includes the trailing "-", e.g. "church-member-medal-update" →
// { prefix: "church-member-medal-", last: "update" }
// single-segment name (no "-") → { prefix: "", last: name }
```

---

## Track A — grouping key + label-split helper

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| A1 | Update `permissionGroupKey()` in `app/utils/permissionChipColor.ts`: replace the `if (parts.length <= 2) return parts[0]` special case with `parts.slice(0, -1).join("-")` (drop only the last segment, no cap). Update the function's JSDoc examples to the three `church-member-*` cases in §0. | `app/utils/permissionChipColor.ts` | — | ⬜ todo | single-segment name (no hyphen) → key = the name itself (`slice(0,-1)` on a 1-element array is `[]`, joins to `""` — guard this: fall back to the full name as key so it doesn't collide with every other single-word permission) |
| A2 | Add `permissionLabelParts(name)` per the signature in the coordination section — reuses `permissionGroupKey()` internally so the two never drift apart. | same file | — | ⬜ todo | |
| A3 | Update `permissionChipColor.test.ts`: fix any existing assertions that relied on the old capped-at-2 behavior, add cases for the three `church-member-*` keys in §0 being distinct, add tests for `permissionLabelParts` (multi-segment, single-segment edge case). | `app/utils/permissionChipColor.test.ts` | — | ⬜ todo | |

## Track B — chip rendering (prefix pill + preserved suffix)

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| B1 | In `Role/Table.vue`, revert the `VChip`'s `:color` binding back to the constant `color="primary"` (remove the per-permission lookup on the chip itself — the color now lives on the inner pill, not the chip). | `app/components/Role/Table.vue` | — | ⬜ todo | |
| B2 | Replace the chip's text interpolation with `permissionLabelParts(permission.name)`: render the `prefix` in a `<span>` with `:style="{ backgroundColor: ... }"` set to the group's color from `permissionColors[...]`, but only when that color isn't `"primary"` (singleton) — in that case render `prefix` as plain text with no wrapper/background. Render `last` as plain text right after, no styling. Small pill styling: a touch of `border-radius`, horizontal `padding`, and matching the chip's text color (white) so it reads as an inset badge, not a second chip. | same file | — | ⬜ todo | keep this scoped to the template + a tiny helper fn in `<script setup>`; no new files |
| B3 | Manual check against the second screenshot's rows: within `consolidador`/`consolidador-manager`, `church-member-medal-*`, `church-member-tracking-logs-*`, and plain `church-member-*` (create/update/delete/index/all) should each show a *different* pill color on the prefix, while every chip's overall shape/base color is the same blue; `conso-sheet-*` keeps its own distinct pill color; singleton chips like `whatsapp-send` (single segment, no group) render with no pill at all. | — | — | ⬜ todo | visual QA only |

## Track C — polish (after A + B done)

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| C1 | Run lint/typecheck, fix anything the template/script changes trip. | — | — | ⬜ todo | |
| C2 | If a v1 `ai_rule/permission_chip_colors.md` doc was written, update it to describe the pill-on-prefix rendering instead of whole-chip coloring; otherwise skip. | `ai_rule/permission_chip_colors.md` (if it exists) | — | ⬜ todo | optional |

---

## Done criteria

- [ ] A1–A3 done, tests passing, `church-member-medal` / `church-member` / `church-member-tracking-logs` produce 3 distinct colors
- [ ] B1–B3 done, manual QA matches §0 (chip base stays constant, only the prefix pill varies, last segment always plain)
- [ ] C1 done (C2 optional)
- [ ] Move `permission-chip-colors.md` (v1) and this file to `features/done/`
