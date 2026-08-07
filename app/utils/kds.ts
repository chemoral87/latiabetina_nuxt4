/**
 * Shared KDS row-state helpers.
 *
 * Each preparation item renders as `quantity` rows (rowIndex 0..quantity-1).
 * doneMap (`{ saleId: { "itemId-rowIndex": boolean } }`) is the per-session
 * source of truth for which exact rows were toggled. Once the user marks ANY
 * row of an item locally, doneMap governs all rows of that item, so rows can
 * be toggled in any order. Items with no local marks fall back to the server's
 * completed_quantity count (done units rendered top-down).
 */

export interface KdsPrepItem {
  id: number
  quantity: number
  completed_quantity?: number
  product?: { requires_preparation?: boolean }
}

export interface KdsOrderLike {
  id: number
  items?: KdsPrepItem[]
}

export function rowKey(itemId: number, rowIndex: number): string {
  return `${itemId}-${rowIndex}`
}

export function isRowDone(
  doneMap: Record<string, Record<string, boolean>> | undefined,
  sale: KdsOrderLike,
  itemId: number,
  rowIndex: number,
): boolean {
  const map = doneMap?.[sale.id] ?? {}
  const key = rowKey(itemId, rowIndex)
  if (key in map) return !!map[key]

  // Any local mark on this item makes doneMap authoritative for all its rows,
  // so an unmarked row stays pending even if completed_quantity advanced
  // (e.g. marking row 1 of a qty-2 item must not mark row 0 too).
  const itemPrefix = `${itemId}-`
  const hasLocalMarks = Object.keys(map).some((k) => k.startsWith(itemPrefix))
  if (hasLocalMarks) return false

  const item = sale.items?.find((i) => i.id === itemId)
  return (item?.completed_quantity ?? 0) > rowIndex
}

export function getPreparationRows(sale: KdsOrderLike): { item: KdsPrepItem; rowIndex: number }[] {
  const rows: { item: KdsPrepItem; rowIndex: number }[] = []
  const items = sale.items?.filter((i) => i.product?.requires_preparation === true) || []
  items.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      rows.push({ item, rowIndex: i })
    }
  })
  return rows
}

export function allDoneForSale(
  doneMap: Record<string, Record<string, boolean>> | undefined,
  sale: KdsOrderLike,
): boolean {
  const rows = getPreparationRows(sale)
  return rows.length > 0 && rows.every((r) => isRowDone(doneMap, sale, r.item.id, r.rowIndex))
}
