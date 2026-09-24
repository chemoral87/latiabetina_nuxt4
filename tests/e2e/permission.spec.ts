import { test, expect } from '@playwright/test'

test.describe.serial('Permission CRUD', () => {
  let name = ''
  let edited = ''
  let canDelete = false

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

  test('logs in as admin', async ({ page }) => await expect(page).toHaveURL(/\/dashboard/))
  test('verifies permissions', async ({ page }) => {
    await page.goto('/account')
    const account = page.locator('#acc-permissions-card')
    await expect(account).toBeVisible()
    await expect(account.getByText('permission-index', { exact: true })).toBeVisible()
    canDelete = await account.getByText('permission-delete', { exact: true }).isVisible()
  })
  test('creates a permission', async ({ page }) => {
    name = `e2e-perm-${Date.now()}`
    await page.goto('/permission')
    await page.waitForLoadState('networkidle')
    await page.locator('#per-new-btn').click()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(name)
    await page.locator('#per-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1)
  })
  test('edits the permission', async ({ page }) => {
    edited = `${name}x`
    await page.goto('/permission')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('Buscar permiso...').fill(name)
    await page.getByRole('row').filter({ hasText: name }).getByTitle('Editar').click()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(edited)
    await page.locator('#per-dialog-save-btn').click()
    await page.getByPlaceholder('Buscar permiso...').fill(edited)
    await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(1)
  })
  test('deletes the permission', async ({ page }) => {
    test.skip(!canDelete, 'Account lacks permission-delete permission')
    await page.goto('/permission')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('Buscar permiso...').fill(edited)
    await page.getByRole('row').filter({ hasText: edited }).getByTitle('Eliminar').click()
    await page.locator('#dialog-delete-yes-btn').click()
    await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(0, { timeout: 15_000 })
  })
})
