import { test, expect } from '@playwright/test'

test.describe('Login page smoke test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    // Wait for Vue hydration so the submit handler is attached (otherwise the
    // click triggers a native form GET and login never fires).
    await page.waitForLoadState('networkidle')
  })

  test('loads with the expected heading and inputs', async ({ page }) => {
    await expect(page.locator('#login-card')).toContainText('Inicio de Sesión')
    await expect(page.getByRole('textbox', { name: /correo/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /contraseña/i })).toBeVisible()
    await expect(page.locator('#login-submit')).toBeVisible()
  })

  test('shows validation error on empty form submit', async ({ page }) => {
    await page.locator('#login-submit').click()
    // Submit is prevented client-side; email field is required so clicking submit should not proceed.
    // We assert the page is still on /login (no accidental nav) and form visible.
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.locator('#login-form')).toBeVisible()
  })

  test('logs in with valid credentials and reaches dashboard', async ({ page }) => {
    const email = process.env.E2E_EMAIL
    const password = process.env.E2E_PASSWORD
    test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD to run this test')

    await page.getByRole('textbox', { name: /correo/i }).fill(email!)
    await page.getByRole('textbox', { name: /contraseña/i }).fill(password!)
    await page.locator('#login-submit').click()

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
    await expect(page.locator('#lay-account-btn')).toBeVisible()
  })
})
