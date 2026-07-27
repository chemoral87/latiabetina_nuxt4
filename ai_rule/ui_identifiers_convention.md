# UI Identifiers Convention

## Format

All interactive and structural elements must include an `id` attribute following this pattern:

```
{view}-{component}-{purpose}
```

**Rules:**
- All lowercase kebab-case
- `{view}` = 2-3 letter prefix for the page or layout:
  - `lay` for layout
  - `lgn` for login
  - `idx` for index
  - Additional: `reg` (register), `dsh` (dashboard), `prf` (profile), `set` (settings)
- `{component}` = Vuetify component short name (e.g. `btn`, `text-field`, `card`, `nav-drawer`)
- `{purpose}` = what the element is for (e.g. `email`, `password`, `submit`, `google`)

## Page Identifiers

| Element | id |
|---------|----|
| Card wrapper | `{view}-card` |
| Form | `{view}-form` |
| Text field (email) | `{view}-email` |
| Text field (password) | `{view}-password` |
| Button (submit) | `{view}-submit` |
| Button (Google auth) | `{view}-google-btn` |
| Button (secondary action) | `{view}-{action}-btn` |
| Link | `{view}-{target}-link` |

## Layout Identifiers

| Element | id |
|---------|----|
| Navigation drawer | `lay-nav-drawer` |
| App bar | `lay-app-bar` |
| App bar nav icon (hamburger) | `lay-nav-icon` |
| Toolbar title | `lay-title` |
| Action button | `lay-{action}-btn` |

## Examples

### Page (login)

```html
<VCard id="lgn-card">
  <VForm id="lgn-form">
    <VTextField id="lgn-email" />
    <VTextField id="lgn-password" />
    <VBtn id="lgn-submit" />
    <VBtn id="lgn-google-btn" />
  </VForm>
</VCard>
```

### Layout (default)

```html
<VNavigationDrawer id="lay-nav-drawer">
<VAppBar id="lay-app-bar">
  <VAppBarNavIcon id="lay-nav-icon" />
  <VToolbarTitle id="lay-title" />
  <VBtn id="lay-login-btn" />
</VAppBar>
```
