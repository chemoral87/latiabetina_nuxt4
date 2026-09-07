# Accessibility Rules

## Native Form Inputs

Every native `<input>`, `<textarea>`, and `<select>` element **must** have:

1. An `id` attribute
2. An accessible name via one of:
   - A `<label for="...">` element referencing the input's `id`
   - An `aria-label` attribute (for hidden or unlabeled inputs)
   - An `aria-labelledby` attribute referencing an existing element id

### Hidden inputs

Hidden inputs (`type="file"` with `display: none`, `type="hidden"`, etc.) must have an `aria-label` describing their purpose:

```vue
<!-- WRONG -->
<input ref="fileInput" type="file" style="display: none" @change="onFileChange" />

<!-- CORRECT -->
<input ref="fileInput" type="file" aria-label="Subir imagen" style="display: none" @change="onFileChange" />
```

### Visible inputs without a wrapping label

Inputs that are not wrapped by a `<label>` and have no `for`/`id` pairing must use `aria-label`:

```vue
<!-- WRONG -->
<input v-model="text" placeholder="sílaba" />

<!-- CORRECT -->
<input id="cmp-syllable-text" v-model="text" placeholder="sílaba" aria-label="Sílaba" />
```

## Vuetify Form Controls

### `hide-details` + `aria-labelledby` fix

When using `hide-details` on `VTextField`, `VSelect`, `VAutocomplete`, or `VCombobox`, always provide a `label` prop matching the `placeholder`. Vuetify renders a hidden label element that the `aria-labelledby` attribute references:

```vue
<!-- WRONG — aria-labelledby points to non-existent element -->
<VTextField id="cnsld-index-filter" hide-details placeholder="Filtro" />

<!-- CORRECT -->
<VTextField id="cnsld-index-filter" hide-details placeholder="Filtro" label="Filtro" />
```

### Standalone labels

A `<label>` element without a `for` attribute must wrap the form control it describes. If the label describes a non-standard control (e.g. `VChipGroup`), use `aria-label` or `aria-labelledby` on the control itself:

```vue
<!-- WRONG — label not associated with any control -->
<label>Días de la semana</label>
<VChipGroup>...</VChipGroup>

<!-- CORRECT -->
<VChipGroup aria-label="Días de la semana">...</VChipGroup>
```

## Summary

| Rule | Applies to | Action |
|------|-----------|--------|
| Every `<input>` needs an `id` | All native inputs | Add `id` following `{view}-{purpose}` convention |
| Every `<input>` needs an accessible name | All native inputs | Use `<label for>`, `aria-label`, or `aria-labelledby` |
| Hidden inputs need `aria-label` | `type="file"` (hidden), `type="hidden"` | Add `aria-label` describing purpose |
| `hide-details` needs `label` | `VTextField`, `VSelect`, `VAutocomplete`, `VCombobox` | Add `label` prop matching `placeholder` |
| Standalone `<label>` must associate | Any `<label>` not wrapping a control | Use `for`/`id` pair, or `aria-labelledby` on the control |
