// Momentary row highlight for tables after a successful create/update.
// The id is cleared (then re-set on the next tick) so the CSS animation
// re-triggers even when the same row is edited twice in a row. Pair with the
// `highlightId` prop + `rowProps` on VDataTableServer (see migration guide).
export function useRowHighlight() {
  const highlightId = ref<number | null>(null)
  let highlightTimer: ReturnType<typeof setTimeout> | null = null

  function flash(id: number) {
    highlightId.value = null
    nextTick(() => {
      highlightId.value = id
    })
    if (highlightTimer) clearTimeout(highlightTimer)
    // Slightly longer than the 1.4s CSS animation — class removal is hygiene only
    highlightTimer = setTimeout(() => {
      highlightId.value = null
    }, 1600)
  }

  onUnmounted(() => {
    if (highlightTimer) clearTimeout(highlightTimer)
  })

  return { highlightId, flash }
}
