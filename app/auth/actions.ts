'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) redirect('/auth/login?error=' + encodeURIComponent(error.message))
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: { full_name: formData.get('full_name') as string, account_type: formData.get('account_type') as string },
      emailRedirectTo: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/auth/callback',
    },
  })
  if (error) redirect('/auth/register?error=' + encodeURIComponent(error.message))
  redirect('/auth/verify-email')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: (process.env.NEXT_PUBLIC_SITE_URL || 'https://erdconnect.vercel.app') + '/auth/update-password',
  })
  if (error) redirect('/auth/reset-password?error=' + encodeURIComponent(error.message))
  redirect('/auth/reset-password?sent=1')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: formData.get('password') as string,
  })
  if (error) redirect('/auth/update-password?error=' + encodeURIComponent(error.message))
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}