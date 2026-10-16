import { test, expect } from '@playwright/test'
import { loginOrSkip } from './helpers/auth'

test.describe.serial('Auditorium CRUD', () => {
  let canDelete = false
  let name = ''
  let edited = ''

  test.beforeEach(async ({ page }) => {
    await loginOrSkip(page)
  })

  test('logs in as admin', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('verifies permissions', async ({ page }) => {
    await page.goto('/account')
    await page.waitForLoadState('networkidle')
    const account = page.locator('#acc-permissions-card')
    await expect(account).toBeVisible()
    canDelete = await account.getByText('auditorium-delete', { exact: true }).isVisible()
    const canIndex = await account.getByText('auditorium-index', { exact: true }).isVisible()
    test.skip(!canIndex, 'Account lacks auditorium-index permission')
  })

  test('creates an auditorium', async ({ page }) => {
    await page.goto('/auditorium')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#aud-new-btn')).toBeVisible()

    name = `E2E Auditorio ${Date.now()}`
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
  })

  test('edits the auditorium', async ({ page }) => {
    test.skip(!name, 'Create test did not run')
    await page.goto('/auditorium')
    await page.waitForLoadState('networkidle')

    edited = `${name}x`
    await page.getByRole('row').filter({ hasText: name }).getByTitle('Editar', { exact: true }).click()
    await expect(page.locator('#aud-dialog-dlg-1')).toBeVisible()
    await page.getByRole('textbox', { name: 'Nombre' }).fill(edited)
    await page.locator('#aud-dialog-save-btn').click()
    await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(1)
  })

  test('deletes the auditorium', async ({ page }) => {
    test.skip(!canDelete, 'Account lacks auditorium-delete permission')
    test.skip(!edited, 'Edit test did not run')
    await page.goto('/auditorium')
    await page.waitForLoadState('networkidle')

    await page.getByRole('row').filter({ hasText: edited }).getByTitle('Eliminar').click()
    await expect(page.locator('#dialo-delet-dlg-1')).toBeVisible()
    await page.locator('#dialog-delete-yes-btn').click()
    await expect(page.getByRole('row').filter({ hasText: edited })).toHaveCount(0, { timeout: 15_000 })
  })
})
