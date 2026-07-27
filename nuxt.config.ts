// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['vuetify-nuxt-module', '@pinia/nuxt'],
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || '',
      suffixUrl: process.env.SUFFIX_URL || ':8001/api',
    },
  },
})
