import { describe, it, expect } from 'vitest'
import { buildApiParams } from '~/utils/buildApiParams'

describe('buildApiParams', () => {
  it('defaults page to 1 and itemsPerPage to 10', () => {
    const params = buildApiParams({})
    expect(params).toEqual({ page: 1, itemsPerPage: 10 })
  })

  it('preserves custom page and itemsPerPage', () => {
    const params = buildApiParams({ page: 3, itemsPerPage: 25 })
    expect(params.page).toBe(3)
    expect(params.itemsPerPage).toBe(25)
  })

  it('maps sortBy and sortDesc correctly for single sort key', () => {
    const paramsAsc = buildApiParams({ sortBy: [{ key: 'name', order: 'asc' }] })
    expect(paramsAsc.sortBy).toEqual(['name'])
    expect(paramsAsc.sortDesc).toEqual(['false'])

    const paramsDesc = buildApiParams({ sortBy: [{ key: 'created_at', order: 'desc' }] })
    expect(paramsDesc.sortBy).toEqual(['created_at'])
    expect(paramsDesc.sortDesc).toEqual(['true'])
  })

  it('passes through custom filter parameters', () => {
    const params = buildApiParams({
      filter: 'john',
      org_id: 5,
      status: 'active',
    })
    expect(params.filter).toBe('john')
    expect(params.org_id).toBe(5)
    expect(params.status).toBe('active')
  })

  it('ignores undefined, null, and empty string filters', () => {
    const params = buildApiParams({
      filter: '',
      org_id: null,
      custom_field: undefined,
      valid_num: 0,
      valid_bool: false,
    })
    expect(params).not.toHaveProperty('filter')
    expect(params).not.toHaveProperty('org_id')
    expect(params).not.toHaveProperty('custom_field')
    expect(params.valid_num).toBe(0)
    expect(params.valid_bool).toBe(false)
  })

  it('filters out internal and event-related blocked keys', () => {
    const params = buildApiParams({
      isTrusted: true,
      _vts: 12345,
      stopImmediatePropagation: () => {},
      search: 'query',
    })
    expect(params).not.toHaveProperty('isTrusted')
    expect(params).not.toHaveProperty('_vts')
    expect(params).not.toHaveProperty('stopImmediatePropagation')
    expect(params.search).toBe('query')
  })
})
