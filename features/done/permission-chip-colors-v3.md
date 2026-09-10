# Plan v3: Whole-chip tonal color per group (drops the prefix-pill idea)

**Status:** todo
**Supersedes:** the *rendering* half of `features/todo/permission-chip-colors-v2.md`
(the prefix-pill-inside-chip approach — confirmed by Sergio to look broken:
inconsistent spacing/corners at the text seam, and some pill colors nearly
invisible against the blue chip).

**Keeps:** the grouping-key fix from v2 — already implemented and correct,
no changes needed. `permissionGroupKey()` in `app/utils/permissionChipColor.ts`
already drops only the last segment (`church-member-medal` / `church-member` /
`church-member-tracking-logs` are already three distinct keys). Verified by
reading the current file — do not redo this part.

**Direction (Sergio's choice):** go back to coloring the **whole chip** per
group — like the very first version — but:
1. use Vuetify's `variant="tonal"` instead of `variant="elevated"` (soft
   tinted background + colored text, not a loud solid fill), and
2. drop the prefix/suffix text-splitting entirely — the chip just shows the
   full permission name as plain text again.

`buildPermissionColorMap()` already returns exactly what this needs (one
color per full permission name, `"primary"` for singletons) — **no utility
changes required at all** for this plan. This is almost entirely a template
revert in one file.

---

## Important Vuetify behavior to know before starting

`variant="tonal"` does **not** render white text on a solid fill like
`elevated` did. It renders a light tint of the color as background *with
text in that same color* (e.g. dark-purple text on a pale-purple chip). This
is a different contrast model than what the palette was tuned for
(elevated/solid assumed white text on a dark fill) — see Track A.

---

## Coordination protocol

Same as v1/v2: claim a task by setting **Owner**/**Status** before touching
its file(s); each track owns its file(s) exclusively. Track B does not need
to wait on Track A — `buildPermissionColorMap`'s signature isn't changing,
only whether the *values* it returns still look good under `tonal` is being
reviewed in parallel.

## Track A — palette review for `tonal` legibility

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| A1 | Render (or visually check via Vuetify docs/playground) each of the 24 `PALETTE` entries in `app/utils/permissionChipColor.ts` under `<VChip variant="tonal" :color="...">`. Darken-suffixed tokens (`amber-darken-4`, `brown-darken-1`, etc.) may look muddy or barely-tinted in `tonal` mode since the tint algorithm behaves differently than on a solid fill — trim/replace any that read poorly. Prefer base hue names (`purple`, `teal`, `pink`, `indigo`, `brown`, `cyan`, `deep-orange`, `blue-grey`, `lime`, `amber`, `green`, `red`, etc.) over `-darken-N` variants unless a darken variant is specifically needed to keep two hues from looking too similar. | `app/utils/permissionChipColor.ts` (palette array only — do not touch the two exported functions' logic) | — | ⬜ todo | Keep the array the same length/shape; only replace individual color-token strings |
| A2 | Update `permissionChipColor.test.ts` only if any test asserted a specific color string from the old palette that A1 changed (tests should mostly assert *consistency*, e.g. "same key → same color", "different repeated keys → different colors" — not hardcoded color names, so this is likely a no-op check rather than a rewrite). | `app/utils/permissionChipColor.test.ts` | — | ⬜ todo | |
| A3 | `permissionLabelParts()` is no longer used anywhere after Track B lands. Leave the function in place for now (harmless unused export, not worth a cross-file coordination race to delete it mid-flight) — note it as a cleanup candidate for Track C instead of removing it here. | — | — | ⬜ todo | do NOT delete in this track |

## Track B — revert chip template to whole-chip color

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| B1 | In `Role/Table.vue`, change the `VChip` back to `:color="permissionColors[(permission as Record<string, unknown>).name as string] ?? 'primary'"` (per-permission again, not the constant `"primary"`) and `variant="tonal"` (was `"elevated"`). | `app/components/Role/Table.vue` | — | ⬜ todo | |
| B2 | Remove the `<template v-if="permissionLabelParts(...).prefix">...</template>` block and the two `<span>`s — the chip's content goes back to plain `{{ permission.name }}`. Remove the now-unused `permissionLabelParts` import. | same file | — | ⬜ todo | |
| B3 | Remove the now-dead `.permission-prefix-pill` CSS rule from the `<style scoped>` block. | same file | — | ⬜ todo | |
| B4 | Manual check against the roles from the screenshots: each role's chips should again show one solid-but-soft tonal color per repeated group (`church-member-medal-*` one color, plain `church-member-*` a different color, `church-member-tracking-logs-*` a third), singletons (`whatsapp-send`, `user-index` in `manager`) render as plain default `primary` tonal chips, and — the actual point of this revert — no broken text seams or invisible-on-blue pills anywhere. | — | — | ⬜ todo | visual QA only |

## Track C — polish (after A + B done)

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| C1 | Run lint/typecheck; an unused exported function doesn't usually trigger lint, but confirm. | — | — | ⬜ todo | |
| C2 | Decide whether to delete `permissionLabelParts()` (unused after B2) or keep it for a possible future use — if deleting, also drop its tests in `permissionChipColor.test.ts`. | `app/utils/permissionChipColor.ts`, `app/utils/permissionChipColor.test.ts` | — | ⬜ todo | small enough for either agent to grab once A+B are both done |

---

## Done criteria

- [ ] A1–A3 done
- [ ] B1–B4 done, manual QA confirms whole-chip tonal color, no text-splitting, no invisible/low-contrast chips
- [ ] C1–C2 done
- [ ] Move this file, and the still-open v1/v2 files, to `features/done/`
