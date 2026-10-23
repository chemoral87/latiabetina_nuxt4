import { test, expect } from '@playwright/test'
import { apiBase, authHeaders, loginOrSkip } from './helpers/auth'

test.describe.serial('Professional create', () => {
  let lastName = ''

  test.beforeEach(async ({ page }) => {
    await loginOrSkip(page)
  })

  test('opens the new professional page and shows the dialog', async ({ page }) => {
    await page.goto('/professional/new')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#pro-dialog-dlg-1')).toBeVisible()
  })

  test('blocks save when required fields are empty', async ({ page }) => {
    await page.goto('/professional/new')
    await page.waitForLoadState('networkidle')
    await page.locator('#pro-dialog-save-btn').click()
    await expect(page.locator('#pro-dialog-dlg-1')).toBeVisible()
    await expect(page.getByText('El campo Nombre es obligatorio.')).toBeVisible()
  })

  test('creates a professional', async ({ page }) => {
    // One publication per user: clear any existing listing first, then create.
    const headers = await authHeaders(page)
    const mine = await page.request.get(`${apiBase()}/professionals/mine`, { headers })
    const existing = mine.ok() ? await mine.json() : null
    const publication = Array.isArray(existing) ? existing[0] : (existing?.data ?? existing)
    if (publication?.id) {
      const removed = await page.request.delete(`${apiBase()}/professionals/${publication.id}`, { headers })
      expect(removed.ok(), `DELETE /professionals/${publication.id} → ${removed.status()} ${await removed.text()}`).toBe(true)
    }

    lastName = `E2E${Date.now()}`.slice(-8)
    await page.goto('/professional/new')
    await page.waitForLoadState('networkidle')
    await page.getByRole('textbox', { name: 'Nombre' }).fill('E2E')
    await page.getByRole('textbox', { name: 'Apellido' }).fill(lastName)
    await page.getByRole('textbox', { name: 'Teléfono' }).fill('5512345678')
    await page.getByRole('textbox', { name: 'Profesión u oficio' }).fill('Plomero')
    await page.locator('#pro-dialog-save-btn').click()
    await expect(page).toHaveURL(/\/professional$/, { timeout: 15_000 })

    const after = await page.request.get(`${apiBase()}/professionals/mine`, { headers })
    expect(after.ok()).toBe(true)
    expect((await after.json())?.last_name).toBe(lastName)
  })

  test('filters the created professional', async ({ page }) => {
    await page.goto('/professional')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('Buscar por profesión o nombre...').fill(lastName)
    await expect(page.getByRole('row').filter({ hasText: lastName })).toHaveCount(1)
    await expect(page.locator('tbody tr')).toHaveCount(1)
  })

  test('cancel returns to the list', async ({ page }) => {
    await page.goto('/professional/new')
    await page.waitForLoadState('networkidle')
    await page.locator('#pro-dialog-cancel-btn').click()
    await expect(page).toHaveURL(/\/professional$/, { timeout: 15_000 })
  })
})
