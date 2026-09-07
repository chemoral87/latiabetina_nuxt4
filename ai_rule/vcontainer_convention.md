# VContainer Convention

**Every page** must use `VContainer` with `:fluid="true"`.

The `pa-1` padding is applied **globally** via `app/assets/css/global.css` — do not add `class="pa-1"` on individual pages.

## Standard

```vue
<VContainer :fluid="true">
  ...
</VContainer>
```

- `:fluid="true"` — full-width container (use the binding, not the bare `fluid` prop, for SSR hydration safety)
- `pa-1` padding is global — never add it to VContainer class

## Do Not

- Do not use bare `fluid` — always use `:fluid="true"`
- Do not add `class="pa-1"` — it is applied globally in `app/assets/css/global.css`
- Do not remove the root `VContainer` — it is required for proper layout
