const { chromium } = require('C:/Users/rapha/AppData/Local/npm-cache/_npx/705bc6b22212b352/node_modules/playwright')
const path = require('path')

const SQL = `
alter table listings
  add column if not exists availability_type text,
  add column if not exists availability_date_from date,
  add column if not exists availability_date_to date,
  add column if not exists availability_quarter_from text,
  add column if not exists availability_quarter_to text,
  add column if not exists availability_window text;
`

const PROJECT_REF = 'lzxtpsmskfbkuxgcfjcb'
const SQL_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`
const USER_DATA = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data')

;(async () => {
  console.log('Starte Chrome mit bestehendem Profil...')
  const browser = await chromium.launchPersistentContext(USER_DATA, {
    channel: 'chrome',
    headless: false,
    args: ['--profile-directory=Default'],
  })

  const page = browser.pages()[0] || await browser.newPage()
  console.log('Navigiere zu Supabase SQL Editor...')
  await page.goto(SQL_URL, { waitUntil: 'networkidle', timeout: 30000 })

  // Warte auf den SQL-Editor (Monaco Editor oder Textarea)
  console.log('Warte auf Editor...')
  try {
    // Supabase SQL editor uses Monaco - click the editor and type
    await page.waitForSelector('.monaco-editor', { timeout: 15000 })

    // Select all existing content and replace with our SQL
    const editor = page.locator('.monaco-editor').first()
    await editor.click()
    await page.keyboard.press('Control+a')
    await page.keyboard.type(SQL.trim())

    console.log('SQL eingefügt, führe aus...')
    await page.keyboard.press('Control+Enter')

    await page.waitForTimeout(3000)

    // Check for success/error messages
    const bodyText = await page.locator('body').textContent()
    if (bodyText.includes('Success') || bodyText.includes('success') || bodyText.includes('ALTER TABLE')) {
      console.log('✅ Migration erfolgreich!')
    } else if (bodyText.includes('error') || bodyText.includes('Error')) {
      console.log('⚠️ Möglicher Fehler - prüfe den Browser')
    } else {
      console.log('Migration ausgeführt - prüfe Browser für Resultat')
    }
  } catch (e) {
    console.error('Fehler:', e.message)
    console.log('Browser bleibt offen - führe SQL manuell aus')
    await page.waitForTimeout(60000)
  }

  await browser.close()
})()
