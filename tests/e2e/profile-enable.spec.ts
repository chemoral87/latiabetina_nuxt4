import { test, expect } from '@playwright/test'
import { E2E_EMAIL, apiBase, authHeaders, loginOrSkip, logoutLogin } from './helpers/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function items(payload: any) {
  return Array.isArray(payload) ? payload : (payload.data?.data ?? payload.data ?? [])
}

test.describe.serial('Profile enable/disable on account', () => {
  let userId = ''
  let camOrgId = ''
  let consolidadorId = ''
  let consolidadorRoleName = ''
  let profileId = ''
  let createdProfile = false
  let originalEndDate: string | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalRoleIds: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalPermIds: any[] = []
  let consolidadorOnlyInCam = false
  let hasCamPerm = false

  test.beforeEach(async ({ page }) => {
    await loginOrSkip(page)
  })

  test('prepares disabled CAM profile with role consolidador', async ({ page }) => {
    const headers = await authHeaders(page)

    const users = items(
      await (await page.request.get(`${apiBase()}/user?filter=${encodeURIComponent(E2E_EMAIL)}&itemsPerPage=10&sortBy%5B%5D=id&sortDesc%5B%5D=false`, { headers })).json()
    )
    const user = users.find((u: { email: string }) => u.email === E2E_EMAIL)
    expect(user, `user ${E2E_EMAIL}`).toBeTruthy()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userId = String((user as any).id)

    const orgs = items(await (await page.request.get(`${apiBase()}/organization?itemsPerPage=100`, { headers })).json())
    const cam =
      orgs.find((o: { short_code?: string; name?: string }) => String(o.short_code ?? '').toUpperCase() === 'CAM') ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orgs.find((o: any) => String(o.name ?? '').toUpperCase() === 'CAM')
    expect(cam, 'org CAM').toBeTruthy()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    camOrgId = String((cam as any).id)

    const roles = items(await (await page.request.get(`${apiBase()}/role?itemsPerPage=100&sortBy%5B%5D=id&sortDesc%5B%5D=false`, { headers })).json())
    const role = roles.find((r: { name: string }) => r.name.toLowerCase() === 'consolidador')
    expect(role, 'role consolidador').toBeTruthy()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    consolidadorId = String((role as any).id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    consolidadorRoleName = (role as any).name

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profiles: any[] = items(await (await page.request.get(`${apiBase()}/profile/${userId}`, { headers })).json())
    consolidadorOnlyInCam = !profiles.some(
      p =>
        String(p.org_id) !== camOrgId &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p.roles ?? []).some((r: any) => String(r.name).toLowerCase() === 'consolidador')
    )

    const existing = profiles.find(p => String(p.org_id) === camOrgId)
    if (existing) {
      profileId = String(existing.id)
    } else {
      const created = await page.request.post(`${apiBase()}/profile/${userId}`, {
        headers,
        data: { org_id: Number(camOrgId) },
      })
      expect(created.ok(), await created.text()).toBeTruthy()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profileId = String(((await created.json()) as any).profile.id)
      createdProfile = true
    }

    const show = await (await page.request.get(`${apiBase()}/profile/${userId}/${profileId}`, { headers })).json()
    originalEndDate = createdProfile ? null : (show.end_date ?? null)
    originalRoleIds = createdProfile ? [] : (show.roles ?? []).map((r: { id: number }) => r.id)
    originalPermIds = createdProfile ? [] : (show.direct_permissions ?? []).map((p: { id: number }) => p.id)

    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
    const disable = await page.request.put(`${apiBase()}/profile/${userId}/${profileId}`, {
      headers,
      data: { role_ids: [Number(consolidadorId)], permissions_ids: originalPermIds, end_date: yesterday },
    })
    expect(disable.ok(), await disable.text()).toBeTruthy()
    const check = await (await page.request.get(`${apiBase()}/profile/${userId}/${profileId}`, { headers })).json()
    expect(check.end_date, 'profile end_date is yesterday (disabled)').toBe(yesterday)
  })

  test('disabled — /account shows no CAM role', async ({ page }) => {
    await page.goto('/account')
    await page.waitForLoadState('networkidle')
    await expect(page.locator(`#chip-acc-role-org-${camOrgId}`)).toHaveCount(0)
    await expect(page.locator(`#chip-acc-permission-org-${camOrgId}`)).toHaveCount(0)
    if (consolidadorOnlyInCam) {
      await expect(page.locator(`#chip-acc-role-${consolidadorRoleName}`)).toHaveCount(0)
    }
  })

  test('enabled — /account shows CAM role again', async ({ page }) => {
    const headers = await authHeaders(page)
    const enable = await page.request.put(`${apiBase()}/profile/${userId}/${profileId}`, {
      headers,
      data: { role_ids: [Number(consolidadorId)], permissions_ids: originalPermIds, end_date: null },
    })
    expect(enable.ok(), `enable failed: ${await enable.text()}`).toBeTruthy()

    const userShow = await (await page.request.get(`${apiBase()}/user/${userId}`, { headers })).json()
    hasCamPerm = Object.values(userShow.permissions_org ?? {}).some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v: any) => Array.isArray(v) && v.includes(Number(camOrgId))
    )

    await logoutLogin(page)
    await page.goto('/account')
    await page.waitForLoadState('networkidle')
    await expect(page.locator(`#chip-acc-role-org-${camOrgId}`).first()).toBeVisible()
    if (consolidadorOnlyInCam) {
      await expect(page.locator(`#chip-acc-role-${consolidadorRoleName}`).first()).toBeVisible()
    }
    if (hasCamPerm) {
      await expect(page.locator(`#chip-acc-permission-org-${camOrgId}`).first()).toBeVisible()
    }
  })

  test('restores profile', async ({ page }) => {
    const headers = await authHeaders(page)
    const restore = await page.request.put(`${apiBase()}/profile/${userId}/${profileId}`, {
      headers,
      data: { role_ids: originalRoleIds, permissions_ids: originalPermIds, end_date: originalEndDate },
    })
    expect(restore.ok(), await restore.text()).toBeTruthy()
    if (createdProfile) {
      const del = await page.request.delete(`${apiBase()}/profile/${userId}/${profileId}`, { headers })
      expect(del.ok(), await del.text()).toBeTruthy()
    }
  })
})
