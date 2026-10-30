import { acceptHMRUpdate, defineStore } from 'pinia'

/**
 * Global accessibility preferences. Currently only the text scale.
 *
 * Same shape as the other Pinia stores in this folder (usePitcherStore): a
 * setup store plus localStorage persistence, because this setting has to
 * survive a reload — otherwise the user re-picks their size every session.
 *
 * How the scale reaches the DOM: the store owns the number, app.vue mirrors it
 * into `<html style="--app-font-scale: …">`, and assets/css/global.css turns
 * that into `html { font-size: calc(16px * var(--app-font-scale, 1)) }`.
 * Every Vuetify font size is expressed in rem, so the whole UI's type scales
 * from one value (measured: Vuetify ships 2 px font-size declarations vs
 * dozens of rem ones).
 */
const STORAGE_KEY = 'accessibility_v1'

/**
 * Cookie mirror of the setting. Pinia state is per-request on the server, so a
 * localStorage-only value would render the default size for the first paint and
 * then jump after hydration. The cookie lets SSR emit the right `--app-font-scale`
 * in the first HTML byte.
 */
export const FONT_SCALE_COOKIE = 'font-scale'

export interface FontScaleOption {
  title: string
  value: number
}

/** Only these three steps are ever applied. */
export const FONT_SCALE_OPTIONS: FontScaleOption[] = [
  { title: 'Pequeña (0.85×)', value: 0.85 },
  { title: 'Normal (1×)', value: 1 },
  { title: 'Grande (1.3×)', value: 1.3 },
]

const DEFAULT_FONT_SCALE = 1

/** Snaps anything (corrupt storage, tampered cookie) to a supported step. */
function normaliseFontScale(value: unknown): number {
  const scale = Number(value)
  return FONT_SCALE_OPTIONS.some(option => option.value === scale) ? scale : DEFAULT_FONT_SCALE
}

export const useAccessibilityStore = defineStore('accessibility', () => {
  const fontScale = ref(DEFAULT_FONT_SCALE)

  /** Full CSS declaration for the root element; see app.vue. */
  const rootFontScaleStyle = computed(() => `--app-font-scale:${fontScale.value}`)

  /** True when the user is not on the default size (used to label the control). */
  const isCustomFontScale = computed(() => fontScale.value !== DEFAULT_FONT_SCALE)

  function setFontScale(value: unknown) {
    fontScale.value = normaliseFontScale(value)
    persist()
  }

  /**
   * Seeds the value without persisting. Called from app.vue with the cookie on
   * both server and client so SSR and hydration agree.
   */
  function hydrate(value: unknown) {
    fontScale.value = normaliseFontScale(value)
  }

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontScale: fontScale.value }))
    } catch {
      // Private mode / quota exceeded: the size still applies for this session.
    }
  }

  /**
   * Client boot: localStorage wins over the SSR cookie seed because it is the
   * newer copy (it is written by every setFontScale call).
   */
  function loadFromStorage() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      hydrate(JSON.parse(raw)?.fontScale)
    } catch {
      // Corrupt payload — keep the cookie/default value.
    }
  }

  return {
    fontScale,
    rootFontScaleStyle,
    isCustomFontScale,
    setFontScale,
    hydrate,
    loadFromStorage,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAccessibilityStore, import.meta.hot))
}
