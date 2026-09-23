import { describe, it, expect } from 'vitest'
import { rowKey, isRowDone, getPreparationRows, allDoneForSale } from '~/utils/kds'

describe('kds helpers', () => {
  it('generates rowKey', () => {
    expect(rowKey(12, 0)).toBe('12-0')
    expect(rowKey(12, 3)).toBe('12-3')
  })

  it('calculates getPreparationRows only for items requiring preparation', () => {
    const sale = {
      id: 1,
      items: [
        { id: 101, quantity: 2, product: { requires_preparation: true } },
        { id: 102, quantity: 1, product: { requires_preparation: false } },
        { id: 103, quantity: 1, product: { requires_preparation: true } },
      ],
    }
    const rows = getPreparationRows(sale)
    expect(rows).toHaveLength(3)
    expect(rows[0]).toEqual({ item: sale.items[0], rowIndex: 0 })
    expect(rows[1]).toEqual({ item: sale.items[0], rowIndex: 1 })
    expect(rows[2]).toEqual({ item: sale.items[2], rowIndex: 0 })
  })

  it('determines isRowDone correctly from server fallback and doneMap overrides', () => {
    const sale = {
      id: 1,
      items: [{ id: 101, quantity: 2, completed_quantity: 1, product: { requires_preparation: true } }],
    }

    // Server fallback: completed_quantity = 1, so rowIndex 0 is done, rowIndex 1 is not
    expect(isRowDone(undefined, sale, 101, 0)).toBe(true)
    expect(isRowDone(undefined, sale, 101, 1)).toBe(false)

    // Local doneMap override
    const doneMap = {
      '1': {
        '101-1': true,
      },
    }
    // With local marks on item 101, doneMap is authoritative
    expect(isRowDone(doneMap, sale, 101, 1)).toBe(true)
    expect(isRowDone(doneMap, sale, 101, 0)).toBe(false)
  })

  it('checks allDoneForSale', () => {
    const sale = {
      id: 1,
      items: [{ id: 101, quantity: 1, completed_quantity: 1, product: { requires_preparation: true } }],
    }
    expect(allDoneForSale(undefined, sale)).toBe(true)

    const incompleteSale = {
      id: 2,
      items: [{ id: 102, quantity: 2, completed_quantity: 1, product: { requires_preparation: true } }],
    }
    expect(allDoneForSale(undefined, incompleteSale)).toBe(false)
  })
})
