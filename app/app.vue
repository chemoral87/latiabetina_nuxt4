<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Marks the app as "navigating" as soon as it boots (covers F5 / direct URL load),
// so the initial data fetch inside a page's top-level await gets counted by
// useGlobalProgress the same way client-side route navigations already are.
if (import.meta.client) {
  useGlobalProgress().beginNavigation()
}

// ---- Accessibility: text scale ----
// The store owns the value (useAccessibilityStore). This block is what makes it
// global: `--app-font-scale` on <html> is picked up by
// assets/css/global.css -> html { font-size: calc(16px * var(--app-font-scale)) },
// and every Vuetify type size is in rem, so the whole UI follows.
const accessibility = useAccessibilityStore()

// Cookie mirror so the server can render the right size in the first HTML byte
// (a localStorage-only value would flash the default size before hydration).
const fontScaleCookie = useCookie<number>(FONT_SCALE_COOKIE, {
  default: () => 1,
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
})

accessibility.hydrate(fontScaleCookie.value)

useHead(() => ({
  htmlAttrs: { style: accessibility.rootFontScaleStyle },
}))

if (import.meta.client) {
  // localStorage is the newer copy, so it overrides the cookie seed once mounted.
  onMounted(() => accessibility.loadFromStorage())

  // Keep the cookie in step with every change (select in /account, other pages later).
  watch(
    () => accessibility.fontScale,
    (value) => {
      fontScaleCookie.value = value
    },
  )
}
</script>
