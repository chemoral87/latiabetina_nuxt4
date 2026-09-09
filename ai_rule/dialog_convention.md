# Dialog Convention

> Standard structure for all VDialog-based components.

---

## Template Structure

```vue
<template>
  <VDialog :id="id" persistent max-width="600px" :model-value="true">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-*</VIcon>
        Title text
        <VSpacer />
        <VBtn :id="closeBtnId" icon size="x-small" :disabled="saving" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="pt-0">
        <!-- Form or content here -->
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn :id="cancelBtnId" class="mr-4" color="primary" variant="outlined" :disabled="saving" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn :id="saveBtnId" color="primary" variant="elevated" :loading="saving" :disabled="saving" @click="save">
          <VIcon start>mdi-content-save</VIcon>
          Guardar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>
```

---

## Rules

### 1. VCardTitle

- Class: `text-subtitle-1 font-weight-medium pb-2 d-flex align-center`
- Icon: `<VIcon start size="small" color="primary">` with domain-specific mdi icon
- Close button: `<VBtn icon size="x-small">` aligned right via `<VSpacer />`

### 2. Close Button

- Always `icon` + `size="x-small"`
- `<VIcon>mdi-close</VIcon>` (no explicit size — inherits from button)
- `:disabled="saving"` when async operation is in progress

### 3. Content Area

- Use `<VCardText class="pt-0">` (no extra top padding)
- For compact forms, `<VCardText class="py-1">` is also acceptable

### 4. Bottom Action Buttons

- Container: `<div class="d-flex justify-end px-4 pb-4">`
- Cancel: `variant="outlined"`, `class="mr-4"`, `@click="close"`
- Save: `variant="elevated"`, `:loading="saving"`, `:disabled="saving"`
- Never use `VCardActions` — use plain div with flex utilities

### 5. Single-Button Dialogs

For dialogs with only one action (e.g., "Cerrar"):

```vue
<div class="d-flex justify-end px-4 pb-4">
  <VBtn color="primary" variant="outlined" :disabled="saving" @click="close">
    <VIcon start>mdi-close</VIcon>
    Cerrar
  </VBtn>
</div>
```

### 6. Confirmation Dialogs (DialogConfirm / DialogDelete)

Same pattern but with 2-3 buttons (Cancelar + No/SI, or Cancelar + No guardar + Guardar).

---

## Files Using This Pattern

| Component | Status |
|-----------|--------|
| `Auditorium/Dialog.vue` | ✅ |
| `AuditoriumEvent/Dialog.vue` | ✅ |
| `ChurchEvent/CopyDialog.vue` | ✅ (fixed) |
| `ChurchMember/Dialog.vue` | ✅ |
| `ChurchMember/MedalDialog.vue` | ✅ |
| `ChurchMember/TrackingLogDialog.vue` | ✅ |
| `Consolidation/Dialog.vue` | ✅ |
| `Consolidation/MedalDialog.vue` | ✅ |
| `Consolidation/StatusLogDialog.vue` | ✅ (reference) |
| `Consolidation/TrackingLogDialog.vue` | ✅ |
| `DialogConfirm.vue` | ✅ |
| `DialogDelete.vue` | ✅ |
| `Organization/FormDialog.vue` | ✅ |
| `Permission/Dialog.vue` | ✅ |
| `Profile/Dialog.vue` | ✅ |
| `Role/Dialog.vue` | ✅ |
| `Song/PasteDialog.vue` | ✅ |
| `Testimony/Dialog.vue` | ✅ |
| `User/Dialog.vue` | ✅ |
| `User/DialogPassword.vue` | ✅ |
