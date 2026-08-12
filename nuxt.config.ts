// https://nuxt.com/docs/api/configuration/nuxt-config
import { execSync } from "node:child_process"
import { es } from "vuetify/locale"

// Short git commit hash (last 7 chars) for the build version. Falls back to
// "nogit" when the build runs outside a git checkout.
function gitShortHash(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim()
  } catch {
    return "nogit"
  }
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { port: 3003 },
  modules: ['vuetify-nuxt-module', '@pinia/nuxt'],
  routeRules: {
    // The Google OAuth callback carries a JWT in the query string; never let
    // that URL leak through the Referer header to any external resource.
    '/auth/google/**': { headers: { 'Referrer-Policy': 'no-referrer' } },
  },
  css: ['@/assets/css/global.css'],
  vuetify: {
    moduleOptions: {
      importComposables: ['useDate', 'useLocale', 'useDefaults', 'useDisplay', 'useRtl', 'useTheme'],
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
      },
      locale: {
        locale: 'es',
        fallback: 'en',
        messages: {
          // Vuetify only loads the built-in "en" locale by default; any other
          // locale must be supplied entirely by the app. Spread the full
          // built-in Spanish messages so all `$vuetify.*` keys resolve, then
          // override the date labels with the app's own Spanish values.
          es: {
            ...es,
            date: {
              months: {
                short: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
              },
              weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
              weekdaysShort: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
            }
          }
        }
      }
    },
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || '',
      suffixUrl: process.env.SUFFIX_URL || ':8001/api',
      version: `${process.env.npm_package_version || '1.0.0'}-${gitShortHash()}`,
      reverbAppKey: process.env.REVERB_APP_KEY || '',
      reverbHost: process.env.REVERB_HOST || '',
      reverbPort: process.env.REVERB_PORT || '6001',
      reverbScheme: process.env.REVERB_SCHEME || 'http',
    },
  },
})
