// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { port: 3003 },
  modules: ['vuetify-nuxt-module', '@pinia/nuxt'],
  css: ['@/assets/css/global.css'],
  vuetify: {
    moduleOptions: {
      importComposables: ['useDate', 'useLocale', 'useDefaults', 'useDisplay', 'useRtl', 'useTheme'],
    },
    localeMessages: ['es'],
    locale: {
      locale: 'es',
      fallback: 'en',
    },
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || '',
      suffixUrl: process.env.SUFFIX_URL || ':8001/api',
      reverbAppKey: process.env.REVERB_APP_KEY || '',
      reverbHost: process.env.REVERB_HOST || '',
      reverbPort: process.env.REVERB_PORT || '6001',
      reverbScheme: process.env.REVERB_SCHEME || 'http',
    },
  },
})
