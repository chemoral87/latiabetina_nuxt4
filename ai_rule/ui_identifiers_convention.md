# UI Identifiers Convention

## Format

All interactive and structural elements must include an `id` attribute following this pattern:

```
{component}-{view}-{purpose}
```

**Rules:**
- All lowercase kebab-case
- `{component}` = element short name (see Component Prefixes)
- `{view}` = 2-3 letter prefix for the page or layout (see View Prefixes)
- `{purpose}` = what the element is for (e.g. `email`, `password`, `submit`, `clear`, `save`)
- Add a number suffix (`-1`, `-2`, ...) when multiple instances share the same view + purpose (e.g. `tf-my-dater-label-1`)

## Component Prefixes

| Element | Prefix |
|---------|--------|
| Button (`VBtn`) | `btn` |
| Text field (`VTextField`) | `tf` |
| Textarea (`VTextarea`) | `ta` |
| Select / Combobox (`VSelect`, `VCombobox`) | `sel` |
| Autocomplete (`VAutocomplete`) | `ac` |
| Switch (`VSwitch`) | `sw` |
| Checkbox (`VCheckbox`) | `chk` |
| Radio (`VRadio`, `VRadioGroup`) | `rad` |
| Slider (`VSlider`) | `sld` |
| Chip (`VChip`) | `chip` |
| Table / Data table (`VTable`, `VDataTable`, `VDataTableServer`) | `tbl` (use `dt` only for pre-existing `dt-...` ids) |
| Card (`VCard`) | `card` |
| Dialog (`VDialog`) | `dlg` |
| Menu (`VMenu`) | `mnu` |
| Tabs (`VTabs`) | `tbs` |
| List (`VList`) | `lst` |
| Form (`VForm`) | `form` |
| Navigation drawer | `nav-drawer` |
| App bar | `app-bar` |

## View Prefixes

| Page / route | Prefix |
|--------------|--------|
| Layout (`layouts/default.vue`) | `lay` |
| `index.vue` | `idx` |
| `dashboard.vue` | `dsh` |
| `login.vue` | `lgn` |
| `logout.vue` | `lgt` |
| `account/index.vue` | `acc` |
| `auth/google/callback.vue` | `gcl` |
| `my/index.vue` | `my` |
| `user/index.vue` | `usr` |
| `user/[id]/profile/index.vue` | `usp` |
| `user/[id]/profile/[profile_id]/index.vue` | `upp` |
| `role/index.vue` | `rol` |
| `role/[id]/children/index.vue` | `rch` |
| `role/[id]/distribution/index.vue` | `rdi` |
| `permission/index.vue` | `per` |
| `permission/[id]/distribution/index.vue` | `pdi` |
| `organization/index.vue` | `org` |
| `organization/[id]/config/index.vue` | `cfg` |
| `auditorium/index.vue` | `aud` |
| `auditorium/[id]/editor.vue` | `aed` |
| `auditorium-event/index.vue` | `aev` |
| `auditorium-event/[id]/mark/index.vue` | `amk` |
| `testimony/index.vue` | `tes` |
| `testimony/review/[id]/index.vue` | `rev` |
| `church-event/index.vue` | `eve` |
| `church-event/new.vue` | `nev` |
| `church-event/[id]/index.vue` | `evd` |
| `church-event/calendar.vue` | `cal` |
| `consolidation/index.vue` | `con` |
| `consolidation/[id]/details.vue` | `det` |
| `pos/index.vue` | `pos` |
| `pos/new.vue` | `posn` |
| `pos/cash-close.vue` | `posc` |
| `pos/kds/index.vue` | `kds` |
| `pos/sales/index.vue` | `poss` |
| `pos/sales/[id]/index.vue` | `psid` |
| `pos/sales/[id]/edit.vue` | `psed` |
| `pos/product/index.vue` | `prd` |
| `pos/product/new.vue` | `prn` |
| `pos/product/[id]/index.vue` | `pre` |

## Page Rule

Every interactive element in a page (`app/pages/**`) must carry an id built as
`{component}-{view}-{purpose}`:

- **Buttons**: `btn-{view}-{action}`
- **Inputs** (text field, select, switch, checkbox, slider, etc.): `{prefix}-{view}-{purpose}`
- **Chips**: `chip-{view}-{purpose}`
- **Tables**: `tbl-{view}-{purpose}`
- **Cards**: `card-{view}-{purpose}`

Do not rename existing ids that already follow the pattern; only add ids where missing.

## Component Rule

Components in `app/components/**` only need a **single general id** on their root
element:

```
cmp-{component-kebab-name}
```

Example: `app/components/User/Table.vue` root gets `id="cmp-user-table"`.
Do not add per-element ids inside components; only the root element.

## Examples

### Page (login)

```html
<VCard id="card-lgn-main">
  <VForm id="form-lgn-main">
    <VTextField id="tf-lgn-email" />
    <VTextField id="tf-lgn-password" />
    <VBtn id="btn-lgn-submit" />
    <VBtn id="btn-lgn-google" />
  </VForm>
</VCard>
```

### Page (user index) — chips, tables and buttons

```html
<VCard id="card-usr-list">
  <VChip id="chip-usr-status">{{ status }}</VChip>
  <VTable id="tbl-usr-users">
    ...
  </VTable>
  <VBtn id="btn-usr-create">Nuevo</VBtn>
</VCard>
```

### Component root id

```html
<!-- app/components/User/Table.vue -->
<VTable id="cmp-user-table">
  ...
</VTable>
```
