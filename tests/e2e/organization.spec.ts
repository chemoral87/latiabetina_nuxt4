import { test, expect } from '@playwright/test'
import { loginOrSkip } from './helpers/auth'

test.describe.serial('Organization CRUD', () => {
  let name = ''
  let edited = ''
  let canDelete = false
  test.beforeEach(async ({ page }) => {
    await loginOrSkip(page)
  })
  test('logs in as admin', async ({ page }) => await expect(page).toHaveURL(/\/dashboard/))
  test('verifies permissions', async ({ page }) => {
    await page.goto('/account')
    await page.waitForLoadState('networkidle')
    const account = page.locator('#acc-permissions-card')
    await expect(account).toBeVisible()
    await expect(account.getByText('organization-index', { exact: true })).toBeVisible()
    canDelete = await account.getByText('organization-delete', { exact: true }).isVisible()
  })
  test('creates an organization', async ({ page }) => {
    name = `E2E Org ${Date.now()}`
    await page.goto('/organization')
    await page.waitForLoadState('networkidle')
    await page.locator('#org-new-btn').click()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(name)
    await page.getByRole('textbox', { name: 'Código' }).fill(`c${Date.now()}`.slice(-6))
    await page.locator('#org-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1)
  })
  test('filters the created organization', async ({ page }) => {
    await page.goto('/organization')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('Filtro').fill(name)
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1)
    await expect(page.locator('tbody tr')).toHaveCount(1)
  })
  test('edits the organization', async ({ page }) => {
    edited = `${name}x`
    await page.goto('/organization')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('Filtro').fill(name)
    await page.waitForTimeout(500)
    await page.getByRole('row').filter({ hasText: name }).getByTitle('Editar').click()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(edited)
    await page.locator('#org-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(1)
  })
  test('deletes the organization', async ({ page }) => {
    test.skip(!canDelete, 'Account lacks organization-delete permission')
    await page.goto('/organization')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('Filtro').fill(edited)
    await page.getByRole('row').filter({ hasText: edited }).locator('#org-table-delete-btn').click()
    await page.locator('#dialog-delete-yes-btn').click()
    await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(0, { timeout: 15_000 })
  })
})
