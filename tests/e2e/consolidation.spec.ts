import { test, expect } from '@playwright/test'
import { apiBase, authHeaders, loginOrSkip } from './helpers/auth'

test.describe.serial('Consolidation members', () => {
  let sheetId = ''
  let folio = ''
  let memberName = ''
  let editedName = ''
  let canDelete = false

  test.beforeEach(async ({ page }) => {
    await loginOrSkip(page)
  })

  test('logs in as admin', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('verifies permissions', async ({ page }) => {
    await page.goto('/account')
    await expect(page.locator('#acc-permissions-card')).toBeVisible()
    await expect(page.locator('#acc-permissions-card').getByText('conso-sheet-create', { exact: true })).toBeVisible()
    canDelete = await page.locator('#acc-permissions-card').getByText('conso-sheet-delete', { exact: true }).isVisible()
  })

  test('creates a consolidation', async ({ page }) => {
    await page.goto('/consolidation')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#cnsld-new-btn')).toBeVisible()
    const headers = await authHeaders(page)
    const organizations = await page.request.get(`${apiBase()}/organization`, { headers })
    const payload = await organizations.json()
    const items = Array.isArray(payload) ? payload : (payload.data?.data ?? payload.data ?? [])
    expect(items.length).toBeGreaterThan(0)
    folio = `E2E-${Date.now()}`
    const response = await page.request.post(`${apiBase()}/conso-sheet`, {
      headers,
      data: { org_id: items[0].id, folio_number: folio, date: new Date().toISOString().slice(0, 10) },
    })
    expect(response.ok(), await response.text()).toBeTruthy()
    const result = await response.json()
    sheetId = String(result.data?.data?.id ?? result.data?.id ?? result.id)
    expect(sheetId).toMatch(/^\d+$/)
  })

  test('manages a member', async ({ page }) => {
    await page.goto(`/consolidation/${sheetId}/details`)
    await page.waitForLoadState('networkidle')
    memberName = `E2E Member ${Date.now()}`
    await page.locator('#cnsld-new-member-btn').click()
    const dialog = page.locator('#det-member-dlg')
    await dialog.getByRole('textbox', { name: 'Nombre' }).fill(memberName)
    await dialog.getByRole('textbox', { name: 'Apellido Paterno' }).fill('Test')

    // ---- photo upload through MyUploadimageCrop (random generated image) ----
    // Random 160x160 PNG built in the browser (8px hsl blocks, random hue), so
    // every run uploads different bytes without shipping a fixture file.
    const randomPngBase64 = await page.evaluate(() => {
      const canvas = document.createElement('canvas')
      canvas.width = 160
      canvas.height = 160
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('canvas 2d context unavailable')
      for (let y = 0; y < canvas.height; y += 8) {
        for (let x = 0; x < canvas.width; x += 8) {
          ctx.fillStyle = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
          ctx.fillRect(x, y, 8, 8)
        }
      }
      return canvas.toDataURL('image/png').split(',')[1] ?? ''
    })
    expect(randomPngBase64.length).toBeGreaterThan(0)

    // The component's file input is hidden; setInputFiles drives the same
    // `change` handler the picker button would.
    await dialog.locator('input[type="file"]').setInputFiles({
      name: `e2e-random-${Date.now()}.png`,
      mimeType: 'image/png',
      buffer: Buffer.from(randomPngBase64, 'base64'),
    })

    const cropDialog = page.locator('#my-uploa-dlg-1')
    await expect(cropDialog).toBeVisible()
    // The right-hand preview only renders once the cropper emitted its first
    // change; saving before that would emit a null blob.
    await expect(cropDialog.locator('div.rounded-circle img')).toBeVisible()
    await cropDialog.locator('#my-uploadimagecrop-save-btn').click()
    await expect(cropDialog).toBeHidden()

    // Regression guard for the overwritten-onload bug: the picked image has to
    // reach the parent as a data URL, which is what shows the avatar preview.
    await expect(dialog.locator('#my-uploadimagecrop-clear-btn')).toBeVisible()
    await expect(dialog.locator('.v-avatar img')).toHaveAttribute('src', /^data:image\//)

    await page.locator('#cmm-dialog-save-btn').click()
    // 15s: the create now also ships the photo to S3 on the server side.
    await expect(page.getByRole('row').filter({ hasText: memberName })).toHaveCount(1, { timeout: 15_000 })
    editedName = `${memberName}X`
    const headers = await authHeaders(page)
    const response = await page.request.get(`${apiBase()}/church-member?itemsPerPage=-1`, { headers })
    const payload = await response.json()
    const items = Array.isArray(payload) ? payload : (payload.data?.data ?? payload.data ?? [])
    const member = items.find((item: { name: string }) => item.name === memberName)
    expect(member).toBeTruthy()
    const update = await page.request.put(`${apiBase()}/church-member/${member.id}`, {
      headers,
      data: { name: editedName, last_name: 'Test', conso_sheet_id: sheetId },
    })
    expect(update.ok(), await update.text()).toBeTruthy()
    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: editedName })).toHaveCount(1)
    const deleteMember = await page.request.delete(`${apiBase()}/church-member/${member.id}`, { headers })
    expect(deleteMember.ok(), await deleteMember.text()).toBeTruthy()
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('row').filter({ hasText: editedName })).toHaveCount(0, { timeout: 15_000 })
  })

  test('deletes the sheet', async ({ page }) => {
    test.skip(!canDelete, 'Account lacks conso-sheet-delete permission')
    await page.goto('/consolidation')
    await page.waitForLoadState('networkidle')
    const headers = await authHeaders(page)
    const response = await page.request.delete(`${apiBase()}/conso-sheet/${sheetId}`, { headers })
    expect(response.ok(), await response.text()).toBeTruthy()
    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: folio })).toHaveCount(0)
  })
})
