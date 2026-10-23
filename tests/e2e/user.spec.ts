import { test, expect } from '@playwright/test'
import { loginOrSkip } from './helpers/auth'

test.describe.serial('User CRUD', () => {
  let name = ''
  let edited = ''
  let canDelete = false
  test.beforeEach(async ({ page }) => {
    await loginOrSkip(page)
  })
  test('logs in as admin', async ({ page }) => await expect(page).toHaveURL(/\/dashboard/))
  test('verifies permissions', async ({ page }) => {
    await page.goto('/account')
    const account = page.locator('#acc-permissions-card')
    await expect(account).toBeVisible()
    await expect(account.getByText('user-index', { exact: true })).toBeVisible()
    canDelete = await account.getByText('user-delete', { exact: true }).isVisible()
  })
  test('creates a user', async ({ page }) => {
    const timestamp = Date.now()
    name = `E2EUser${timestamp}`
    await page.goto('/user')
    await page.waitForLoadState('networkidle')
    await page.locator('#usr-new-btn').click()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(name)
    await page.getByRole('textbox', { name: 'Ap. Paterno' }).fill('TestPaterno')
    await page.getByRole('textbox', { name: 'E-mail' }).fill(`e2e_${timestamp}@test.com`)
    await page.locator('#usr-dialog-save-btn').click()
    await page.goto('/user')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1)
  })
  test('filters the created user', async ({ page }) => {
    await page.goto('/user')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('Filtro').fill(name)
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1)
    await expect(page.locator('tbody tr')).toHaveCount(1)
  })
  test('edits the user', async ({ page }) => {
    edited = `${name}x`
    await page.goto('/user')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('Filtro').fill(name)
    await page.getByRole('row').filter({ hasText: name }).getByTitle('Editar').click()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(edited)
    await page.locator('#usr-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(1)
  })
  test('deletes the user', async ({ page }) => {
    test.skip(!canDelete, 'Account lacks user-delete permission')
    await page.goto('/user')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('Filtro').fill(edited)
    await page.getByRole('row').filter({ hasText: edited }).getByTitle('Eliminar').click()
    await page.locator('#dialog-delete-yes-btn').click()
    await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(0, { timeout: 15_000 })
  })
})
