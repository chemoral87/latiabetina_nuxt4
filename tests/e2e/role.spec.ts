import { test, expect } from '@playwright/test'

test.describe('Role CRUD', () => {
  test('login, create a role, edit it, then delete it', async ({ page }) => {
    test.setTimeout(90_000) // dev server may cold-compile the role page
    const email = process.env.E2E_EMAIL
    const password = process.env.E2E_PASSWORD
    test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD to run this test')

    // --- Login ---
    await page.goto('/login')
    await page.waitForLoadState('networkidle') // wait for Vue hydration
    await page.getByRole('textbox', { name: /correo/i }).fill(email!)
    await page.getByRole('textbox', { name: /contraseña/i }).fill(password!)
    await page.locator('#login-submit').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })

    // --- Roles page ---
    await page.goto('/role')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#rol-new-btn')).toBeVisible()

    // --- Create ---
    const name = `E2E Rol ${Date.now()}`
    await page.locator('#rol-new-btn').click()
    await expect(page.locator('#rol-dialo-dlg-1')).toBeVisible()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(name)
    await page.locator('#rol-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1)

    // --- Edit (append a letter) ---
    const edited = `${name}x`
    await page.getByRole('row').filter({ hasText: name }).getByTitle('Editar').click()
    await expect(page.locator('#rol-dialo-dlg-1')).toBeVisible()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(edited)
    await page.locator('#rol-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(1)

    // --- Delete ---
    await page.getByRole('row').filter({ hasText: edited }).getByTitle('Eliminar').click()
    await expect(page.locator('#dialo-delet-dlg-1')).toBeVisible()
    await expect(page.locator('#dialo-delet-dlg-1')).toContainText(edited)
    await page.locator('#dialog-delete-yes-btn').click()
    await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(0)
  })
})
