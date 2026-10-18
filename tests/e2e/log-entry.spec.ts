import { test, expect } from '@playwright/test'
import { loginOrSkip } from './helpers/auth'

test('log-entry page creates a test error', async ({ page }) => {
  await loginOrSkip(page)
  await page.goto('/log-entry')
  await page.waitForLoadState('networkidle')

  test.skip(page.url().includes('/forbidden'), 'Account lacks log-entry-index permission')
  await expect(page.locator('#le-test-error-btn')).toBeVisible()
  await page.locator('#le-test-error-btn').click()

  await expect(page.getByRole('row').filter({ hasText: 'E2E test error from log-entry page' })).toHaveCount(1, {
    timeout: 15_000,
  })
})
