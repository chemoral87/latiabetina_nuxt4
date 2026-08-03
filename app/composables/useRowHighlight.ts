// Momentary row highlight for tables after a successful create/update.
// The id is cleared (then re-set on the next tick) so the CSS animation
// re-triggers even when the same row is edited twice in a row. Pair with the
// `highlightId` prop + `rowPropsFor()` factory on VDataTableServer
// (see migration guide).
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

/**
 * Factory for the table-side `row-props` function. Takes the highlight id as a
 * ref, getter, or plain value so the returned function reads the *current*
 * value on every Vuetify row render (a plain value captured at setup time
 * would not be reactive). Returns attrs to merge onto each `<tr>`:
 * `{ class: 'row-highlight' }` for the highlighted row, `{ class: undefined }`
 * otherwise.
 */
export function rowPropsFor(highlightId: MaybeRefOrGetter<number | null | undefined>) {
  return (data: { item: unknown }): Record<string, unknown> => {
    const id = (data.item as Record<string, unknown>)?.id
    const target = toValue(highlightId)
    return {
      class: target != null && id === target ? 'row-highlight' : undefined,
    }
  }
}
