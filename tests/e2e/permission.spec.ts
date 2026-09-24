import { test, expect } from '@playwright/test'

test.describe('Permission CRUD', () => {
  test('login, create a permission, edit it, then delete it', async ({ page }) => {
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
    const canDelete = await page.locator('#acc-permissions-card').getByText('permission-delete', { exact: true }).isVisible()

    // --- Permissions page ---
    await page.goto('/permission')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#per-new-btn')).toBeVisible()

    // --- Create ---
    const name = `e2e-perm-${Date.now()}`
    await page.locator('#per-new-btn').click()
    await expect(page.locator('#per-dialog-dlg-1')).toBeVisible()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(name)
    await page.locator('#per-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1)

    // --- Edit (append a letter) ---
    const edited = `${name}x`
    await page.getByRole('row').filter({ hasText: name }).getByTitle('Editar').click()
    await expect(page.locator('#per-dialog-dlg-1')).toBeVisible()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(edited)
    await page.locator('#per-dialog-save-btn').click()

    // Filter to find the edited permission across pagination
    await page.getByPlaceholder('Buscar permiso...').fill(edited)
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
