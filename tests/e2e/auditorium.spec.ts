import { test, expect } from '@playwright/test'

test.describe('Auditorium CRUD', () => {
  test('login, create an auditorium, edit it, then delete it', async ({ page }) => {
    test.setTimeout(90_000)
    const email = process.env.E2E_EMAIL
    const password = process.env.E2E_PASSWORD
    test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD to run this test')

    // --- Login ---
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByRole('textbox', { name: /correo/i }).fill(email!)
    await page.getByRole('textbox', { name: /contraseña/i }).fill(password!)
    await page.locator('#login-submit').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })

    // --- Verify permissions in /account ---
    await page.goto('/account')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#acc-permissions-card')).toBeVisible()
    const canDelete = await page.locator('#acc-permissions-card').getByText('auditorium-delete', { exact: true }).isVisible()

    // --- Auditoriums page ---
    await page.goto('/auditorium')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#aud-new-btn')).toBeVisible()

    // --- Create ---
    const timestamp = Date.now()
    const name = `E2E Auditorio ${timestamp}`

    await page.locator('#aud-new-btn').click()
    await expect(page.locator('#aud-dialog-dlg-1')).toBeVisible()

    // If multi-org selector is visible in dialog, pick first org
    const orgSelect = page.locator('#aud-dialog-org')
    if (await orgSelect.isVisible()) {
      await orgSelect.click()
      await page.locator('.v-overlay .v-list-item').first().click()
    }

    await page.getByRole('textbox', { name: 'Nombre' }).fill(name)
    await page.locator('#aud-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1)

    // --- Edit (append a letter) ---
    const edited = `${name}x`
    await page.getByRole('row').filter({ hasText: name }).getByTitle('Editar', { exact: true }).click()
    await expect(page.locator('#aud-dialog-dlg-1')).toBeVisible()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(edited)
    await page.locator('#aud-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(1)

    // --- Delete (if permitted) ---
    if (canDelete) {
      await page.getByRole('row').filter({ hasText: edited }).getByTitle('Eliminar').click()
      await expect(page.locator('#dialo-delet-dlg-1')).toBeVisible()
      await page.locator('#dialog-delete-yes-btn').click()
      await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(0, { timeout: 15_000 })
    }
  })
})
