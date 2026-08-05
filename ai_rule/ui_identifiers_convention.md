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
- Add a number suffix (`-1`, `-2`, ...) when multiple instances share the same view + purpose (e.g. `aud-dialog-name`)

## Component Suffixes

Inputs and form controls do **not** carry a component suffix; use just `{view}-{purpose}`:

- **Inputs & controls** (`VTextField`, `VSelect`, `VCombobox`, `VAutocomplete`, `VSwitch`, `VCheckbox`, `VSlider`, `VChip`, `VTextarea`, `VRangeSlider`): no suffix. Example: `aud-dialog-name` (a name field in the auditorium dialog), `aud-dialog-org` (an organization select), `pos-payment` (a payment select).
- **Textarea** (`VTextarea`): no suffix, e.g. `det-comments`.
- **Dialog (`VDialog`)** root: `{view}-{purpose}-dlg`, e.g. `aud-dialog-dlg-1`.
- **Card** (`VCard`) → `-card`, **Table** (`VDataTable`) → `dt` (only for the existing `-dt-*` ids), **Button** (`VBtn`) → `-btn`.

## Component Suffix Reference

| Element | Suffix |
|---------|--------|
| Button (`VBtn`) | `-btn` |
| Dialog (`VDialog`) root | `-dlg` |
| Card (`VCard`) | `-card` |
| Table / Data table (`VTable`, `VDataTable`, `VDataTableServer`) | `-dt-*` (existing ids only) |
| Inputs & controls (`VTextField`, `VSelect`, `VCombobox`, `VAutocomplete`, `VSwitch`, `VCheckbox`, `VSlider`, `VChip`, `VTextarea`, `VRangeSlider`) | *(no suffix)* |

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
| `user/[id]/profile/index.vue` | `usp` |
| `user/[id]/profile/[profile_id]/index.vue` | `upp` |
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
| `pos/index.vue` | `pos` |
| `pos/new.vue` | `posn` |
| `pos/cash-close.vue` | `posc` |
| `pos/kds/index.vue` | `pos` |
| `pos/sales/index.vue` | `poss` |
| `pos/sales/[id]/index.vue` | `psid` |
| `pos/sales/[id]/edit.vue` | `psed` |

> When a page mixes prefixes (e.g. `chrcev` for page-level buttons and `eve` for
> component-level ids), keep the one already in use on that page rather than
> inventing a new one.

## Page Rule

Every interactive element in a page (`app/pages/**`) must carry an id built as
`{view}-{purpose}`:

- **Buttons**: `{view}-{action}-btn`
- **Inputs** (text field, select, switch, checkbox, slider, etc.): `{view}-{purpose}` (no `tf`/`sel` suffix)
- **Chips**: `{view}-{purpose}`
- **Tables**: `{view}-{purpose}`
- **Cards**: `{view}-{purpose}-card`

Do not rename existing ids that already follow the pattern; only add ids where missing.

## Component Rule

Components in `app/components/**` use one of two id styles:

1. **Single root id** for self-contained, reusable display components (tables,
   selects, pickers, panels). The root element gets:

   ```
   cmp-{component-kebab-name}
   ```

   Example: `app/components/User/Table.vue` root gets `id="cmp-user-table"`.
   Do not add per-element ids inside these components; only the root element.

2. **Per-element ids inside dialogs/forms** — dialog and form components that
   render multiple fields and actions (e.g. `Auditorium/Dialog.vue`,
   `User/Dialog.vue`) carry ids on each element, following the page rule with the
   view prefix of their parent page. Examples: `aud-dialog-name`,
   `aud-dialog-org`, `aud-dialog-save-btn`, `aud-dialog-dlg-1`.

### Overridable component ids

For reusable form-control components, expose an `id` prop whose default is the
`cmp-{component-kebab-name}` root id, so callers can pass a contextual id
without editing the component. Bind it to the root element:

```vue
<VSelect :id="id" ... />
```

```ts
const props = withDefaults(defineProps<{ id?: string; ... }>(), {
  id: "cmp-auditorium-select",
  ...
})
```

Currently adopted by `Auditorium/Select.vue` (`cmp-auditorium-select`),
`Organization/Select.vue` (`cmp-organization-select`) and
`My/DatePicker.vue` (`cmp-my-date-picker`).

> **Callers of an overridable select can pass `selectedName`** to display the
> current value immediately when its items have not loaded yet (see
> `Auditorium/Select.vue`). e.g. `AuditoriumEvent/Dialog.vue` passes
> `:selected-name="localEvent.auditorium_name ?? null"`.

## Examples

### Page (login)

```html
<VCard id="login-main-card">
  <VForm id="login-main-form">
    <VTextField id="login-email" />
    <VTextField id="login-password" />
    <VBtn id="login-submit-btn" />
    <VBtn id="login-google-btn" />
  </VForm>
</VCard>
```

### Page (user index) — chips, tables and buttons

```html
<VCard id="usr-index-card">
  <VChip id="usr-status">{{ status }}</VChip>
  <VTable id="usr-users">...</VTable>
  <VBtn id="usr-refresh-btn" />
  <VBtn id="usr-new-btn">Nuevo</VBtn>
</VCard>
```

### Component inputs (no `tf`/`sel` suffix)

```html
<!-- app/components/Auditorium/Dialog.vue -->
<VTextField id="aud-dialog-name" />
<OrganizationSelect id="aud-dialog-org" />
<VBtn id="aud-dialog-save-btn">Guardar</VBtn>
```

### Component root id

```html
<!-- app/components/User/Table.vue -->
<VTable id="cmp-user-table">
  ...
</VTable>
```
