// Momentary row highlight for tables after a successful create/update.
// The id is cleared (then re-set on the next tick) so the CSS animation
// re-triggers even when the same row is edited twice in a row. Pair with the
// `highlightId` prop + `rowPropsFor()` factory on VDataTableServer
// (see migration guide).

// Highlight flash CSS duration (global.css, .row-highlight td).
export const ROW_HIGHLIGHT_ANIMATION_MS = 4000;
// Row remove collapse duration (ms). Used by removeWithAnimation to drive the
// JS height-collapse of the <td> cells so the rows below slide up.
export const ROW_REMOVE_ANIMATION_MS = 4000;
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
    await collapseRowHeight(id);
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
   * Collapse the actual rendered row for `id` down to 0. A table row's height
   * is driven by its `<td>` cells — setting `height` on the `<tr>` is ignored
   * by the auto table layout — so we measure a cell, then transition all cells
   * to zero height/padding/opacity. The rows below then slide up as the cells
   * shrink. Falls back to a simple wait when the row can't be found.
   */
  async function collapseRowHeight(id: number | string) {
    const row = findRow(id);
    if (!row) {
      await sleep(ROW_REMOVE_ANIMATION_MS);
      return;
    }
    const cells = Array.from(row.querySelectorAll<HTMLElement>("td"));
    if (cells.length === 0) {
      await sleep(ROW_REMOVE_ANIMATION_MS);
      return;
    }
    const start = Math.max(...cells.map((c) => c.getBoundingClientRect().height));
    const ms = ROW_REMOVE_ANIMATION_MS;
    const transition =
      `height ${ms}ms ease-in, ` +
      `padding-top ${ms}ms ease-in, padding-bottom ${ms}ms ease-in, ` +
      `line-height ${ms}ms ease-in, opacity ${ms}ms ease-in`;
    for (const cell of cells) {
      cell.style.height = `${start}px`;
      cell.style.overflow = "hidden";
      cell.style.transition = transition;
    }
    row.style.background = "rgba(var(--v-theme-error), 0.25)";
    // Force a reflow so the transition from the measured height is applied.
    void row.offsetHeight;
    for (const cell of cells) {
      cell.style.height = "0px";
      cell.style.paddingTop = "0px";
      cell.style.paddingBottom = "0px";
      cell.style.lineHeight = "0px";
      cell.style.opacity = "0";
    }
    await sleep(ms);
  }

  /** Find the rendered table row for an id (added by rowPropsFor as
   *  `data-row-id`). Returns the element or null (e.g. during SSR). */
  function findRow(id: number | string): HTMLElement | null {
    if (import.meta.server) return null;
    return document.querySelector<HTMLElement>(`tr[data-row-id="${id}"]`);
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
 * Factory for the table-side `row-props` function. Takes the highlight id as a
 * ref, getter, or plain value so the returned function reads the *current*
 * value on every Vuetify row render (a plain value captured at setup time
 * would not be reactive). Returns attrs to merge onto each `<tr>`:
 * `{ class: 'row-highlight' }` for the highlighted row, `{ class: 'row-removing' }`
 * for a row being deleted (see `useRowHighlight`), or `{ class: undefined }`.
 */
export function rowPropsFor(
  highlightId: MaybeRefOrGetter<number | null | undefined>,
  removingId?: MaybeRefOrGetter<number | string | null | undefined>,
) {
  return (data: { item: unknown }): Record<string, unknown> => {
    const id = (data.item as Record<string, unknown>)?.id;
    const classes: string[] = [];
    const highlightTarget = toValue(highlightId);
    if (highlightTarget != null && id === highlightTarget) {
      classes.push("row-highlight");
    }
    let removeTarget: number | string | null | undefined;
    if (removingId) {
      removeTarget = toValue(removingId);
      if (removeTarget != null && id === removeTarget) {
        classes.push("row-removing");
      }
    }
    if (id == null) {
      return { class: classes.length > 0 ? classes.join(" ") : undefined };
    }
    // data-row-id falls through to the rendered <tr> (VDataTableRow inherits
    // attrs on its root) so removeWithAnimation can measure+collapse the row.
    return {
      class: classes.length > 0 ? classes.join(" ") : undefined,
      "data-row-id": String(id),
    };
  };
}
