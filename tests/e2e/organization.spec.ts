import { test, expect } from '@playwright/test'

test.describe('Organization CRUD', () => {
  test('login, create an organization, edit it, then delete it', async ({ page }) => {
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
    const canDelete = await page.locator('#acc-permissions-card').getByText('organization-delete', { exact: true }).isVisible()

    // --- Organizations page ---
    await page.goto('/organization')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#org-new-btn')).toBeVisible()

    // --- Create ---
    const timestamp = Date.now()
    const name = `E2E Org ${timestamp}`
    const code = `c${timestamp.toString().slice(-4)}`

    await page.locator('#org-new-btn').click()
    await expect(page.locator('#org-formd-dlg-1')).toBeVisible()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(name)
    await page.getByRole('textbox', { name: 'Código' }).fill(code)
    await page.locator('#org-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1)

    // --- Edit (append a letter) ---
    const edited = `${name}x`
    await page.getByRole('row').filter({ hasText: name }).getByTitle('Editar').click()
    await expect(page.locator('#org-formd-dlg-1')).toBeVisible()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(edited)
    await page.locator('#org-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(1)

    // --- Delete (if permitted) ---
    if (canDelete) {
      await page.getByRole('row').filter({ hasText: edited }).locator('#org-table-delete-btn').click()
      await expect(page.locator('#dialo-delet-dlg-1')).toBeVisible()
      await page.locator('#dialog-delete-yes-btn').click()
      await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(0, { timeout: 15_000 })
    }
  })
})
