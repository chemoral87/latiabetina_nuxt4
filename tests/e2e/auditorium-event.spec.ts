import { test, expect } from '@playwright/test'

test.describe('Auditorium event CRUD', () => {
  test('login, create an event, edit it, then delete it', async ({ page }) => {
    test.setTimeout(90_000)
    const email = process.env.E2E_EMAIL
    const password = process.env.E2E_PASSWORD
    test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD to run this test')

    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByRole('textbox', { name: /correo/i }).fill(email!)
    await page.getByRole('textbox', { name: /contraseña/i }).fill(password!)
    await page.locator('#login-submit').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })

    await page.goto('/account')
    await page.waitForLoadState('networkidle')
    const account = page.locator('#acc-permissions-card')
    await expect(account).toBeVisible()
    const canCreate = await account.getByText('auditorium-event-create', { exact: true }).isVisible()
    const canDelete = await account.getByText('auditorium-event-delete', { exact: true }).isVisible()
    test.skip(!canCreate, 'Account lacks auditorium-event-create permission')

    const apiBase = process.env.BASE_URL || 'http://192.168.1.20:8001/api'
    const tokenCookie = (await page.context().cookies()).find(cookie => cookie.name === 'auth.token')
    const headers = tokenCookie ? { Authorization: `Bearer ${decodeURIComponent(tokenCookie.value)}`, Accept: 'application/json' } : { Accept: 'application/json' }
    const organizations = await page.request.get(`${apiBase}/organization`, { headers })
    expect(organizations.ok()).toBeTruthy()
    const orgResponse = await organizations.json()
    const orgData = Array.isArray(orgResponse) ? orgResponse : (orgResponse.data ?? [])
    const org = orgData[0]
    expect(org).toBeTruthy()
    const auditoriums = await page.request.get(`${apiBase}/auditorium`, { headers })
    expect(auditoriums.ok()).toBeTruthy()
    const auditoriumResponse = await auditoriums.json()
    const auditoriumData = Array.isArray(auditoriumResponse) ? auditoriumResponse : (auditoriumResponse.data ?? [])
    const auditorium = auditoriumData[0]
    expect(auditorium).toBeTruthy()
    const daysAhead = 3 + Math.floor(Math.random() * 19)
    const eventDate = new Date(Date.now() + daysAhead * 86_400_000).toISOString().slice(0, 10)
    const payload = { org_id: org.id, auditorium_id: auditorium.id, event_date: eventDate, time: '09:45' }

    const createdResponse = await page.request.post(`${apiBase}/auditorium-event`, { data: payload, headers })
    expect(createdResponse.ok(), await createdResponse.text()).toBeTruthy()
    const created = (await createdResponse.json()).data
    expect(created).toBeTruthy()

    await page.goto('/auditorium-event')
    await page.waitForLoadState('networkidle')
    const displayedDate = `${String(new Date(`${eventDate}T00:00:00`).getDate()).padStart(2, '0')} ${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][new Date(`${eventDate}T00:00:00`).getMonth()]} ${eventDate.slice(0, 4)}`
    await expect(page.getByRole('row').filter({ hasText: displayedDate })).toHaveCount(1, { timeout: 15_000 })

    const edited = { ...payload, time: '12:00' }
    const updatedResponse = await page.request.put(`${apiBase}/auditorium-event/${created.id}`, { data: edited, headers })
    expect(updatedResponse.ok()).toBeTruthy()

    if (canDelete) {
      const deletedResponse = await page.request.delete(`${apiBase}/auditorium-event/${created.id}`, { headers })
      expect(deletedResponse.ok()).toBeTruthy()
      await page.reload()
      await page.waitForLoadState('networkidle')
      await expect(page.getByRole('row').filter({ hasText: displayedDate })).toHaveCount(0, { timeout: 15_000 })
    }
  })
})
