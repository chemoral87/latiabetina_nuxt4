/**
 * Debounced two-ref filter sync — shared extraction for
 * `watch(filterInput -> filterX)` 300ms pattern seen in
 * `app/pages/consolidation/index.vue:105`, `role/index.vue:109`,
 * `auditorium/index.vue:123`, `organization/index.vue`, `user/index.vue`, etc.
 * `ai_rule/index_page_table_pattern.md` — single source, no per-page duplication.
 *
 * Usage:
 *   const filterInput = ref("")
 *   const filterRole = ref("")
 *   useDebouncedFilter(filterInput, filterRole) // 300ms, clear immediate
 *
 * Or for pages that own both refs:
 *   const { filterInput, filter } = useFilterInput(300)
 */
export function useDebouncedFilter(
  source: Ref<string>,
  target: Ref<string>,
  delay = 300,
) {
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(source, (val) => {
    if (timer) clearTimeout(timer)
    if (!val) {
      target.value = ""
      return
    }
    timer = setTimeout(() => {
      target.value = val
    }, delay)
  })

  // cleanup on unmount — avoids stray timer after navigation
  if (typeof onUnmounted !== "undefined") {
    try {
      onUnmounted(() => {
        if (timer) clearTimeout(timer)
      })
    } catch {
      // outside setup context (e.g. unit test) — ignore
    }
  }
}

/**
 * Convenience — creates both refs and wires the debounce.
 * Returns `{ filterInput, filter }` so the template can bind `v-model="filterInput"`
 * and the table/loader consumes `filter`.
 */
export function useFilterInput(delay = 300) {
  const filterInput = ref("")
  const filter = ref("")
  useDebouncedFilter(filterInput, filter, delay)
  return { filterInput, filter }
}
