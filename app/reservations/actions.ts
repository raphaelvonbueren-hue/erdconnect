'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createReservation(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const listing_id = formData.get('listing_id') as string
  const quantity = Number(formData.get('quantity'))
  const pickup_date = formData.get('pickup_date') as string
  const message = formData.get('message') as string
  const { error } = await supabase.from('reservations').insert({
    listing_id, buyer_id: user.id, quantity_reserved: quantity,
    pickup_date: pickup_date || null, message: message || null, status: 'pending',
  })
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath(`/listing/${listing_id}`)
  return { success: true }
}

export async function updateReservationStatus(reservationId: string, status: 'accepted' | 'rejected' | 'completed') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { error } = await supabase.from('reservations').update({ status, updated_at: new Date().toISOString() }).eq('id', reservationId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}