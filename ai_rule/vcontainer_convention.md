# VContainer + VSheet Convention

**Every page** must use `VContainer` with `:fluid="true"` and wrap content sections in `VSheet`.

## Standard

```vue
<VContainer :fluid="true">
  <VSheet color="white" rounded>
    <!-- filters + table -->
  </VSheet>
</VContainer>
```

- `:fluid="true"` — full-width container (use the binding, not the bare `fluid` prop, for SSR hydration safety)
- `VSheet color="white" rounded` — white background section with rounded corners; no padding/margin (spacing via VRow/VCol)
- `pa-1` padding is global on VContainer — never add it to VContainer class

## Rules

- Wrap filters and table in `<VSheet color="white" rounded>` for a consistent white section
- Do not add `pa-*` or `ma-*` on VSheet — spacing is handled by the grid (VRow/VCol)
- If a page needs top padding on the VSheet, add a global rule in `app/assets/css/global.css` (e.g. `.page-tracking > .v-sheet { padding-top: 8px !important; }`)

## Do Not

- Do not use bare `fluid` — always use `:fluid="true"`
- Do not add `class="pa-1"` on VContainer — it is applied globally in `app/assets/css/global.css`
- Do not add `pa-*` or `ma-*` on VSheet — keep it clean
- Do not use VCard for page sections — use VSheet instead
- Do not remove the root `VContainer` — it is required for proper layout
