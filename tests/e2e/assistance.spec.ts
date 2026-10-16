/**
 * Assistance E2E tests
 *
 * Instructions:
 * 1. Set E2E_EMAIL and E2E_PASSWORD in .env.test (or export them)
 * 2. Start dev server: npm run dev (localhost:3003)
 * 3. Run tests: npm run test:e2e
 *
 * Tests create/edit/delete assistance records via API and verify UI display.
 */
import { test, expect } from '@playwright/test'
import { apiBase, authHeaders, loginOrSkip, permittedOrgFor } from './helpers/auth'

test.describe.serial('Assistance', () => {
  let createdId: number
  let uniqueNote: string
  let canIndex = false
  let canDelete = false

  test.beforeEach(async ({ page }) => {
    await loginOrSkip(page)
  })

  test('logs in as admin', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('verifies assistance permissions', async ({ page }) => {
    await page.goto('/account')
    await page.waitForLoadState('networkidle')
    const account = page.locator('#acc-permissions-card')
    await expect(account).toBeVisible()
    canIndex = await account.getByText('assistance-index', { exact: true }).isVisible()
    test.skip(!canIndex, 'Account lacks assistance-index permission')
    canDelete = await account.getByText('assistance-delete', { exact: true }).isVisible()
  })

  test('opens assistance list', async ({ page }) => {
    test.skip(!canIndex, 'Account lacks assistance-index permission')
    await page.goto('/assistance')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#ass-refresh-btn')).toBeVisible()
    await expect(page.locator('#ass-index-filter')).toBeVisible()
    await expect(page.locator('#ass-table-items-dt-1')).toBeVisible()
  })

  test('shows permitted actions', async ({ page }) => {
    test.skip(!canIndex, 'Account lacks assistance-index permission')
    await page.goto('/assistance')
    await page.waitForLoadState('networkidle')
    const canCreate = await page
      .locator('#ass-new-btn')
      .isVisible()
      .catch(() => false)
    const canBulk = await page
      .locator('#ass-bulk-btn')
      .isVisible()
      .catch(() => false)
    expect(canCreate || canBulk || (await page.locator('#ass-refresh-btn').isVisible())).toBeTruthy()
  })

  test('creates an assistance record', async ({ page }) => {
    test.skip(!canIndex, 'Account lacks assistance-index permission')
    const headers = await authHeaders(page)

    // The list is scoped to the account's permitted orgs, so the record has to
    // be written to an org holding both assistance-create and assistance-index.
    const orgId = await permittedOrgFor(page, 'assistance-create', 'assistance-index')
    expect(orgId, 'Account has no org with assistance-create + assistance-index').toBeTruthy()

    const now = new Date()
    const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
    uniqueNote = `E2E-${Date.now()}`

    const payload = {
      org_id: orgId,
      assistance_date: localToday,
      service_time: '09:45',
      adults: 10,
      teens: 5,
      kids: 3,
      babies: 2,
      newcomers: 1,
      notes: uniqueNote,
    }

    const createdResponse = await page.request.post(`${apiBase()}/assistance`, { data: payload, headers })
    expect(createdResponse.ok(), await createdResponse.text()).toBeTruthy()
    const created = (await createdResponse.json()).data
    expect(created).toBeTruthy()
    createdId = created.id

    await page.goto('/assistance')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('row').filter({ hasText: uniqueNote })).toHaveCount(1, { timeout: 15_000 })
  })

  test('edits the assistance record', async ({ page }) => {
    test.skip(!canIndex, 'Account lacks assistance-index permission')
    const headers = await authHeaders(page)

    const now = new Date()
    const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
    const edited = {
      assistance_date: localToday,
      service_time: '09:45',
      adults: 15,
      teens: 5,
      kids: 3,
      babies: 2,
    }
    const updatedResponse = await page.request.put(`${apiBase()}/assistance/${createdId}`, { data: edited, headers })
    expect(updatedResponse.ok(), await updatedResponse.text()).toBeTruthy()

    await page.goto('/assistance')
    await page.waitForLoadState('networkidle')
    const row = page.getByRole('row').filter({ hasText: uniqueNote })
    await expect(row).toHaveCount(1)
    await expect(row).toContainText('15')
  })

  test('deletes the assistance record', async ({ page }) => {
    test.skip(!canIndex, 'Account lacks assistance-index permission')
    test.skip(!canDelete, 'Account lacks assistance-delete permission')

    const headers = await authHeaders(page)

    const deletedResponse = await page.request.delete(`${apiBase()}/assistance/${createdId}`, { headers })
    expect(deletedResponse.ok(), await deletedResponse.text()).toBeTruthy()

    await page.goto('/assistance')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('row').filter({ hasText: uniqueNote })).toHaveCount(0, { timeout: 15_000 })
  })
})
