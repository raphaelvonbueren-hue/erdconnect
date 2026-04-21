import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient('https://lzxtpsmskfbkuxgcfjcb.supabase.co','sb_publishable_bx8WrYU3mtBanNtERP8NPg_t1H4qNGE',{cookies:{getAll(){return cookieStore.getAll()},setAll(x){try{x.forEach(({name,value,options})=>cookieStore.set(name,value,options))}catch{}}}})
}
