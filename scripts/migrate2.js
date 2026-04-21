const { chromium } = require('C:/Users/rapha/AppData/Local/npm-cache/_npx/705bc6b22212b352/node_modules/playwright')
const path = require('path')
const fs = require('fs')

const SQL = `alter table listings
  add column if not exists availability_type text,
  add column if not exists availability_date_from date,
  add column if not exists availability_date_to date,
  add column if not exists availability_quarter_from text,
  add column if not exists availability_quarter_to text,
  add column if not exists availability_window text;`

const PROJECT_REF = 'lzxtpsmskfbkuxgcfjcb'
const SQL_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`
const TEMP_PROFILE = 'C:/Users/rapha/AppData/Local/Temp/pw_profile'

;(async () => {
  console.log('Starte Chromium mit kopiertem Profil...')
  const browser = await chromium.launchPersistentContext(TEMP_PROFILE, {
    headless: false,
    args: ['--profile-directory=Default'],
    timeout: 30000,
  })

  const page = browser.pages()[0] || await browser.newPage()
  console.log('Navigiere zu:', SQL_URL)

  try {
    await page.goto(SQL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(3000)

    const url = page.url()
    console.log('Aktuelle URL:', url)

    if (url.includes('sign-in') || url.includes('login') || url.includes('auth')) {
      console.log('Nicht eingeloggt - Browser bleibt offen zum manuellen Login...')
      await page.waitForTimeout(30000)
    }

    // Wait for Monaco editor
    await page.waitForSelector('.monaco-editor', { timeout: 20000 })
    console.log('Editor gefunden, SQL wird eingefügt...')

    const editor = page.locator('.monaco-editor').first()
    await editor.click()
    await page.keyboard.press('Control+a')
    await page.keyboard.type(SQL)
    await page.waitForTimeout(500)

    console.log('Führe SQL aus (Ctrl+Enter)...')
    await page.keyboard.press('Control+Enter')
    await page.waitForTimeout(4000)

    // Try to read result
    const result = await page.locator('[data-testid="sql-editor-result"]').textContent({ timeout: 5000 }).catch(() => null)
    const success = await page.locator('.text-success, [class*="success"]').count().catch(() => 0)

    console.log(result ? `Resultat: ${result}` : success > 0 ? '✅ Erfolgreich!' : 'Ausgeführt - prüfe Browser')

    await page.screenshot({ path: 'C:/Users/rapha/Desktop/migration_result.png' })
    console.log('Screenshot gespeichert: Desktop/migration_result.png')

  } catch (e) {
    console.error('Fehler:', e.message)
    await page.screenshot({ path: 'C:/Users/rapha/Desktop/migration_error.png' }).catch(() => {})
    console.log('Screenshot gespeichert: Desktop/migration_error.png')
    await page.waitForTimeout(15000)
  }

  await browser.close()
})()
