# Plan: Color-group permission chips on Roles page

**Status:** todo
**Page:** `app/pages/role/index.vue` → renders via `app/components/Role/Table.vue`
**Goal:** In the "Permisos" column, VChips whose permission name shares a common
prefix get the same color. Prefixes that don't repeat fall back to the default
blue (`primary`).

---

## 0. Grouping algorithm (read this before claiming a task)

Permission names follow `{group}-{action}` (see `ai_rule/auth_and_permissions.md`).
Examples seen in the current DB (from the screenshot): `user-index`,
`alpha-special`, `auditorium-event-create`, `church-member-update`,
`church-member-tracking-logs-index`, `conso-sheet-index`,
`life-group-index`, `test-perm-1741300000000`.

**Group key rule:**
- Split the name on `-`.
- If it has **2 segments**, the key is segment `[0]` (e.g. `auditorium-index` → `auditorium`).
- If it has **3+ segments**, the key is segments `[0,1]` joined by `-`
  (e.g. `church-member-tracking-logs-index` → `church-member`,
  `auditorium-event-create` → `auditorium-event`,
  `test-perm-1741300000000` → `test-perm`).

This is why `church-member-*` (any depth) collapses to one group, while
`auditorium-*` (2-segment) and `auditorium-event-*` (3-segment) are two
*different* groups, matching the two examples in the request.

**Color assignment:**
- Colors are computed once per render pass over **every permission name
  currently visible in the table** (all rows on the current page), not per
  row — so `church-member` looks the same color in every role that has it.
- Count occurrences of each group key across that full set.
- A key with **count ≥ 2** gets a color deterministically hashed from a
  fixed palette (same key → always same color, no randomness).
- A key with **count == 1** (no real repetition, nothing to group) falls
  back to `primary` (blue) — the default.

> ⚠️ This is the assumed interpretation of the request — reasonable and
> internally consistent with both examples given, but not confirmed by
> Sergio. If he wants a different segment depth or per-role (instead of
> per-page) counting, only §1 below needs to change; nothing downstream
> does, since B/C consume it through the function signature in §1.

---

## Coordination protocol (read this before claiming a task)

- Claim a task by editing its **Owner** cell below to your agent name and
  status to `🔵 in progress`, before writing any code for it.
- Set status to `✅ done` (with a one-line note) when finished.
- **File ownership is exclusive per track** — never edit a file another
  track owns, even a small fix. If Track B needs a change in Track A's
  file, leave a note in the **Notes** column instead of editing it.
- Track B depends on the export signature in §1, not on Track A's full
  implementation — so both tracks can start immediately in parallel. Track
  B should write against the signature below and only re-check behavior
  once Track A's status flips to done.
- Track C starts only after both A and B are `✅ done`.

**Exported signature Track A must ship (Track B codes against this now):**

```ts
// app/utils/permissionChipColor.ts
export function permissionGroupKey(name: string): string
export function buildPermissionColorMap(names: string[]): Record<string, string>
// returns e.g. { "church-member-update": "teal-darken-2", "user-index": "primary", ... }
// keyed by the FULL permission name for O(1) lookup per chip — the group-key
// logic stays internal to this file.
```

---

## Track A — color logic (new files only)

No overlap with Track B's file — start immediately.

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| A1 | Create `app/utils/permissionChipColor.ts` exporting `permissionGroupKey()` and `buildPermissionColorMap()` per §0/§1. Define a fixed palette constant of ~10-12 Vuetify color tokens, picked to avoid the semantic colors already used elsewhere (`primary`, `success`, `error`, `info`, `warning`) — e.g. `deep-purple`, `teal-darken-2`, `pink-darken-1`, `indigo`, `brown`, `cyan-darken-3`, `deep-orange-darken-1`, `blue-grey-darken-1`, `lime-darken-3`, `amber-darken-4`, `green-darken-3`, `red-darken-1`. Use a small stable string-hash (no external dep) to pick `palette[hash(key) % palette.length]` so a key always maps to the same color across renders/pages. | `app/utils/permissionChipColor.ts` (new) | — | ⬜ todo | |
| A2 | Vitest unit tests: 2-segment name, 3+-segment name, 5-segment name (`church-member-tracking-logs-index`), singleton falls back to `primary`, same key twice → same color, two different multi-occurrence keys → different colors. Match existing test style/location used for other composables (check `app/composables/*.test.ts` if present, else mirror project's Vitest config). | `app/utils/permissionChipColor.test.ts` (new) | — | ⬜ todo | |
| A3 | JSDoc comments on both exports explaining the group-key rule with 2-3 inline examples (style: see header comment block in `app/composables/useRowHighlight.ts`). | same file as A1 | — | ⬜ todo | can bundle into A1 |

## Track B — table integration (existing file only)

Only this track touches `Role/Table.vue`. Code against the §1 signature; swap
in the real import once A1 lands (import path is stable so no rework needed).

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| B1 | In `Role/Table.vue`, add `import { buildPermissionColorMap } from "~/utils/permissionChipColor"` and a `computed` that flattens `permission.name` across every row in `items.value` (all currently loaded roles) into one array, then calls `buildPermissionColorMap()` once → `Record<string,string>`. | `app/components/Role/Table.vue` | — | ⬜ todo | Nuxt auto-imports `app/utils/*`; explicit import is still fine/clearer |
| B2 | In the `#[`item.permissions`]` slot, change the hardcoded `color="primary"` on `VChip` to `:color="permissionColors[permission.name as string] ?? 'primary'"` reading from the B1 computed. Keep `variant="elevated"` (already correct per `ai_rule/button_variants.md` — chips are exempt from the action-button variant rules). | same file | — | ⬜ todo | |
| B3 | Manual check against the roles in the screenshot: `consolidador` / `consolidador-manager` rows should show one shared color for every `church-member-*` chip and another shared color for every `conso-sheet-*` chip; `auditorium-manager` (`auditorium-index/update/create/delete`) should show one color; `auditorium-event-manager` (`auditorium-event-*`) a *different* color; `manager` row (`user-index`, `role-index`, `permission-index`) should render all three as default blue since none repeats. | — | — | ⬜ todo | visual QA, no file changes |

## Track C — polish (after A + B are done)

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| C1 | Confirm every palette color gives adequate white-text contrast on `VChip` (Vuetify default chip text is white on `elevated`/filled colors) — drop/replace any token that reads too light (e.g. double-check `amber`/`lime` variants actually used are the `darken-3`/`darken-4` shades, not the base light ones). | `app/utils/permissionChipColor.ts` | — | ⬜ todo | |
| C2 | Run project lint/typecheck (`npm run lint`, `npm run typecheck` or equivalent from `package.json`) and fix any issues introduced. | — | — | ⬜ todo | |
| C3 | Optional: add a short `ai_rule/permission_chip_colors.md` documenting the group-key rule and palette, following the existing `ai_rule/*.md` doc style, so future permission-related UI stays consistent. | `ai_rule/permission_chip_colors.md` (new) | — | ⬜ todo | optional, skip if time-boxed |

---

## Done criteria

- [ ] A1–A3 done, tests passing
- [ ] B1–B3 done, manual QA matches §0 expectations on the real Roles page
- [ ] C1–C2 done (C3 optional)
- [ ] Move this file from `features/todo/` to `features/done/` once all boxes above are checked
