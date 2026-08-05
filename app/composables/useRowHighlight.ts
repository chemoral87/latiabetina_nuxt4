// Momentary row highlight for tables after a successful create/update.
// The id is cleared (then re-set on the next tick) so the CSS animation
// re-triggers even when the same row is edited twice in a row. Pair with the
// `highlightId` prop + `rowPropsFor()` factory on VDataTableServer
// (see migration guide).

// Highlight flash CSS duration (global.css, .row-highlight td).
export const ROW_HIGHLIGHT_ANIMATION_MS = 1400;
// Row remove collapse CSS duration (global.css, .row-removing td). Must stay
// in sync with --row-remove-animation-ms in global.css (default 1000ms).
export const ROW_REMOVE_ANIMATION_MS = 1000;
// How long to keep highlightId after the CSS animation ends (hygiene only).
export const ROW_HIGHLIGHT_CLEAR_MS = 4000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useRowHighlight() {
  const highlightId = ref<number | null>(null);
  const removingId = ref<number | string | null>(null);
  let highlightTimer: ReturnType<typeof setTimeout> | null = null;

  function flash(id: number) {
    highlightId.value = null;
    nextTick(() => {
      highlightId.value = id;
    });
    if (highlightTimer) clearTimeout(highlightTimer);
    // Slightly longer than the CSS animation — class removal is hygiene only
    highlightTimer = setTimeout(() => {
      highlightId.value = null;
    }, ROW_HIGHLIGHT_CLEAR_MS);
  }

  /**
   * Prepend a newly created record to the top of the table data, bump the
   * total count, and flash the new row. Call after a successful create,
   * passing the same `response` ref that is fed to the table component.
   */
  function prependCreated(
    response: Ref<{ data?: unknown[]; total?: number }>,
    created: Record<string, unknown>,
  ) {
    if (!response.value.data) {
      response.value.data = [];
    }
    response.value.data.unshift(created);
    response.value.total = (response.value.total ?? 0) + 1;
    const createdId = created.id;
    if (createdId != null) {
      flash(createdId as number);
    }
  }

  /**
   * Replace the matching row (by id) in the table data with the
   * server-returned updated record, then flash the row. Call after a
   * successful update. If the row isn't in the current data (e.g. filtered
   * out or on another page), it's a harmless no-op — the flash simply won't
   * match any rendered row.
   */
  function updateRow(
    response: Ref<{ data?: unknown[]; total?: number }>,
    updated: Record<string, unknown>,
  ) {
    if (response.value.data) {
      const idx = response.value.data.findIndex(
        (r) => (r as Record<string, unknown>)?.id === updated.id,
      );
      if (idx !== -1) {
        response.value.data[idx] = updated;
      }
    }
    const updatedId = updated.id;
    if (updatedId != null) {
      flash(updatedId as number);
    }
  }

  function beginRemove(id: number | string | null | undefined) {
    removingId.value = id ?? null;
  }

  function endRemove() {
    removingId.value = null;
  }

  /**
   * Mark the row as `row-removing` (light red tint), animate its real height
   * down to 0 so the rows below slide up into its place (tables don't animate
   * `height` via CSS — we drive it in JS by measuring the `<tr>`), then drop
   * the row from the table data and decrement the total.
   */
  async function removeWithAnimation(
    response: Ref<{ data?: unknown[]; total?: number }>,
    id: number | string,
  ) {
    beginRemove(id);
    await collapseRow(id);
    if (response.value.data) {
      const idx = response.value.data.findIndex(
        (r) => (r as Record<string, unknown>)?.id === id,
      );
      if (idx !== -1) {
        response.value.data.splice(idx, 1);
        response.value.total = Math.max(0, (response.value.total ?? 0) - 1);
      }
    }
    endRemove();
  }

  /**
   * Collapse the actual `<tr>` for `id` from its rendered height to 0 using an
   * inline height transition (CSS cell-height animations don't work in table
   * layout). Falls back to a simple wait when the row can't be found.
   */
  async function collapseRowHeight(id: number | string) {
    const row = findRow(id);
    if (!row) {
      await sleep(ROW_REMOVE_ANIMATION_MS);
      return;
    }
    const start = row.getBoundingClientRect().height;
    row.style.height = `${start}px`;
    row.style.overflow = "hidden";
    row.style.background = "rgba(var(--v-theme-error), 0.25)";
    row.style.transition = `height ${ROW_REMOVE_ANIMATION_MS}ms ease-in, padding-top ${ROW_REMOVE_ANIMATION_MS}ms ease-in, padding-bottom ${ROW_REMOVE_ANIMATION_MS}ms ease-in, opacity ${ROW_REMOVE_ANIMATION_MS}ms ease-in`;
    // Force a reflow so the transition from the measured height is applied.
    void row.offsetHeight;
    row.style.height = "0px";
    row.style.paddingTop = "0px";
    row.style.paddingBottom = "0px";
    row.style.opacity = "0";
    await sleep(ROW_REMOVE_ANIMATION_MS);
  }

  onUnmounted(() => {
    if (highlightTimer) clearTimeout(highlightTimer);
  });

  return {
    highlightId,
    flash,
    prependCreated,
    updateRow,
    removingId,
    beginRemove,
    endRemove,
    removeWithAnimation,
  };
}

/**
 * Factory for the table-side `row-props` functi