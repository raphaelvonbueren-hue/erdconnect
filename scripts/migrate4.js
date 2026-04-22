const { chromium } = require('C:/Users/rapha/AppData/Local/npm-cache/_npx/705bc6b22212b352/node_modules/playwright')

const SQL = [
  `create table if not exists profiles (
    id uuid primary key references auth.users on delete cascade,
    created_at timestamptz default now(),
    is_premium boolean not null default false,
    premium_until timestamptz,
    display_name text,
    company_name text
  );`,
  `alter table profiles enable row level security;`,
  `drop policy if exists "profiles_public_read" on profiles;`,
  `drop policy if exists "profiles_self_write" on profiles;`,
  `create policy "profiles_public_read" on profiles for select using (true);`,
  `create policy "profiles_self_write" on profiles for all using (auth.uid() = id);`,
  `create or replace function handle_new_user()
   returns trigger language plpgsql security definer as $$
   begin
     insert into profiles (id) values (new.id) on conflict do nothing;
     return new;
   end;
   $$;`,
  `drop trigger if exists on_auth_user_created on auth.users;`,
  `create trigger on_auth_user_created
   after insert on auth.users
   for each row execute function handle_new_user();`,
  `insert into profiles (id) select id from auth.users on conflict do nothing;`,
  `select id, is_premium from profiles;`,
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

  await page.screenshot({ path: 'C:/Users/rapha/Desktop/migrate4_result.png' })
  console.log('Fertig! Screenshot: Desktop/migrate4_result.png')
  await browser.close()
})()
