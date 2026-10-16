/**
 * Shared auth helpers for e2e specs.
 *
 * Not collected as a test: Playwright's default testMatch only picks `**\/*.spec.ts`.
 */
import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/** Parse the gitignored .env.test so specs run without exporting env vars. */
function fileEnv(): Record<string, string> {
  const parsed: Record<string, string> = {}
  try {
    const raw = readFileSync(fileURLToPath(new URL('../../../.env.test', import.meta.url)), 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
      if (match) parsed[match[1]] = match[2].replace(/^(["'])(.*)\1$/, '$2')
    }
  } catch {
    // No .env.test — fall back to process.env only.
  }
  return parsed
}

const file = fileEnv()

export const E2E_EMAIL = process.env.E2E_EMAIL || file.E2E_EMAIL || ''
export const E2E_PASSWORD = process.env.E2E_PASSWORD || file.E2E_PASSWORD || ''

export const apiBase = () => process.env.BASE_URL || file.BASE_URL || 'http://192.168.1.20:8001/api'

export function hasCredentials(): boolean {
  return Boolean(E2E_EMAIL && E2E_PASSWORD)
}

export async function authHeaders(page: Page) {
  const token = (await page.context().cookies()).find(cookie => cookie.name === 'auth.token')?.value
  return { Accept: 'application/json', Authorization: `Bearer ${decodeURIComponent(token ?? '')}` }
}

export async function login(page: Page, credentials?: { email: string; password: string }): Promise<void> {
  const email = credentials?.email ?? E2E_EMAIL
  const password = credentials?.password ?? E2E_PASSWORD
  await page.goto('/login')
  // Wait for Vue hydration so the submit handler is attached (otherwise the
  // click triggers a native form GET and login never fires).
  await page.waitForLoadState('networkidle')
  await page.getByRole('textbox', { name: /correo/i }).fill(email)
  await page.getByRole('textbox', { name: /contraseña/i }).fill(password)
  await page.locator('#login-submit').click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
}

/** beforeEach entry point: skip when credentials are absent, otherwise log in. */
export async function loginOrSkip(page: Page): Promise<void> {
  test.skip(!hasCredentials(), 'Set E2E_EMAIL and E2E_PASSWORD (or fill .env.test) to run this test')
  await login(page)
}

/**
 * First org id the signed-in account holds every given permission for
 * (POST /auth/user → user.permissions_org). Undefined when none qualifies.
 *
 * Org-scoped list endpoints filter by the account's permitted orgs, so data
 * written to any other org is invisible — seed into a permitted org.
 */
export async function permittedOrgFor(page: Page, ...permissions: string[]): Promise<number | undefined> {
  const response = await page.request.post(`${apiBase()}/auth/user`, { headers: await authHeaders(page) })
  if (!response.ok()) return undefined
  const body = await response.json()
  const user = body.user ?? body.data ?? body
  const byPermission = (user?.permissions_org ?? {}) as Record<string, number[]>
  return permissions.map(permission => byPermission[permission] ?? []).reduce((shared, ids) => shared.filter(id => ids.includes(id)))[0]
}

export async function logoutLogin(page: Page): Promise<void> {
  await page.goto('/logout')
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
  await login(page)
}
