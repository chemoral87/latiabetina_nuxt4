# Button Variants Convention

> Visual hierarchy through button variants based on ui-ux-pro-max `primary-action` rule.

---

## Rule

**Each screen should have only one primary CTA; secondary actions visually subordinate** (Apple HIG, Material Design).

---

## Variant Assignment

| Action Type | Variant | Use Case |
|-------------|---------|----------|
| **Primary** | `elevated` | Main CTA: Save, Submit, Confirm, Edit (when sole primary), Login, Dashboard redirect |
| **Secondary** | `outlined` | Cancel, Back, Close, Refresh, secondary actions |
| **Tertiary** | `text` or `tonal` | Inline actions, icon-only buttons, chips |
| **Destructive** | `flat` + `color="error"` | Delete confirmations |

---

## Examples

### Dialog (Reference: `dialog_convention.md`)

```vue
<!-- Cancel: secondary -->
<VBtn color="primary" variant="outlined" @click="close">Cancelar</VBtn>

<!-- Save: primary -->
<VBtn color="primary" variant="elevated" :loading="saving" @click="save">Guardar</VBtn>

<!-- Delete confirm: destructive -->
<VBtn color="error" variant="flat" @click="remove">Eliminar</VBtn>
```

### Page Actions

```vue
<!-- Back: secondary -->
<VBtn color="primary" variant="outlined" @click="goBack">
  <VIcon start>mdi-arrow-left</VIcon>
  Volver
</VBtn>

<!-- Edit: primary (sole main action) -->
<VBtn color="primary" variant="elevated" @click="editDialog = true">
  <VIcon start>mdi-pencil</VIcon>
  Editar
</VBtn>

<!-- Refresh: secondary -->
<VBtn color="primary" variant="outlined" :loading="loading" @click="refresh">
  <VIcon start>mdi-reload</VIcon>
  Refrescar
</VBtn>

<!-- Save: primary -->
<VBtn color="primary" variant="elevated" :loading="saving" @click="save">
  <VIcon start>mdi-content-save</VIcon>
  Guardar
</VBtn>
```

### Error / Forbidden Pages

```vue
<!-- Back: secondary -->
<VBtn color="primary" variant="outlined" @click="goBack">Volver</VBtn>

<!-- Redirect to dashboard: primary -->
<VBtn color="primary" variant="elevated" @click="navigateTo('/dashboard')">
  Ir al Dashboard
</VBtn>
```

### Login Page

```vue
<!-- Single primary action -->
<VBtn block size="large" color="primary" variant="elevated" type="submit">
  Ingresar
</VBtn>
```

### Contact / Utility Buttons (Icon-only)

```vue
<!-- All secondary, icon-only with tooltips -->
<VBtn color="green" variant="outlined" icon>
  <VIcon>mdi-whatsapp</VIcon>
</VBtn>
```

---

## Rules

### 1. One Primary Per View

- Only one `elevated` button should be visually dominant per screen/section
- If multiple elevated buttons exist, demote secondary ones to `outlined`

### 2. Cancel Always Outlined

- Dialog cancel buttons: `variant="outlined"`
- Navigation back buttons: `variant="outlined"`
- Never use `elevated` for cancel/back

### 3. Save/Confirm Elevated

- Form submission: `variant="elevated"`
- Destructive confirm (delete): `variant="flat"` with `color="error"`

### 4. Consistency

- Apply the same pattern across all pages and dialogs
- Reference: `dialog_convention.md` for dialog-specific layout

---

## Audit Summary

### Compliant Components

| Component | Status |
|-----------|--------|
| `Role/Dialog.vue` | ✅ |
| `church-member/[id]/index.vue` | ✅ |
| `forbidden.vue` | ✅ |
| `login.vue` | ✅ |
| `error.vue` | ✅ |
| `Auditorium/Dialog.vue` | ✅ |
| `Permission/Dialog.vue` | ✅ |
| `Organization/FormDialog.vue` | ✅ |
| `User/Dialog.vue` | ✅ |
| `User/DialogPassword.vue` | ✅ |
| `Profile/Dialog.vue` | ✅ |
| `Consolidation/Dialog.vue` | ✅ |
| `Consolidation/StatusLogDialog.vue` | ✅ |
| `Consolidation/TrackingLogDialog.vue` | ✅ |
| `Consolidation/MedalDialog.vue` | ✅ |
| `ChurchMember/Dialog.vue` | ✅ |
| `ChurchMember/TrackingLogDialog.vue` | ✅ |
| `ChurchMember/MedalDialog.vue` | ✅ |
| `Testimony/Dialog.vue` | ✅ |
| `Song/PasteDialog.vue` | ✅ |
| `AuditoriumEvent/Dialog.vue` | ✅ |
| `ChurchEvent/CopyDialog.vue` | ✅ |
| `My/UploadimageCrop.vue` | ✅ |
| `My/TimePicker.vue` | ✅ |
| `DialogConfirm.vue` | ✅ |
| `DialogDelete.vue` | ✅ |

### Notes

- `VChip` with `variant="elevated"` is acceptable for status badges and labels (not action buttons)
- `VBtn` with `variant="flat"` + `color="error"` is correct for destructive actions
- Icon-only buttons use `variant="outlined"` as secondary/tertiary actions
