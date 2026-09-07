# UI Identifiers Convention

## Format

All interactive and structural elements must include an `id` attribute following this pattern:

```
{view}-{purpose}
```

with an optional `-{component}` suffix appended for a few elements that benefit from
disambiguation (see Component Suffixes).

**Rules:**
- All lowercase kebab-case
- `{view}` = 2-3 letter prefix for the page or layout (see View Prefixes)
- `{purpose}` = what the element is for (e.g. `email`, `password`, `submit`, `clear`, `save`)
- Add a number suffix (`-1`, `-2`, ...) when multiple instances share the same view + purpose

## Component Suffixes

Inputs and form controls do **not** carry a component suffix; use just `{view}-{purpose}`:

- **Inputs & controls** (`VTextField`, `VSelect`, `VCombobox`, `VAutocomplete`, `VSwitch`, `VCheckbox`, `VSlider`, `VChip`, `VTextarea`, `VRangeSlider`): no suffix.
- **Dialog (`VDialog`)** root: `{view}-{purpose}-dlg`
- **Button** (`VBtn`): `-btn`
- **Card** (`VCard`): `-card`
- **Table** (`VDataTable`): `-dt` (existing ids only)

### Legacy suffixed ids (deprecated)

Old ids carrying a component-type suffix (`-tf-1`, `-sel-1`) or a `tf-` prefix must be renamed to `{view}-{purpose}` whenever touched.

## View Prefixes

| Page / route | Prefix |
|--------------|--------|
| Layout (`layouts/default.vue`) | `lay` |
| `index.vue` | `idx` |
| `dashboard.vue` | `dash` |
| `login.vue` | `login` |
| `logout.vue` | `logout` |
| `account/index.vue` | `acc` |
| `auth/google/callback.vue` | `gcl` |
| `my/index.vue` | `my` |
| `user/index.vue` | `usr` |
| `role/index.vue` | `rol` |
| `role/[id]/children/index.vue` | `rch` |
| `role/[id]/distribution/index.vue` | `rdi` |
| `permission/index.vue` | `per` |
| `permission/[id]/distribution/index.vue` | `pdi` |
| `organization/index.vue` | `org` |
| `organization/[id]/config/index.vue` | `orgcfg` |
| `auditorium/index.vue` | `aud` |
| `auditorium/[id]/editor.vue` | `aed` |
| `auditorium-event/index.vue` | `auev` |
| `auditorium-event/[id]/mark/index.vue` | `auevent` |
| `testimony/index.vue` | `tes` |
| `testimony/review/[id]/index.vue` | `rev` |
| `church-event/index.vue` | `chrcev` / `eve` |
| `church-event/calendar.vue` | `chrcev` / `eve` |
| `consolidation/index.vue` | `cnsld` / `con` |
| `consolidation/[id]/details.vue` | `cnsld` / `det` |
| `church-member/consolidator-logs/index.vue` | `cml` |
| `church-member/tracking-logs/index.vue` | `mtl` |
| `pos/index.vue` | `pos` |
| `pos/new.vue` | `posn` |
| `pos/cash-close.vue` | `posc` |
| `pos/kds/index.vue` | `pos` |
| `pos/sales/index.vue` | `poss` |
| `pitcher/index.vue` | `pit` |

## Page Rule

Every interactive element in a page (`app/pages/**`) must carry an id built as `{view}-{purpose}`:

- **Buttons**: `{view}-{action}-btn`
- **Inputs**: `{view}-{purpose}` (no `tf`/`sel` suffix)
- **Cards**: `{view}-{purpose}-card`
- **Tables**: `{view}-{purpose}`
- **Containers & text**: `{view}-{purpose}` only when interactive or referenced from JS/tests

## Unique IDs in Table Row Slots

**IDs inside `VDataTable` / `VDataTableServer` row templates must be unique per row.**

```vue
<!-- WRONG — same id on every row -->
<VBtn id="con-table-view-btn" @click="view(item)" />

<!-- CORRECT — unique per row -->
<VBtn :id="`con-table-view-btn-${item.id}`" @click="view(item)" />
```

## Component Rule

Components in `app/components/**` use one of two id styles:

1. **Single root id** for self-contained, reusable display components: `cmp-{component-kebab-name}`
2. **Per-element ids inside dialogs/forms**: follow the page rule with the view prefix of their parent page
