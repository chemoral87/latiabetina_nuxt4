# Single-Org Scope Rule

> **Goal:** when a permission grants the authenticated user access to exactly one
> org, the UI must not ask for / show the org (selector, filter, column, label)
> and the API must not receive `org_id` — the backend resolves the org from the
> auth token context.

## Shared helpers (source of truth)

All single-org logic goes through the auth store helpers in
`app/composables/useAuth.ts`. Do **not** re-implement the check inline:

```ts
const auth = useAuthStore()

auth.orgIdsFor("auditorium-index")              // (number|string)[] — org ids granted for the permission
auth.hasSingleOrgFor("auditorium-index")        // boolean — true when exactly one org is accessible
```

Semantics of `hasSingleOrgFor(permission)`:
- `user.orgs.length === 1` **and** that org is in `permissionsOrg[permission]`
  → `true`.
- Otherwise → `false` (2+ accessible orgs, or no orgs).

Because these read the store's reactive `user`/`permissionsOrg`, wrap them in a
`computed` when used in a component:

```ts
const singleOrg = computed(() => auth.hasSingleOrgFor("auditorium-index"))
```

## Where it applies

| Situation | How |
|-----------|-----|
| Hide an org **column** in a table | `v-if` on the header/column, e.g. `AuditoriumEvent/Table.vue`: `if (!singleOrg.value)` skips the "Organización" header |
| Hide the org **selector / filter** on an index page | `v-if="!singleOrg"` (e.g. `auditorium/index.vue`) — do not rely on `v-model:hidden` from `OrganizationSelect` |
| Hide the org **label** on a detail page | `v-if="!singleOrg"` on the org `VCol` (e.g. `consolidation/[id]/details.vue`) |
| Skip `org_id` in API params | `watch(filterOrgId, (val) => { if (singleOrg.value) return; ... })` — never send `org_id` for single-org users |

`OrganizationSelect` also applies the same rule internally with `hide-one`
(see `app/components/Organization/Select.vue` and
`ai_rule/index_page_table_pattern.md` — "Suppress OrganizationSelect auto-select
duplicate request").

## Rules

1. Always use the store helpers (`orgIdsFor`, `hasSingleOrgFor`) — never read
   `auth.permissionsOrg[...]` or `auth.user.orgs` directly to re-derive "single
   org".
2. Pass the **permission that grants the data access** (e.g.
   `conso-sheet-index`, `auditorium-index`, `auditorium-event-index`), not a
   copy-pasted sibling permission. (Historical bug: `auditorium-event/index.vue`
   used `auditorium-index`.)
3. Wrap calls in `computed` so they stay reactive.
4. When only one org is accessible, do not send `org_id`; the backend resolves
   the org from the auth token.
5. Hide the org UI for *display* (column/label) and *input* (selector/filter)
   alike — the user cannot meaningfully change orgs they can't access.
6. Derive `orgFilterHidden` from `hasSingleOrgFor` instead of syncing
   `v-model:hidden` with `OrganizationSelect` — the value comes from the same
   single-org rule.

## Migration

Older index pages still sync a `orgFilterHidden` ref via
`v-model:hidden="orgFilterHidden"` on `OrganizationSelect`
(`auditorium-event/index.vue`, `church-event/index.vue`,
`church-event/calendar.vue`, `song/index.vue`, `testimony/index.vue`,
`AuditoriumEvent/Dialog.vue`). Migrate them to the derived computed:
`const orgFilterHidden = computed(() => auth.hasSingleOrgFor("<permission>"))`
and drop the `v-model:hidden` binding.

## Reference implementations

- `app/pages/auditorium/index.vue` — `singleOrg` (hides org filter + skips `org_id`)
- `app/pages/consolidation/[id]/details.vue` — `singleOrg` (hides `det-org` label)
- `app/components/AuditoriumEvent/Table.vue` — `singleOrg` (hides "Organización" column)