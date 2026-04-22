import { createClient } from '@supabase/supabase-js'

export const ADMIN_EMAIL = 'raphael.von.bueren@psp.live'

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
  return createClient(
    'https://lzxtpsmskfbkuxgcfjcb.supabase.co',
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
