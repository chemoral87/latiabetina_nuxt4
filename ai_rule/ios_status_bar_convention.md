# iOS Status Bar / theme-color Convention

> **Goal:** the fixed app bar's color must appear to extend under the iOS
> notch/Dynamic Island in Safari, and the page must never clip content behind
> the notch or the home-indicator area. This depends on three pieces staying
> in sync — do not change one without the others.

## The three pieces

1. **`nuxt.config.ts` → `app.head.meta`**
   - `viewport-fit=cover` on the viewport meta tag — lets the page paint
     under the safe areas instead of leaving that strip to the browser's
     default background.
   - A static fallback `theme-color` (`#E8EAF6`, matching the default
     app-bar color `blue-lighten-5`) for the pre-hydration paint.

2. **`app/layouts/default.vue`**
   - `useHead(() => ({ meta: [{ name: "theme-color", content: pageBg.value || "#E8EAF6" }] }))`
     keeps Safari's status-bar tint in sync with whatever `route.meta.color`
     the current page uses (via the existing `pageBg` computed — the same
     hex map that drives the app-bar/page background).
   - **When adding a new `route.meta.color` value**, add its hex to the
     `colors` map inside `pageBg` in this file — `theme-color` and the page
     background derive from the same map, so a missing entry means the
     status bar silently falls back to the default instead of matching the
     new page.

3. **`app/assets/css/global.css`**
   - `#lay-app-bar { padding-top: env(safe-area-inset-top, 0px) !important; }`
     — keeps the app bar's content clear of the notch now that the page
     extends under it.
   - `.snackbar-wrapper { padding-bottom: env(safe-area-inset-bottom, 0px); }`
     — keeps snackbars clear of the home-indicator area.
   - `html, body { background-color: #E8EAF6; }` — avoids a mismatched flash
     in that strip before Vue hydrates and `pageBg` takes over.

## Known limitation — do not "fix" this

**Chrome for iOS does not support the `theme-color` meta tag at all** (long-
standing WebKit-wrapper limitation, not a bug in this app). After the above,
Safari's status bar will match the app bar seamlessly; Chrome's will still
show its own system color above the app bar. This is expected and is not
solvable at the page level — only shipping a PWA (`manifest.json` +
"Add to Home Screen", `display: "standalone"`) removes browser chrome
entirely and gets true parity between browsers. Do not spend time chasing
Chrome-iOS `theme-color` support or file it as a bug in this app.

## Do Not

- Do not remove `viewport-fit=cover` from `nuxt.config.ts` — doing so also
  silently breaks the safe-area padding in `global.css` (the `env()` values
  resolve to 0 without it), reintroducing content clipping under the notch.
- Do not hardcode a single static `theme-color` in `nuxt.config.ts` as the
  *only* source — it must stay paired with the dynamic `useHead` call in
  `layouts/default.vue`, or per-route app-bar colors will desync from the
  status bar tint.
- Do not add a new `route.meta.color` value without adding its hex to the
  `pageBg` map in `layouts/default.vue` — an unmapped color falls back to
  `#E8EAF6` for both the page background and `theme-color`.
- Do not try to make Chrome for iOS match Safari's status-bar tint — it
  isn't possible short of shipping a PWA (see above).
