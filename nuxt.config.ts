// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { port: 3003 },
  modules: ['vuetify-nuxt-module', '@pinia/nuxt'],
  vuetify: {
    moduleOptions: {
      importComposables: ['useDate', 'useLocale', 'useDefaults', 'useDisplay', 'useRtl', 'useTheme'],
    },
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || '',
      suffixUrl: process.env.SUFFIX_URL || ':8001/api',
    },
  },
})
