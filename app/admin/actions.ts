'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, ADMIN_EMAIL } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/')
}

export async function togglePremium(formData: FormData) {
  await requireAdmin()
  const admin = createAdminClient()
  const userId = formData.get('userId') as string
  const setPremium = formData.get('setPremium') === 'true'
  await admin.from('profiles').upsert({ id: userId, is_premium: setPremium }, { onConflict: 'id' })
  revalidatePath('/admin/users')
}

export async function addTransportCompany(formData: FormData) {
  await requireAdmin()
  const admin = createAdminClient()
  const materials = formData.getAll('materials') as string[]
  const lat = formData.get('latitude') as string
  const lng = formData.get('longitude') as string
  const { error } = await admin.from('transport_companies').insert({
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    location: formData.get('location') as string,
    latitude: lat ? Number(lat) : null,
    longitude: lng ? Number(lng) : null,
    base_fee: Number(formData.get('base_fee') || 0),
    price_per_km: Number(formData.get('price_per_km') || 0),
    min_volume_m3: formData.get('min_volume_m3') ? Number(formData.get('min_volume_m3')) : null,
    max_volume_m3: formData.get('max_volume_m3') ? Number(formData.get('max_volume_m3')) : null,
    materials,
    active: true,
  })
  if (error) throw error
  revalidatePath('/admin/transport')
}

export async function deleteTransportCompany(formData: FormData) {
  await requireAdmin()
  const admin = createAdminClient()
  await admin.from('transport_companies').delete().eq('id', formData.get('id') as string)
  revalidatePath('/admin/transport')
}

export async function toggleTransportActive(formData: FormData) {
  await requireAdmin()
  const admin = createAdminClient()
  const id = formData.get('id') as string
  const active = formData.get('active') === 'true'
  await admin.from('transport_companies').update({ active }).eq('id', id)
  revalidatePath('/admin/transport')
}
