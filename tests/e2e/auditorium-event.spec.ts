import { test, expect } from '@playwright/test'
import { apiBase, authHeaders, loginOrSkip, permittedOrgFor } from './helpers/auth'

test.describe('Auditorium event CRUD', () => {
  test('login, create an event, edit it, then delete it', async ({ page }) => {
    test.setTimeout(90_000)
    await loginOrSkip(page)

    await page.goto('/account')
    await page.waitForLoadState('networkidle')
    const account = page.locator('#acc-permissions-card')
    await expect(account).toBeVisible()
    const canCreate = await account.getByText('auditorium-event-create', { exact: true }).isVisible()
    const canDelete = await account.getByText('auditorium-event-delete', { exact: true }).isVisible()
    test.skip(!canCreate, 'Account lacks auditorium-event-create permission')

    const headers = await authHeaders(page)
    const orgId = await permittedOrgFor(page, 'auditorium-event-create')
    expect(orgId, 'Account has no org with auditorium-event-create').toBeTruthy()

    // Lists are scoped to permitted orgs, and auditorium.spec deletes the
    // auditorium it creates — so seed one when the org has none yet.
    const auditoriums = await page.request.get(`${apiBase()}/auditorium?itemsPerPage=15&org_id=${orgId}`, { headers })
    expect(auditoriums.ok(), await auditoriums.text()).toBeTruthy()
    const auditoriumResponse = await auditoriums.json()
    const auditoriumData = Array.isArray(auditoriumResponse) ? auditoriumResponse : (auditoriumResponse.data ?? [])
    let auditorium = auditoriumData[0]
    let seededAuditoriumId: number | undefined
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
    const daysAhead = 3 + Math.floor(Math.random() * 19)
    const eventDate = new Date(Date.now() + daysAhead * 86_400_000).toISOString().slice(0, 10)
    const payload = { org_id: orgId, auditorium_id: auditorium.id, event_date: eventDate, time: '09:45' }

    const createdResponse = await page.request.post(`${apiBase()}/auditorium-event`, { data: payload, headers })
    expect(createdResponse.ok(), await createdResponse.text()).toBeTruthy()
    const created = (await createdResponse.json()).data
    expect(created).toBeTruthy()

    await page.goto('/auditorium-event')
    await page.waitForLoadState('networkidle')
    const displayedDate = `${String(new Date(`${eventDate}T00:00:00`).getDate()).padStart(2, '0')} ${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][new Date(`${eventDate}T00:00:00`).getMonth()]} ${eventDate.slice(0, 4)}`
    await expect(page.getByRole('row').filter({ hasText: displayedDate })).toHaveCount(1, { timeout: 15_000 })

    const edited = { ...payload, time: '12:00' }
    const updatedResponse = await page.request.put(`${apiBase()}/auditorium-event/${created.id}`, { data: edited, headers })
    expect(updatedResponse.ok()).toBeTruthy()

    if (canDelete) {
      const deletedResponse = await page.request.delete(`${apiBase()}/auditorium-event/${created.id}`, { headers })
      expect(deletedResponse.ok()).toBeTruthy()
      await page.reload()
      await page.waitForLoadState('networkidle')
      await expect(page.getByRole('row').filter({ hasText: displayedDate })).toHaveCount(0, { timeout: 15_000 })
    }

    // ponytail: best-effort cleanup of a seeded auditorium (orphan acceptable in dev DB)
    if (seededAuditoriumId) {
      await page.request.delete(`${apiBase()}/auditorium/${seededAuditoriumId}`, { headers })
    }
  })
})
