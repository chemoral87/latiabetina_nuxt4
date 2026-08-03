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

  /**
   * Prepend a newly created record to the top of the table data, bump the
   * total count, and flash the new row. Call after a successful create,
   * passing the same `response` ref that is fed to the table component.
   */
  function prependCreated(response: Ref<{ data?: unknown[]; total?: number }>, created: Record<string, unknown>) {
    if (!response.value.data) {
      response.value.data = []
    }
    response.value.data.unshift(created)
    response.value.total = (response.value.total ?? 0) + 1
    const createdId = created.id
    if (createdId != null) {
      flash(createdId as number)
    }
  }

  /**
   * Replace the matching row (by id) in the table data with the
   * server-returned updated record, then flash the row. Call after a
   * successful update. If the row isn't in the current data (e.g. filtered
   * out or on another page), it's a harmless no-op — the flash simply won't
   * match any rendered row.
   */
  function updateRow(response: Ref<{ data?: unknown[]; total?: number }>, updated: Record<string, unknown>) {
    if (response.value.data) {
      const idx = response.value.data.findIndex((r) => (r as Record<string, unknown>)?.id === updated.id)
      if (idx !== -1) {
        response.value.data[idx] = updated
      }
    }
    const updatedId = updated.id
    if (updatedId != null) {
      flash(updatedId as number)
    }
  }

  onUnmounted(() => {
    if (highlightTimer) clearTimeout(highlightTimer)
  })

  return { highlightId, flash, prependCreated, updateRow }
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
