const { chromium } = require('C:/Users/rapha/AppData/Local/npm-cache/_npx/705bc6b22212b352/node_modules/playwright')

const SQL = [
  `create table if not exists site_content (
    key text primary key,
    content text not null,
    updated_at timestamptz default now()
  );`,
  `alter table site_content enable row level security;`,
  `drop policy if exists "site_content_public_read" on site_content;`,
  `create policy "site_content_public_read" on site_content for select using (true);`,
  `insert into site_content (key, content) values (
    'home_intro',
    'ErdConnect verbindet Baustellen, Landwirte und Unternehmen, die überschüssiges Erdmaterial, Humus, Kies oder Grünmaterial anbieten oder suchen. Inserate kostenlos aufgeben, passende Angebote in deiner Region finden und Transportkosten sparen – ganz ohne Umwege.'
  ) on conflict (key) do nothing;`,
  `select key, content from site_content;`,
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

  await page.screenshot({ path: 'C:/Users/rapha/Desktop/migrate6_result.png' })
  console.log('Fertig! Screenshot: Desktop/migrate6_result.png')
  await browser.close()
})()
