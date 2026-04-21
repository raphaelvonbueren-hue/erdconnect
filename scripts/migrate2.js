const { chromium } = require('C:/Users/rapha/AppData/Local/npm-cache/_npx/705bc6b22212b352/node_modules/playwright')

const SQL = [
  "alter table listings drop constraint if exists listings_type_check;",
  "update listings set type = 'offer' where type = 'angebot';",
  "update listings set type = 'request' where type = 'suche';",
  "update listings set type = 'offer' where type not in ('offer','request') or type is null;",
  "alter table listings add constraint listings_type_check check (type in ('offer','request'));",
  "select type, count(*) from listings group by type;",
].join('\n')

const PROJECT_REF = 'lzxtpsmskfbkuxgcfjcb'
const SQL_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`
const TEMP_PROFILE = 'C:/Users/rapha/AppData/Local/Temp/pw_profile'

;(async () => {
  const browser = await chromium.launchPersistentContext(TEMP_PROFILE, { headless: false, timeout: 30000 })
  const page = browser.pages()[0] || await browser.newPage()
  await page.goto(SQL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2000)

  if (page.url().includes('sign-in') || page.url().includes('login')) {
    console.log('Bitte einloggen... (60s)')
    await page.waitForURL(`**/${PROJECT_REF}/**`, { timeout: 60000 })
    await page.waitForTimeout(2000)
  }

  await page.waitForSelector('.monaco-editor', { timeout: 20000 })
  const editor = page.locator('.monaco-editor').first()
  await editor.click()
  await page.keyboard.press('Control+a')
  await page.keyboard.type(SQL)
  await page.waitForTimeout(500)
  await page.keyboard.press('Control+Enter')
  await page.waitForTimeout(4000)

  await page.screenshot({ path: 'C:/Users/rapha/Desktop/constraint_fix2.png' })
  console.log('Fertig! Screenshot: Desktop/constraint_fix2.png')
  await browser.close()
})()
