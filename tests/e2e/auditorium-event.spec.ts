import { test, expect } from '@playwright/test'
import { apiBase, authHeaders, loginOrSkip, permittedOrgFor } from './helpers/auth'

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

test.describe.serial('Auditorium event CRUD', () => {
  let canDelete = false
  let orgId: number | undefined
  let auditoriumId: number | undefined
  let seededAuditoriumId: number | undefined
  let eventId: number | undefined
  let eventDate = ''
  let displayedDate = ''

  test.beforeEach(async ({ page }) => {
    await loginOrSkip(page)
  })

  test('logs in as admin', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('verifies permissions', async ({ page }) => {
    await page.goto('/account')
    await page.waitForLoadState('networkidle')
    const account = page.locator('#acc-permissions-card')
    await expect(account).toBeVisible()
    const canCreate = await account.getByText('auditorium-event-create', { exact: true }).isVisible()
    canDelete = await account.getByText('auditorium-event-delete', { exact: true }).isVisible()
    test.skip(!canCreate, 'Account lacks auditorium-event-create permission')

    orgId = await permittedOrgFor(page, 'auditorium-event-create')
    expect(orgId, 'Account has no org with auditorium-event-create').toBeTruthy()
  })

  test('creates an event', async ({ page }) => {
    test.skip(!orgId, 'Permission probe did not run')
    const headers = await authHeaders(page)

    // Lists are scoped to permitted orgs, and auditorium.spec deletes the
    // auditorium it creates — so seed one when the org has none yet.
    const auditoriums = await page.request.get(`${apiBase()}/auditorium?itemsPerPage=15&org_id=${orgId}`, { headers })
    expect(auditoriums.ok(), await auditoriums.text()).toBeTruthy()
    const auditoriumResponse = await auditoriums.json()
    const auditoriumData = Array.isArray(auditoriumResponse) ? auditoriumResponse : (auditoriumResponse.data ?? [])
    let auditorium = auditoriumData[0]
    if (!auditorium) {
      const seeded = await page.request.post(`${apiBase()}/auditorium`, {
        data: { org_id: orgId, name: `E2E Auditorio evento ${Date.now()}` },
        headers,
      })
      expect(seeded.ok(), await seeded.text()).toBeTruthy()
      auditorium = (await seeded.json()).data
      seededAuditoriumId = auditorium.id
    }
    expect(auditorium?.id).toBeTruthy()
    auditoriumId = auditorium.id

    const daysAhead = 3 + Math.floor(Math.random() * 19)
    eventDate = new Date(Date.now() + daysAhead * 86_400_000).toISOString().slice(0, 10)
    const payload = { org_id: orgId, auditorium_id: auditoriumId, event_date: eventDate, time: '09:45' }

    const createdResponse = await page.request.post(`${apiBase()}/auditorium-event`, { data: payload, headers })
    expect(createdResponse.ok(), await createdResponse.text()).toBeTruthy()
    const created = (await createdResponse.json()).data
    expect(created).toBeTruthy()
    eventId = created.id

    await page.goto('/auditorium-event')
    await page.waitForLoadState('networkidle')
    const d = new Date(`${eventDate}T00:00:00`)
    displayedDate = `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]} ${eventDate.slice(0, 4)}`
    await expect(page.getByRole('row').filter({ hasText: displayedDate })).toHaveCount(1, { timeout: 15_000 })
  })

  test('edits the event', async ({ page }) => {
    test.skip(!eventId, 'Create test did not run')
    const headers = await authHeaders(page)
    const payload = { org_id: orgId, auditorium_id: auditoriumId, event_date: eventDate, time: '12:00' }
    const updatedResponse = await page.request.put(`${apiBase()}/auditorium-event/${eventId}`, { data: payload, headers })
    expect(updatedResponse.ok()).toBeTruthy()
  })

  test('deletes the event', async ({ page }) => {
    test.skip(!canDelete, 'Account lacks auditorium-event-delete permission')
    test.skip(!eventId, 'Create test did not run')
    const headers = await authHeaders(page)

    const deletedResponse = await page.request.delete(`${apiBase()}/auditorium-event/${eventId}`, { headers })
    expect(deletedResponse.ok()).toBeTruthy()

    await page.goto('/auditorium-event')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('row').filter({ hasText: displayedDate })).toHaveCount(0, { timeout: 15_000 })

    // ponytail: best-effort cleanup of a seeded auditorium (orphan acceptable in dev DB)
    if (seededAuditoriumId) {
      await page.request.delete(`${apiBase()}/auditorium/${seededAuditoriumId}`, { headers })
    }
  })
})
