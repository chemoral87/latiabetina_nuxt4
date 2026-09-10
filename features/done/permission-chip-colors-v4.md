# Plan v4: Switch chips to `variant="flat"` + re-darken light palette tokens

**Status:** todo
**Changes from v3:** only the `variant` prop (`"tonal"` → `"flat"`) and the
palette's color tokens. The grouping key, sort order, and per-permission
color-map logic are already correct and implemented — verified by reading
the current files, no rework there.

**Why this fixes the contrast complaint:** `flat` renders a solid background
in the given color with white text (like the very first version, minus the
drop shadow) — no more "colored text on a pale tint of the same hue" problem
that `tonal` had. But it introduces a different risk: **any palette token
that's inherently light-valued will now have poor white-text contrast on a
solid fill**, same failure mode as some of the tonal chips in the last
screenshot, just for a different reason. The current `PALETTE` in
`app/utils/permissionChipColor.ts` was tuned for `tonal` (v3 Track A1
deliberately moved several entries to their *base* hue, no darken suffix, to
get a visible tint) — under `flat` several of those are too light for white
text: `pink`, the duplicated `cyan`, `lime`, `amber`, `light-blue`, `orange`,
`yellow-darken-3`, `grey`, `light-green`. These need re-darkening.

---

## Starting palette proposal (verify visually, don't treat as final)

Rule of thumb: Material color tokens at `-darken-2` or deeper reliably read
fine with white text on a solid (`flat`/`elevated`) fill; base-level tokens
for inherently light hues (amber, lime, yellow, orange, pink, light-green,
light-blue, cyan, grey) generally do not. Proposed replacement, same length
(24), same relative hue spread, duplicate `cyan` entry replaced:

```ts
const PALETTE = [
  "purple",
  "teal",
  "pink-darken-2",
  "indigo",
  "brown",
  "cyan-darken-2",
  "deep-orange-darken-1",
  "blue-grey",
  "lime-darken-4",
  "amber-darken-4",
  "green-darken-1",
  "red-darken-2",
  "light-blue-darken-3",
  "orange-darken-2",
  "blue-darken-1",
  "yellow-darken-4",
  "grey-darken-3",
  "light-green-darken-3",
  "deep-purple",
  "deep-orange-darken-3",
  "teal-darken-1",
  "indigo-darken-1",
  "brown-darken-1",
  "red-darken-1",
]
```

This is a starting point from color-theory heuristics, not a verified
result — Track A must actually look at the rendered chips (not just trust
the token names) since perceived contrast also depends on font-weight/size
in this specific table, and adjust any entry that still reads poorly.

---

## Coordination protocol

Same convention as prior plans. These two tracks are fully decoupled this
time — B's change is a literal string swap that doesn't depend on which
exact colors A lands on, so there's no ordering constraint at all beyond
"don't both edit the same file at once."

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| A1 | Replace the `PALETTE` array in `app/utils/permissionChipColor.ts` with the proposal above (or an adjusted version). Load the Roles page after the swap and visually check every color that appears against white text; iterate on any that still read poorly. | `app/utils/permissionChipColor.ts` (palette array only) | — | ⬜ todo | |
| A2 | Check `permissionChipColor.test.ts` for any assertion that hardcodes a specific color string from the old palette (e.g. asserts a literal `"teal-darken-2"` value) — update only those; tests that assert *behavior* (same key → same color, different repeated keys → different colors, sort order) need no change. | `app/utils/permissionChipColor.test.ts` | — | ⬜ todo | likely a no-op, quick to confirm |
| B1 | In `Role/Table.vue`, change the `VChip`'s `variant="tonal"` to `variant="flat"`. One-line change. | `app/components/Role/Table.vue` | — | ⬜ todo | |
| B2 | Manual check across the same rows discussed so far (`admin-alpha`, `admin-betas`, `consolidador`, `consolidador-manager`, `life-group-leader`, etc.) — confirm every chip's text is comfortably readable against its solid background, not just "technically visible." | — | — | ⬜ todo | visual QA only |

## Track C — polish (after A + B done)

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| C1 | Run lint/typecheck. | — | — | ⬜ todo | |
| C2 | Re-run the full manual QA checklist from v1–v3 (grouping correctness, sort order, now contrast) once more end-to-end, since this is the point where all four rounds of feedback should finally be simultaneously satisfied. | — | — | ⬜ todo | |

---

## Done criteria

- [ ] A1–A2 done
- [ ] B1–B2 done, every chip reads clearly against white text
- [ ] C1–C2 done
- [ ] Move this file and the still-open `permission-chip-colors.md`,
      `permission-chip-colors-v2.md`, `permission-chip-colors-v3.md`, and
      `permission-chip-sort.md` to `features/done/` — this plan is the point
      where the whole thread of feedback converges.
