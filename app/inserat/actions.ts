'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function geocode(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(address + ', Schweiz')
    const res = await fetch(url, { headers: { 'User-Agent': 'ErdConnect/1.0' }, next: { revalidate: 0 } })
    const data = await res.json()
    if (data[0]) return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }
  } catch {}
  return null
}

export async function createListing(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Enforce 3-listing limit for free users
  const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', user.id).single()
  if (!profile?.is_premium) {
    const { count } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active')
    if ((count ?? 0) >= 3) redirect('/inserat/neu?error=' + encodeURIComponent('Free-Konto: max. 3 aktive Inserate. Upgrade auf Premium für unbegrenzte Inserate.'))
  }

  const location = formData.get('location') as string
  const coords = await geocode(location)

  const availType = formData.get('availability_type') as string

  const payload = {
    user_id: user.id,
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    material: formData.get('material') as string,
    type: formData.get('type') as string,
    total_quantity: Number(formData.get('total_quantity')),
    unit: formData.get('unit') as string,
    price_type: formData.get('price_type') as string,
    price: formData.get('price_type') === 'gratis' ? 0 : Number(formData.get('price_per_unit') || 0),
    location,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    access_type: formData.get('access_type') as string,
    loading_type: formData.get('loading_type') as string,
    loading_cost_per_m3: formData.get('loading_cost_per_m3') !== '' ? Number(formData.get('loading_cost_per_m3') ?? null) : null,
    availability_type: availType,
    availability_date_from: availType === 'datum' ? (formData.get('availability_date_from') as string || null) : null,
    availability_date_to: availType === 'datum' ? (formData.get('availability_date_to') as string || null) : null,
    availability_quarter_from: availType === 'quartal' ? (formData.get('availability_quarter_from') as string || null) : null,
    availability_quarter_to: availType === 'quartal' ? (formData.get('availability_quarter_to') as string || null) : null,
    availability_window: (formData.getAll('availability_window') as string[]).join(',') || null,
    status: 'active',
  }

  const { error } = await supabase.from('listings').insert(payload)
  if (error) redirect('/inserat/neu?error=' + encodeURIComponent(error.message))

  revalidatePath('/')
  redirect('/dashboard?success=1')
}

export async function updateListing(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const id = formData.get('id') as string
  const location = formData.get('location') as string
  const coords = await geocode(location)
  const availType = formData.get('availability_type') as string

  const payload = {
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    material: formData.get('material') as string,
    type: formData.get('type') as string,
    total_quantity: Number(formData.get('total_quantity')),
    unit: formData.get('unit') as string,
    price_type: formData.get('price_type') as string,
    price: formData.get('price_type') === 'gratis' ? 0 : Number(formData.get('price_per_unit') || 0),
    location,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    access_type: formData.get('access_type') as string,
    loading_type: formData.get('loading_type') as string,
    loading_cost_per_m3: formData.get('loading_cost_per_m3') !== '' ? Number(formData.get('loading_cost_per_m3') ?? null) : null,
    availability_type: availType,
    availability_date_from: availType === 'datum' ? (formData.get('availability_date_from') as string || null) : null,
    availability_date_to: availType === 'datum' ? (formData.get('availability_date_to') as string || null) : null,
    availability_quarter_from: availType === 'quartal' ? (formData.get('availability_quarter_from') as string || null) : null,
    availability_quarter_to: availType === 'quartal' ? (formData.get('availability_quarter_to') as string || null) : null,
    availability_window: (formData.getAll('availability_window') as string[]).join(',') || null,
  }

  const { error } = await supabase.from('listings').update(payload).eq('id', id).eq('user_id', user.id)
  if (error) redirect(`/inserat/${id}/bearbeiten?error=` + encodeURIComponent(error.message))

  revalidatePath('/')
  revalidatePath(`/listing/${id}`)
  redirect('/dashboard?updated=1')
}

export async function deleteListing(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  await supabase.from('listings').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/')
  revalidatePath('/dashboard')
}
