import { test, expect } from '@playwright/test'

test.describe.serial('Professional create', () => {
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
    const last = `E2E${Date.now()}`.slice(-8)
    await page.goto('/professional/new')
    await page.waitForLoadState('networkidle')
    await page.getByRole('textbox', { name: 'Nombre' }).fill('E2E')
    await page.getByRole('textbox', { name: 'Apellido' }).fill(last)
    await page.getByRole('textbox', { name: 'Teléfono' }).fill('5512345678')
    await page.getByRole('textbox', { name: 'Profesión u oficio' }).fill('Plomero')
    await page.locator('#pro-dialog-save-btn').click()
    await expect(page).toHaveURL(/\/professional$/, { timeout: 15_000 })
  })

  test('cancel returns to the list', async ({ page }) => {
    await page.goto('/professional/new')
    await page.waitForLoadState('networkidle')
    await page.locator('#pro-dialog-cancel-btn').click()
    await expect(page).toHaveURL(/\/professional$/, { timeout: 15_000 })
  })
})
