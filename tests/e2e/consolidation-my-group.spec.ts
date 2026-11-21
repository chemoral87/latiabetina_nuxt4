/**
 * Consolidator-group sharing on the "mine" scope.
 *
 * conso2 (E2E_EMAIL3) captures a conso-sheet on CAM. conso1 (E2E_EMAIL2) shares a
 * consolidator group with conso2, so conso1 must see that sheet on
 * /consolidation-my and open /consolidation-my/:id/details — the group link
 * widens the sheet scope, while a sheet in an org conso1 has no grant for stays
 * invisible (404).
 *
 * Requirements in .env.test:
 *   E2E_EMAIL2 / E2E_PASSWORD2 — consolidator on CAM (conso-sheet-my-index)
 *   E2E_EMAIL3 / E2E_PASSWORD3 — consolidator on CAM + COM (conso-sheet-my-manage)
 *   Both accounts must share at least one consolidator group.
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

const CONSO1 = { email: env('E2E_EMAIL2'), password: env('E2E_PASSWORD2') }
const CONSO2 = { email: env('E2E_EMAIL3'), password: env('E2E_PASSWORD3') }
const ADMIN = { email: env('E2E_EMAIL'), password: env('E2E_PASSWORD') }

async function waitForApp(page: Page) {
  await page.waitForFunction(() => Boolean((document.getElementById('__nuxt') as { __vue_app__?: unknown } | null)?.__vue_app__))
}

/** POST /auth/user → the signed-in account's orgs and per-permission org ids. */
async function authUser(page: Page) {
  const response = await page.request.post(`${apiBase()}/auth/user`, { headers: await authHeaders(page) })
  const user = await response.json()
  return {
    orgs: (user.orgs ?? []) as { id: number; name: string }[],
    permissionsOrg: (user.permissions_org ?? {}) as Record<string, number[]>,
  }
}

function orgIdByName(orgs: { id: number; name: string }[], name: string): number {
  return orgs.find(org => org.name === name)?.id ?? 0
}

function todayLocal(): string {
  return new Date().toLocaleDateString('en-CA')
}

test.describe.serial('My consolidation — group-mate sharing', () => {
  const stamp = Date.now()
  let camSheetId = 0
  let camFolio = ''
  let comSheetId = 0
  let memberId = 0

  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000)
    test.skip(!CONSO1.email || !CONSO2.email, 'Set E2E_EMAIL2/3 in .env.test to run this test')
  })

  test('conso2 captures a sheet + member on CAM and a sheet on COM', async ({ page }) => {
    await login(page, CONSO2)
    const user = await authUser(page)
    const cam = orgIdByName(user.orgs, 'CAM')
    const com = orgIdByName(user.orgs, 'COM')
    test.skip(!cam || !com, 'conso2 needs both CAM and COM profiles')
    test.skip(!(user.permissionsOrg['conso-sheet-my-manage'] ?? []).includes(cam), 'conso2 cannot manage sheets on CAM')

    const headers = await authHeaders(page)
    camFolio = `E2E GRP ${stamp}`
    const sheet = await page.request.post(`${apiBase()}/conso-sheet/my`, {
      headers,
      data: { org_id: cam, folio_number: camFolio, date: todayLocal() },
    })
    expect(sheet.ok(), await sheet.text()).toBeTruthy()
    camSheetId = Number((await sheet.json()).id)
    expect(camSheetId).toBeGreaterThan(0)

    // A sheet in an org conso1 has no grant for — must stay invisible to conso1.
    const comSheet = await page.request.post(`${apiBase()}/conso-sheet/my`, {
      headers,
      data: { org_id: com, folio_number: `E2E GRP COM ${stamp}`, date: todayLocal() },
    })
    expect(comSheet.ok(), await comSheet.text()).toBeTruthy()
    comSheetId = Number((await comSheet.json()).id)

    const member = await page.request.post(`${apiBase()}/church-member/my`, {
      headers,
      data: { org_id: cam, conso_sheet_id: camSheetId, name: `group mate ${stamp}`, last_name: 'sharing' },
    })
    expect(member.ok(), await member.text()).toBeTruthy()
    memberId = Number((await member.json()).data.id)
    expect(memberId).toBeGreaterThan(0)
  })

  test('conso1 reads the group-mate sheet through the my API, not the COM one', async ({ page }) => {
    test.skip(!camSheetId, 'no sheet was captured')
    await login(page, CONSO1)
    const headers = await authHeaders(page)

    const list = await page.request.get(`${apiBase()}/conso-sheet/my?itemsPerPage=-1`, { headers })
    expect(list.ok(), await list.text()).toBeTruthy()
    const ids = ((await list.json()).data ?? []).map((row: { id: number }) => Number(row.id))
    expect(ids, 'group-mate sheet must appear in the my list').toContain(camSheetId)

    const show = await page.request.get(`${apiBase()}/conso-sheet/my/${camSheetId}`, { headers })
    expect(show.status(), await show.text()).toBe(200)

    const forbidden = await page.request.get(`${apiBase()}/conso-sheet/my/${comSheetId}`, { headers })
    expect(forbidden.status(), 'a sheet in a non-permitted org stays hidden').toBe(404)
  })

  test('conso1 opens the group-mate sheet details and sees its members', async ({ page }) => {
    test.skip(!camSheetId || !memberId, 'no sheet was captured')
    await login(page, CONSO1)

    await page.goto('/consolidation-my')
    await waitForApp(page)
    const row = page.getByRole('row').filter({ hasText: camFolio })
    await expect(row).toHaveCount(1, { timeout: 15_000 })

    await page.locator(`#con-table-view-btn-${camSheetId}`).click()
    await expect(page).toHaveURL(new RegExp(`/consolidation-my/${camSheetId}/details$`))
    await waitForApp(page)
    // Names are title-cased on write, so "group mate <stamp>" shows as "Group Mate <stamp>".
    await expect(page.getByRole('row').filter({ hasText: `Group Mate ${stamp}` })).toHaveCount(1, { timeout: 15_000 })
  })

  test('conso1 gets the error page for a sheet no group-mate captured', async ({ page, request }) => {
    test.skip(!ADMIN.email, 'Set E2E_EMAIL in .env.test to run this test')

    // Admin works through a standalone API context: no UI login, so the test
    // stays inside its budget (each UI login waits for networkidle).
    const adminLogin = await request.post(`${apiBase()}/auth/login`, {
      data: { email: ADMIN.email, password: ADMIN.password },
    })
    expect(adminLogin.ok(), await adminLogin.text()).toBeTruthy()
    const adminHeaders = {
      Accept: 'application/json',
      Authorization: `Bearer ${(await adminLogin.json()).access_token}`,
    }

    const adminUser = await (await request.post(`${apiBase()}/auth/user`, { headers: adminHeaders })).json()
    const cam = orgIdByName(adminUser.orgs ?? [], 'CAM')
    test.skip(!(adminUser.permissions_org?.['conso-sheet-my-manage'] ?? []).includes(cam), 'admin cannot capture sheets on CAM')

    const created = await request.post(`${apiBase()}/conso-sheet/my`, {
      headers: adminHeaders,
      data: { org_id: cam, folio_number: `E2E GRP OUT ${stamp}`, date: todayLocal() },
    })
    expect(created.ok(), await created.text()).toBeTruthy()
    const outsiderSheetId = Number((await created.json()).id)
    expect(outsiderSheetId).toBeGreaterThan(0)

    try {
      await login(page, CONSO1)
      const denied = await page.request.get(`${apiBase()}/conso-sheet/my/${outsiderSheetId}`, { headers: await authHeaders(page) })
      expect(denied.status(), 'a sheet from outside the consolidator group must stay hidden').toBe(404)

      await page.goto(`/consolidation-my/${outsiderSheetId}/details`)
      await expect(page.locator('#error-layout-card')).toBeVisible({ timeout: 20_000 })
      await expect(page.locator('#error-layout-card')).toContainText('Esta página no pudo ser encontrada')
    } finally {
      const deleted = await request.delete(`${apiBase()}/conso-sheet/my/${outsiderSheetId}`, { headers: adminHeaders })
      expect(deleted.ok(), await deleted.text()).toBeTruthy()
    }
  })

  test('editing one field sends only that field', async ({ page, request }) => {
    test.skip(!camSheetId, 'no sheet was captured')

    const login2 = await request.post(`${apiBase()}/auth/login`, {
      data: { email: CONSO2.email, password: CONSO2.password },
    })
    const headers2 = { Accept: 'application/json', Authorization: `Bearer ${(await login2.json()).access_token}` }
    const conso2User = await (await request.post(`${apiBase()}/auth/user`, { headers: headers2 })).json()
    const cam = orgIdByName(conso2User.orgs ?? [], 'CAM')

    const created = await request.post(`${apiBase()}/church-member/my`, {
      headers: headers2,
      data: { org_id: cam, conso_sheet_id: camSheetId, name: 'partial patch', last_name: 'keep me' },
    })
    expect(created.ok(), await created.text()).toBeTruthy()
    const scratchId = Number((await created.json()).data.id)

    try {
      await login(page, CONSO1)
      await page.goto(`/church-member-my/${scratchId}`)
      // The button is SSR-rendered: without the hydration wait the first click
      // is dropped and the dialog never opens.
      await waitForApp(page)
      await page.waitForLoadState('networkidle')
      await page.locator('#cmm-edit-btn').click()
      await page.locator('#cmm-dialog-name').fill('Only Name Sent')

      const [put] = await Promise.all([
        page.waitForRequest(req => req.method() === 'PUT' && req.url().includes(`/church-member/my/${scratchId}`)),
        page.locator('#cmm-dialog-save-btn').click(),
      ])
      const sent = JSON.parse(put.postData() ?? '{}')
      const response = await put.response()
      const responseBody = (await response?.text()) ?? ''
      expect(Object.keys(sent), 'only the touched field travels').toEqual(['name'])
      expect(sent.name, `sent body: ${JSON.stringify(sent)}`).toBe('Only Name Sent')
      expect(response?.status(), `response: ${responseBody}`).toBe(200)

      // The other consolidator's field survives the save.
      const after = await (await request.get(`${apiBase()}/church-member/my/${scratchId}`, { headers: headers2 })).json()
      expect(after.name, `sent=${JSON.stringify(sent)} after=${JSON.stringify(after)}`).toBe('Only Name Sent')
      expect(after.last_name).toBe('Keep Me')
    } finally {
      const deleted = await request.delete(`${apiBase()}/church-member/my/${scratchId}`, { headers: headers2 })
      expect(deleted.ok(), await deleted.text()).toBeTruthy()
    }
  })

  test('conso2 cleans up the captured sheets and member', async ({ page }) => {
    await login(page, CONSO2)
    const headers = await authHeaders(page)
    if (memberId) {
      const deleted = await page.request.delete(`${apiBase()}/church-member/my/${memberId}`, { headers })
      expect(deleted.ok(), await deleted.text()).toBeTruthy()
    }
    for (const sheetId of [camSheetId, comSheetId].filter(Boolean)) {
      const deleted = await page.request.delete(`${apiBase()}/conso-sheet/my/${sheetId}`, { headers })
      expect(deleted.ok(), await deleted.text()).toBeTruthy()
    }
  })
})
