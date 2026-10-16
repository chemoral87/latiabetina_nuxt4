import { test, expect, type Page } from '@playwright/test'
import { apiBase, authHeaders, loginOrSkip } from './helpers/auth'

const MIN_RECORDS = 11
const PER_PAGE = 10

function extractId(json: unknown): number | null {
  const j = json as { data?: { data?: { id?: unknown }; id?: unknown }; id?: unknown } | null
  const id = j?.data?.data?.id ?? j?.data?.id ?? j?.id
  return id != null ? Number(id) : null
}

function todayLocal(): string {
  return new Date().toLocaleDateString('en-CA')
}

test.describe.serial('Pagination (10 per page)', () => {
  const createdSheetIds: number[] = []
  const createdMemberIds: number[] = []
  let orgId: number | string | null = null

  test.beforeEach(async ({ page }) => {
    await loginOrSkip(page)
  })

  /** Permission probe: a 401/403 means this account simply cannot exercise the route. */
  async function canAccess(page: Page, path: string): Promise<boolean> {
    const res = await page.request.get(`${apiBase()}${path}`, { headers: await authHeaders(page) })
    return res.status() !== 401 && res.status() !== 403
  }

  async function listCount(page: Page, path: string): Promise<number> {
    const headers = await authHeaders(page)
    const res = await page.request.get(`${apiBase()}${path}`, { headers })
    expect(res.ok(), await res.text()).toBeTruthy()
    const payload = await res.json()
    if (Array.isArray(payload)) return payload.length
    if (payload?.total != null) return Number(payload.total)
    const items = payload?.data
    return Array.isArray(items) ? items.length : 0
  }

  async function listItems(page: Page, path: string): Promise<Record<string, unknown>[]> {
    const headers = await authHeaders(page)
    const res = await page.request.get(`${apiBase()}${path}`, { headers })
    expect(res.ok(), await res.text()).toBeTruthy()
    const payload = await res.json()
    if (Array.isArray(payload)) return payload as Record<string, unknown>[]
    return Array.isArray(payload?.data) ? payload.data : []
  }

  test('seeds 11+ consolidation sheets', async ({ page }) => {
    const headers = await authHeaders(page)
    const orgs = await listItems(page, '/organization')
    expect(orgs.length).toBeGreaterThan(0)
    orgId = orgs[0].id as number | string

    let count = await listCount(page, '/conso-sheet?itemsPerPage=-1')
    const stamp = Date.now()
    let created = 0
    while (count < MIN_RECORDS) {
      const res = await page.request.post(`${apiBase()}/conso-sheet`, {
        headers,
        data: {
          org_id: orgId,
          folio_number: `E2E-PG-${stamp}-${created}`,
          date: todayLocal(),
        },
      })
      expect(res.ok(), await res.text()).toBeTruthy()
      const id = extractId(await res.json())
      expect(id).not.toBeNull()
      createdSheetIds.push(id!)
      count++
      created++
    }
    expect(count).toBeGreaterThanOrEqual(MIN_RECORDS)
    // eslint-disable-next-line no-console
    console.log(`[pagination] consolidation sheets: ${count} (created ${created})`)
  })

  test('seeds 11+ tracking members', async ({ page }) => {
    const headers = await authHeaders(page)
    const base = '/church-member?mine=true&status=ACTIVO&has_phone=true&itemsPerPage=-1'
    let count = await listCount(page, base)
    const stamp = Date.now()
    let created = 0
    while (count < MIN_RECORDS) {
      const res = await page.request.post(`${apiBase()}/church-member`, {
        headers,
        data: {
          org_id: orgId,
          conso_sheet_id: createdSheetIds[0],
          name: `E2E Track ${stamp}-${created}`,
          last_name: 'PgTest',
          cellphone: '5500000000',
          status: 'ACTIVO',
        },
      })
      expect(res.ok(), await res.text()).toBeTruthy()
      const id = extractId(await res.json())
      expect(id).not.toBeNull()
      createdMemberIds.push(id!)
      count++
      created++
    }
    expect(count).toBeGreaterThanOrEqual(MIN_RECORDS)
    // eslint-disable-next-line no-console
    console.log(`[pagination] tracking members: ${count} (created ${created})`)
  })

  async function expectPagination(page: Page, total: number) {
    const footer = page.getByText(new RegExp(`^\\d+-\\d+ de ${total}$`))
    await expect(footer).toHaveText(new RegExp(`^1-${PER_PAGE} de ${total}$`), { timeout: 15_000 })
    await expect(page.getByRole('row')).toHaveCount(PER_PAGE + 1)

    const next = page.getByRole('button', { name: 'Página siguiente' })
    await expect(next).toBeEnabled()
    await Promise.all([page.waitForRequest(r => r.url().includes('page=2') && r.url().includes(`itemsPerPage=${PER_PAGE}`), { timeout: 15_000 }), next.click()])
    await expect(footer).toHaveText(new RegExp(`^${PER_PAGE + 1}-${total} de ${total}$`))
    await expect(page.getByRole('row')).toHaveCount(total - PER_PAGE + 1)

    await page.getByRole('button', { name: 'Primera página' }).click()
    await expect(footer).toHaveText(new RegExp(`^1-${PER_PAGE} de ${total}$`))
  }

  test('paginates /consolidation', async ({ page }) => {
    const total = await listCount(page, '/conso-sheet?itemsPerPage=-1')
    expect(total).toBeGreaterThanOrEqual(MIN_RECORDS)

    await page.goto('/consolidation')
    await page.waitForLoadState('networkidle')
    await expectPagination(page, total)
  })

  test('paginates /tracking', async ({ page }) => {
    const total = await listCount(page, '/church-member?mine=true&status=ACTIVO&has_phone=true&itemsPerPage=-1')
    expect(total).toBeGreaterThanOrEqual(MIN_RECORDS)

    await page.goto('/tracking')
    await page.waitForLoadState('networkidle')
    await expectPagination(page, total)
  })

  test('seeds 11+ tracking logs via capture on /tracking', async ({ page }) => {
    test.setTimeout(120_000)
    test.skip(!(await canAccess(page, '/church-member/tracking-logs?itemsPerPage=1')), 'E2E user lacks church-member-tracking-logs-index')
    const countLogs = () => listCount(page, '/church-member/tracking-logs?itemsPerPage=1')
    let total = await countLogs()
    let captures = 0
    while (total < MIN_RECORDS) {
      await page.goto('/tracking')
      await page.waitForLoadState('networkidle')
      // First row "Ver miembro" — any in-scope member works for capture
      await page.locator('#seg-table-view-btn').first().click()
      await expect(page.locator('#cmm-face-to-face-btn')).toBeVisible({ timeout: 15_000 })
      // presencial posts the log directly (whatsapp/sms/call hijack navigation — avoid)
      await page.locator('#cmm-face-to-face-btn').click()
      await expect.poll(async () => countLogs(), { timeout: 15_000 }).toBeGreaterThan(total)
      total = await countLogs()
      captures++
      expect(captures).toBeLessThanOrEqual(30)
    }
    expect(total).toBeGreaterThanOrEqual(MIN_RECORDS)
    // eslint-disable-next-line no-console
    console.log(`[pagination] tracking logs: ${total} (captured ${captures})`)
  })

  test('paginates /church-member/tracking-logs', async ({ page }) => {
    test.skip(!(await canAccess(page, '/church-member/tracking-logs?itemsPerPage=1')), 'E2E user lacks church-member-tracking-logs-index')
    const total = await listCount(page, '/church-member/tracking-logs?itemsPerPage=1')
    expect(total).toBeGreaterThanOrEqual(MIN_RECORDS)

    await page.goto('/church-member/tracking-logs')
    await page.waitForLoadState('networkidle')
    test.skip(page.url().includes('/forbidden'), 'E2E user lacks church-member-tracking-logs-index')
    await expectPagination(page, total)
  })

  test('cleans up seeded data', async ({ page }) => {
    // ponytail: best-effort cleanup — orphan logs/members acceptable in dev DB
    const headers = await authHeaders(page)
    const results = await Promise.allSettled([
      ...createdMemberIds.map(id => page.request.delete(`${apiBase()}/church-member/${id}`, { headers })),
      ...createdSheetIds.map(id => page.request.delete(`${apiBase()}/conso-sheet/${id}`, { headers })),
    ])
    const failed = results.filter(r => r.status === 'rejected' || !(r.value as { ok(): boolean }).ok())
    // eslint-disable-next-line no-console
    console.log(`[pagination] cleanup: ${results.length - failed.length}/${results.length} deleted`)
  })
})
