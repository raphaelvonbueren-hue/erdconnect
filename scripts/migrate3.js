const { chromium } = require('C:/Users/rapha/AppData/Local/npm-cache/_npx/705bc6b22212b352/node_modules/playwright')

const SQL = [
  `create table if not exists transport_companies (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now(),
    user_id uuid references auth.users on delete set null,
    name text not null,
    description text,
    email text,
    phone text,
    location text not null,
    latitude float8,
    longitude float8,
    base_fee numeric(10,2) not null default 0,
    price_per_km numeric(10,2) not null default 0,
    min_volume_m3 numeric(10,2),
    max_volume_m3 numeric(10,2),
    materials text[] not null default '{}',
    active boolean not null default true
  );`,
  `alter table transport_companies enable row level security;`,
  `drop policy if exists "transport_public_read" on transport_companies;`,
  `drop policy if exists "transport_owner_all" on transport_companies;`,
  `create policy "transport_public_read" on transport_companies for select using (active = true);`,
  `create policy "transport_owner_all" on transport_companies for all using (auth.uid() = user_id);`,
  `insert into transport_companies (name, description, email, phone, location, latitude, longitude, base_fee, price_per_km, materials, active) values
    ('Müller Transport AG', 'Spezialist für Aushub und Erdmaterial in der Region Zürich', 'info@mueller-transport.ch', '+41 44 123 45 67', 'Zürich', 47.3769, 8.5417, 150, 2.50, ARRAY['humus','aushub','kies','beton','andere'], true),
    ('Kistler Transporte GmbH', 'Kies- und Schottertransporte in der Deutschschweiz', 'info@kistler-transporte.ch', '+41 31 234 56 78', 'Bern', 46.9481, 7.4474, 120, 2.20, ARRAY['kies','aushub','beton'], true),
    ('Grüner Transport AG', 'Nachhaltige Transporte für Grünmaterial und Humus', 'info@gruener-transport.ch', '+41 61 345 67 89', 'Basel', 47.5596, 7.5886, 100, 1.90, ARRAY['gruenmaterial','humus','andere'], true),
    ('Schneider Erdbau', 'Erdbewegungen und Materialtransport Ostschweiz', 'info@schneider-erdbau.ch', '+41 71 456 78 90', 'St. Gallen', 47.4245, 9.3767, 130, 2.30, ARRAY['humus','aushub','kies','gruenmaterial','beton','andere'], true)
  on conflict do nothing;`,
  `select name, location, base_fee, price_per_km from transport_companies;`,
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
  await page.waitForTimeout(5000)

  await page.screenshot({ path: 'C:/Users/rapha/Desktop/migrate3_result.png' })
  console.log('Fertig! Screenshot: Desktop/migrate3_result.png')
  await browser.close()
})()
