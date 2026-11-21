/**
 * "My consolidation" scope E2E — consolidator account (E2E_EMAIL3) on the CAM org.
 *
 * Covers the split between the manager pages (/consolidation, /church-member) and
 * the mine pages (/consolidation-my, /church-member-my, /tracking-activity-my).
 *
 * Requirements in .env.test:
 *   E2E_EMAIL3 / E2E_PASSWORD3 — consolidator profile on CAM holding
 *     conso-sheet-my-index, conso-sheet-my-manage,
 *     church-member-my-index, church-member-my-manage
 */
import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { apiBase, authHeaders, login } from './helpers/auth'

function fileEnv(): Record<string, string> {
  const parsed: Record<string, string> = {}
  try {
    const raw = readFileSync(fileURLToPath(new URL('../../.env.test', import.meta.url)), 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
      if (match) parsed[match[1]] = match[2].replace(/^(["'])(.*)\1$/, '$2')
    }
  } catch {
    // no .env.test — fall back to process.env
  }
  return parsed
}

const file = fileEnv()
const env = (key: string) => process.env[key] || file[key] || ''

const EMAIL = env('E2E_EMAIL3')
const PASSWORD = env('E2E_PASSWORD3')

async function waitForApp(page: Page) {
  await page.waitForFunction(() => Boolean((document.getElementById('__nuxt') as { __vue_app__?: unknown } | null)?.__vue_app__))
}

/**
 * POST /auth/user → the signed-in account: its orgs and the per-permission org
 * ids it holds (`permissions_org`). Every my-scope endpoint is org scoped, so the
 * specs assert against the CAM id instead of hardcoding 1.
 */
async function authUser(page: Page) {
  const response = await page.request.post(`${apiBase()}/auth/user`, { headers: await authHeaders(page) })
  const user = await response.json()
  return {
    id: Number(user.id),
    orgs: (user.orgs ?? []) as { id: number; name: string }[],
    permissionsOrg: (user.permissions_org ?? {}) as Record<string, number[]>,
  }
}

test.describe.serial('My consolidation — consolidator @ CAM', () => {
  let camOrgId = 0
  let sheetId = ''
  let folio = ''
  let memberId = 0
  let memberName = ''

  test.beforeEach(async ({ page }) => {
    test.skip(!EMAIL || !PASSWORD, 'Set E2E_EMAIL3 and E2E_PASSWORD3 in .env.test to run this test')
    await login(page, { email: EMAIL, password: PASSWORD })
  })

  test('logs in and holds the my-scope grants on CAM', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/)
    const user = await authUser(page)
    camOrgId = user.orgs.find(org => org.name === 'CAM')?.id ?? 0
    expect(camOrgId, 'conso2 needs a CAM profile').toBeTruthy()
    for (const permission of ['conso-sheet-my-index', 'church-member-my-index']) {
      expect(user.permissionsOrg[permission] ?? [], `${permission} must cover CAM`).toContain(camOrgId)
    }
  })

  test('creates a consolidation in CAM from the my list', async ({ page }) => {
    await page.goto('/consolidation-my')
    await waitForApp(page)
    await expect(page.locator('#cnm-index-filter')).toBeVisible()
    test.skip((await page.locator('#cnm-new-btn').count()) === 0, 'conso-sheet-my-manage not granted')

    await page.locator('#cnm-new-btn').click()
    const dialog = page.locator('#cnm-sheet-dlg-1')
    await expect(dialog).toBeVisible()

    await dialog.locator('.v-field__input:has(#cmp-organization-select)').click()
    await page.getByRole('option', { name: 'CAM', exact: true }).click()

    folio = String(Date.now())
    await dialog.getByRole('textbox', { name: 'Número de Folio' }).fill(folio)
    await dialog.locator('#con-dialog-save-btn').click()

    // saveSheet() navigates to the new sheet's mine-scope details page.
    await expect(page).toHaveURL(/\/consolidation-my\/\d+\/details$/, { timeout: 15_000 })
    sheetId = page.url().match(/\/consolidation-my\/(\d+)\/details/)![1]!
    expect(Number(sheetId)).toBeGreaterThan(0)
  })

  test('lists the new sheet in the my scope', async ({ page }) => {
    test.skip(!sheetId, 'no sheet was created')
    await page.goto('/consolidation-my')
    await waitForApp(page)
    await expect(page.getByRole('row').filter({ hasText: folio })).toHaveCount(1, { timeout: 15_000 })
  })

  test('adds a member and changes its status on the my details page', async ({ page }) => {
    test.skip(!sheetId, 'no sheet was created')
    const user = await authUser(page)
    test.skip(!(user.permissionsOrg['church-member-my-manage'] ?? []).includes(camOrgId), 'church-member-my-manage not granted on CAM')

    // Seed through the mine-scope endpoint so the row exists for the UI step.
    const headers = await authHeaders(page)
    memberName = `e2e my ${Date.now()}`
    const created = await page.request.post(`${apiBase()}/church-member/my`, {
      headers,
      data: { org_id: camOrgId, conso_sheet_id: sheetId, name: memberName, last_name: 'myscope' },
    })
    expect(created.ok(), await created.text()).toBeTruthy()
    memberId = Number((await created.json()).data.id)
    expect(memberId).toBeGreaterThan(0)

    await page.goto(`/consolidation-my/${sheetId}/details`)
    await waitForApp(page)
    // Names are title-cased on write, so the row shows "E2e My <stamp>".
    await expect(page.getByRole('row').filter({ hasText: `E2e My ${memberName.split(' ').pop()}` })).toHaveCount(1, { timeout: 15_000 })

    // Inline status select → PUT /church-member/my/:id/status. Vuetify puts the
    // pointer target on .v-field__input, so click the wrapper, not the input.
    await page.locator(`.v-field__input:has(#det-member-status-${memberId})`).click()
    await page.getByRole('option', { name: 'Visita', exact: true }).click()

    await expect
      .poll(
        async () => {
          const response = await page.request.get(`${apiBase()}/church-member/my/${memberId}`, { headers: await authHeaders(page) })
          return (await response.json()).status
        },
        { timeout: 15_000 }
      )
      .toBe('VISITA')
  })

  test('the folio link on /church-member-my/:id opens the my consolidation details', async ({ page }) => {
    test.skip(!memberId, 'no member was created')
    await page.goto(`/church-member-my/${memberId}`)
    await waitForApp(page)
    await page.locator('#cmm-info-toggle-btn').click()

    const link = page.locator(`a[href="/consolidation-my/${sheetId}/details"]`)
    await expect(link).toBeVisible()
    await link.click()
    await expect(page).toHaveURL(new RegExp(`/consolidation-my/${sheetId}/details$`))
  })

  test('my activity page loads', async ({ page }) => {
    await page.goto('/tracking-activity-my')
    await waitForApp(page)
    await expect(page.locator('#tam-index-filter')).toBeVisible()
  })

  test('manager consolidation page is forbidden without conso-sheet-index', async ({ page }) => {
    const user = await authUser(page)
    test.skip((user.permissionsOrg['conso-sheet-index'] ?? []).includes(camOrgId), 'account holds conso-sheet-index on CAM')
    await page.goto('/consolidation')
    await expect(page).toHaveURL(/\/forbidden/, { timeout: 15_000 })
  })

  test('cleans up the created member and sheet', async ({ page }) => {
    const headers = await authHeaders(page)
    if (memberId) {
      const deleted = await page.request.delete(`${apiBase()}/church-member/my/${memberId}`, { headers })
      expect(deleted.ok(), await deleted.text()).toBeTruthy()
    }
    if (sheetId) {
      const deleted = await page.request.delete(`${apiBase()}/conso-sheet/my/${sheetId}`, { headers })
      expect(deleted.ok(), await deleted.text()).toBeTruthy()
    }
  })
})
