import { test, expect } from '@playwright/test'

test.describe.serial('Consolidation members', () => {
  let sheetId = ''
  let folio = ''
  let memberName = ''
  let editedName = ''

  test.beforeEach(async ({ page }) => {
    const email = process.env.E2E_EMAIL
    const password = process.env.E2E_PASSWORD
    test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD to run this test')
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByRole('textbox', { name: /correo/i }).fill(email!)
    await page.getByRole('textbox', { name: /contraseña/i }).fill(password!)
    await page.locator('#login-submit').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
  })

  test('logs in as admin', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('verifies permissions', async ({ page }) => {
    await page.goto('/account')
    await expect(page.locator('#acc-permissions-card')).toBeVisible()
    await expect(page.locator('#acc-permissions-card').getByText('conso-sheet-create', { exact: true })).toBeVisible()
  })

  test('creates a consolidation', async ({ page }) => {
    await page.goto('/consolidation')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#cnsld-new-btn')).toBeVisible()
    const token = (await page.context().cookies()).find(cookie => cookie.name === 'auth.token')?.value
    const headers = { Accept: 'application/json', Authorization: `Bearer ${decodeURIComponent(token ?? '')}` }
    const apiBase = process.env.BASE_URL || 'http://192.168.1.20:8001/api'
    const organizations = await page.request.get(`${apiBase}/organization`, { headers })
    const payload = await organizations.json()
    const items = Array.isArray(payload) ? payload : (payload.data?.data ?? payload.data ?? [])
    expect(items.length).toBeGreaterThan(0)
    folio = `E2E-${Date.now()}`
    const response = await page.request.post(`${apiBase}/conso-sheet`, {
      headers,
      data: { org_id: items[0].id, folio_number: folio, date: new Date().toISOString().slice(0, 10) },
    })
    expect(response.ok(), await response.text()).toBeTruthy()
    const result = await response.json()
    sheetId = String(result.data?.data?.id ?? result.data?.id ?? result.id)
    expect(sheetId).toMatch(/^\d+$/)
  })

  test('manages a member', async ({ page }) => {
    await page.goto(`/consolidation/${sheetId}/details`)
    await page.waitForLoadState('networkidle')
    memberName = `E2E Member ${Date.now()}`
    await page.locator('#cnsld-new-member-btn').click()
    const dialog = page.locator('#det-member-dlg')
    await dialog.getByRole('textbox', { name: 'Nombre' }).fill(memberName)
    await dialog.getByRole('textbox', { name: 'Apellido Paterno' }).fill('Test')
    await page.locator('#cmm-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: memberName })).toHaveCount(1)
    editedName = `${memberName}X`
    const token = (await page.context().cookies()).find(cookie => cookie.name === 'auth.token')?.value
    const headers = { Accept: 'application/json', Authorization: `Bearer ${decodeURIComponent(token ?? '')}` }
    const apiBase = process.env.BASE_URL || 'http://192.168.1.20:8001/api'
    const response = await page.request.get(`${apiBase}/church-member`, { headers })
    const payload = await response.json()
    const items = Array.isArray(payload) ? payload : (payload.data?.data ?? payload.data ?? [])
    const member = items.find((item: { name: string }) => item.name === memberName)
    expect(member).toBeTruthy()
    const update = await page.request.put(`${apiBase}/church-member/${member.id}`, {
      headers,
      data: { name: editedName, last_name: 'Test', conso_sheet_id: sheetId },
    })
    expect(update.ok(), await update.text()).toBeTruthy()
    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: editedName })).toHaveCount(1)
    const deleteMember = await page.request.delete(`${apiBase}/church-member/${member.id}`, { headers })
    expect(deleteMember.ok(), await deleteMember.text()).toBeTruthy()
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('row').filter({ hasText: editedName })).toHaveCount(0, { timeout: 15_000 })
  })

  test('deletes the sheet', async ({ page }) => {
    await page.goto('/consolidation')
    await page.waitForLoadState('networkidle')
    const token = (await page.context().cookies()).find(cookie => cookie.name === 'auth.token')?.value
    const headers = { Accept: 'application/json', Authorization: `Bearer ${decodeURIComponent(token ?? '')}` }
    const apiBase = process.env.BASE_URL || 'http://192.168.1.20:8001/api'
    const response = await page.request.delete(`${apiBase}/conso-sheet/${sheetId}`, { headers })
    expect(response.ok(), await response.text()).toBeTruthy()
    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: folio })).toHaveCount(0)
  })
})
