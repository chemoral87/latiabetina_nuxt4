/**
 * Consolidator Group E2E
 *
 * Flow:
 *   E2E_EMAIL  — creates a consolidator group containing E2E_EMAIL2 and E2E_EMAIL3
 *   E2E_EMAIL2 — creates a conso-sheet, adds a member, then logs out
 *   E2E_EMAIL3 — opens /tracking and verifies the member is visible
 *
 * Requirements in .env.test:
 *   E2E_EMAIL / E2E_PASSWORD   — group admin (consolidator-group-manage,
 *                                 conso-sheet-index, church-member-consolidator-assign)
 *   E2E_EMAIL2 / E2E_PASSWORD2 — consolidator A (conso-sheet-create, conso-sheet-index)
 *   E2E_EMAIL3 / E2E_PASSWORD3 — consolidator B (conso-sheet-index)
 *   All three must share the same org.
 */
import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { apiBase, authHeaders, permittedOrgFor, login } from './helpers/auth'

// ── env helpers ────────────────────────────────────────────────────────────

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

const EMAIL1 = env('E2E_EMAIL')
const PASS1 = env('E2E_PASSWORD')
const EMAIL2 = env('E2E_EMAIL2')
const PASS2 = env('E2E_PASSWORD2')
const EMAIL3 = env('E2E_EMAIL3')
const PASS3 = env('E2E_PASSWORD3')

function hasAllCredentials() {
  return Boolean(EMAIL1 && PASS1 && EMAIL2 && PASS2 && EMAIL3 && PASS3)
}

// ── utilities ──────────────────────────────────────────────────────────────

async function waitForApp(page: Page) {
  await page.waitForFunction(() => Boolean((document.getElementById('__nuxt') as { __vue_app__?: unknown } | null)?.__vue_app__))
}

async function getUserId(page: Page, email: string, token: string): Promise<number> {
  const res = await page.request.get(`${apiBase()}/user?filter=${encodeURIComponent(email)}&itemsPerPage=5`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  })
  expect(res.ok(), `GET /user failed: ${await res.text()}`).toBeTruthy()
  const body = await res.json()
  const items: { id: number; email: string }[] = Array.isArray(body) ? body : (body.data?.data ?? body.data ?? [])
  const found = items.find(u => u.email === email)
  expect(found, `User ${email} not found via API`).toBeTruthy()
  return found!.id
}

// ── shared state across serial tests ──────────────────────────────────────

let groupId = 0
let groupName = ''
let sheetId = ''
let memberName = ''
let orgId = 0

// ── spec ───────────────────────────────────────────────────────────────────

test.describe.serial('Consolidator Group flow', () => {
  test.skip(!hasAllCredentials(), 'Set E2E_EMAIL/2/3 + E2E_PASSWORD/2/3 in .env.test to run this suite')

  // ── STEP 1: E2E_EMAIL creates the group ──────────────────────────────────

  test('EMAIL1 creates a consolidator group with EMAIL2 and EMAIL3', async ({ page }) => {
    await login(page, { email: EMAIL1, password: PASS1 })
    const headers = await authHeaders(page)

    // Resolve a shared org
    const sharedOrg = await permittedOrgFor(page, 'consolidator-group-manage')
    expect(sharedOrg, 'EMAIL1 needs consolidator-group-manage on at least one org').toBeTruthy()
    orgId = sharedOrg!

    // Resolve user IDs for EMAIL2 and EMAIL3
    const token = (await page.context().cookies()).find(c => c.name === 'auth.token')?.value ?? ''
    const uid2 = await getUserId(page, EMAIL2, token)
    const uid3 = await getUserId(page, EMAIL3, token)

    // Create the group via API
    groupName = `E2E Group ${Date.now()}`
    const createRes = await page.request.post(`${apiBase()}/consolidator-group`, {
      headers,
      data: { name: groupName, org_id: orgId },
    })
    expect(createRes.ok(), await createRes.text()).toBeTruthy()
    const created = await createRes.json()
    groupId = created.data?.id ?? created.id
    expect(groupId).toBeGreaterThan(0)

    // Add EMAIL2 and EMAIL3 as members
    const syncRes = await page.request.put(`${apiBase()}/consolidator-group/${groupId}/members`, { headers, data: { user_ids: [uid2, uid3] } })
    expect(syncRes.ok(), await syncRes.text()).toBeTruthy()

    // Verify members returned
    const syncBody = await syncRes.json()
    const memberIds: number[] = (syncBody.data?.users ?? []).map((u: { id: number }) => u.id)
    expect(memberIds).toContain(uid2)
    expect(memberIds).toContain(uid3)

    // Log out EMAIL1
    await page.goto('/logout')
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
  })

  // ── STEP 2: E2E_EMAIL2 creates a conso-sheet and adds a member ───────────

  test('EMAIL2 creates a conso-sheet and adds a member', async ({ page }) => {
    await login(page, { email: EMAIL2, password: PASS2 })
    const headers = await authHeaders(page)

    // Verify EMAIL2 has an org in common with EMAIL1
    const email2Org = await permittedOrgFor(page, 'conso-sheet-create')
    expect(email2Org, 'EMAIL2 needs conso-sheet-create on a shared org').toBeTruthy()

    // Create conso-sheet via API
    const folio = `E2E-GRP-${Date.now()}`
    const sheetRes = await page.request.post(`${apiBase()}/conso-sheet`, {
      headers,
      data: {
        org_id: email2Org,
        folio_number: folio,
        date: new Date().toISOString().slice(0, 10),
      },
    })
    expect(sheetRes.ok(), await sheetRes.text()).toBeTruthy()
    const sheetBody = await sheetRes.json()
    sheetId = String(sheetBody.data?.data?.id ?? sheetBody.data?.id ?? sheetBody.id)
    expect(sheetId).toMatch(/^\d+$/)

    // Open the details page and add a member through the UI
    await page.goto(`/consolidation/${sheetId}/details`)
    await waitForApp(page)
    await expect(page.locator('#cnsld-new-member-btn')).toBeVisible()
    await page.locator('#cnsld-new-member-btn').click()

    const dialog = page.locator('#det-member-dlg')
    await expect(dialog).toBeVisible()

    memberName = `E2EGrp ${Date.now()}`
    await dialog.getByRole('textbox', { name: 'Nombre' }).fill(memberName)
    await dialog.getByRole('textbox', { name: 'Apellido Paterno' }).fill('GroupTest')
    await page.locator('#cmm-dialog-save-btn').click()

    // Wait for the row to appear — member was saved
    await expect(page.getByRole('row').filter({ hasText: memberName }), 'Member row should appear after save').toHaveCount(1, { timeout: 15_000 })

    // Log out EMAIL2
    await page.goto('/logout')
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
  })

  // ── STEP 3: E2E_EMAIL3 sees the member on /tracking ──────────────────────

  test('EMAIL3 can see the member on the tracking page', async ({ page }) => {
    await login(page, { email: EMAIL3, password: PASS3 })

    await page.goto('/tracking')
    await waitForApp(page)
    await expect(page.locator('#seg-index-filter')).toBeVisible()

    // Clear the status filter (default "ACTIVO") so we don't miss it and
    // search by the member name we just created.
    await page.locator('#seg-index-filter').fill(memberName.split(' ')[0])

    // Trigger refresh
    await page.locator('#seg-refresh-btn').click()

    // Wait for the row
    await expect(page.getByRole('row').filter({ hasText: memberName }), `EMAIL3 should see member "${memberName}" in tracking`).toHaveCount(1, { timeout: 20_000 })
  })

  // ── Cleanup: EMAIL1 deletes the group ────────────────────────────────────

  test('EMAIL1 cleans up the group', async ({ page }) => {
    test.skip(groupId === 0, 'Group was not created — nothing to clean up')
    await login(page, { email: EMAIL1, password: PASS1 })
    const headers = await authHeaders(page)

    const res = await page.request.delete(`${apiBase()}/consolidator-group/${groupId}`, { headers })
    expect(res.ok(), await res.text()).toBeTruthy()
  })
})
