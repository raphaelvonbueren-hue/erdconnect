'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(address + ', Schweiz')
    const res = await fetch(url, { headers: { 'User-Agent': 'ErdConnect/1.0' }, next: { revalidate: 0 } })
    const data = await res.json()
    if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {}
  return null
}

export async function createListing(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const location = formData.get('location') as string
  const coords = await geocode(location)

  const payload = {
    user_id: user.id,
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    material_type: formData.get('material_type') as string,
    listing_type: formData.get('listing_type') as string,
    total_quantity: Number(formData.get('total_quantity')),
    unit: formData.get('unit') as string,
    price_type: formData.get('price_type') as string,
    price_per_unit: formData.get('price_type') === 'gratis' ? 0 : Number(formData.get('price_per_unit') || 0),
    location,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    access_type: formData.get('access_type') as string,
    loading_type: formData.get('loading_type') as string,
    status: 'active',
  }

  const { error } = await supabase.from('listings').insert(payload)
  if (error) redirect('/inserat/neu?error=' + encodeURIComponent(error.message))

  revalidatePath('/')
  redirect('/dashboard?success=1')
}

export async function deleteListing(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  await supabase.from('listings').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/')
  revalidatePath('/dashboard')
}