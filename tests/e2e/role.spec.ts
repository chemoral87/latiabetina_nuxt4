import { test, expect } from '@playwright/test'

test.describe.serial('Role CRUD', () => {
  let name = ''
  let edited = ''
  let canDelete = false

  test.beforeEach(async ({ page }) => {
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
  })

  test('logs in as admin', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('verifies permissions', async ({ page }) => {
    await page.goto('/account')
    const account = page.locator('#acc-permissions-card')
    await expect(account).toBeVisible()
    await expect(account.getByText('role-index', { exact: true })).toBeVisible()
    canDelete = await account.getByText('role-delete', { exact: true }).isVisible()
  })

  test('creates a role', async ({ page }) => {
    name = `E2E Rol ${Date.now()}`
    await page.goto('/role')
    await page.waitForLoadState('networkidle')
    await page.locator('#rol-new-btn').click()
    await expect(page.locator('#rol-dialo-dlg-1')).toBeVisible()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(name)
    await page.locator('#rol-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1)
  })

  test('edits the role', async ({ page }) => {
    edited = `${name}x`
    await page.goto('/role')
    await page.waitForLoadState('networkidle')
    await page.getByRole('row').filter({ hasText: name }).getByTitle('Editar').click()
    await expect(page.locator('#rol-dialo-dlg-1')).toBeVisible()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(edited)
    await page.locator('#rol-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(1)
  })

  test('deletes the role', async ({ page }) => {
    test.skip(!canDelete, 'Account lacks role-delete permission')
    await page.goto('/role')
    await page.waitForLoadState('networkidle')
    await page.getByRole('row').filter({ hasText: edited }).getByTitle('Eliminar').click()
    await expect(page.locator('#dialo-delet-dlg-1')).toBeVisible()
    await expect(page.locator('#dialo-delet-dlg-1')).toContainText(edited)
    await page.locator('#dialog-delete-yes-btn').click()
    await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(0, { timeout: 15_000 })
  })
})
