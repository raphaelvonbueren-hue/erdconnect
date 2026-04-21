import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createReservation } from '@/app/reservations/actions'

type Props = { params: Promise<{ id: string }> }

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: listing } = await supabase.from('listings').select('*').eq('id', id).single()
  if (!listing) notFound()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: reservations } = user ? await supabase.from('reservations').select('*').eq('listing_id', id) : { data: null }

  const materialColors: Record<string, string> = {
    humus: '#4ade80', aushub: '#a78bfa', kies: '#fb923c',
    gruenmaterial: '#34d399', beton: '#94a3b8', andere: '#64748b',
  }
  const matColor = materialColors[listing.material] || '#94a3b8'

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; color: string }> = {
      pending: { label: 'Ausstehend', color: '#f59e0b' },
      accepted: { label: 'Akzeptiert', color: '#22c55e' },
      rejected: { label: 'Abgelehnt', color: '#ef4444' },
      completed: { label: 'Abgeschlossen', color: '#3b82f6' },
    }
    return map[s] || { label: s, color: '#94a3b8' }
  }

  const isOwner = user?.id === listing.user_id

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px', fontFamily: 'system-ui,sans-serif' }}>
      <Link href="/" style={{ color: '#22c55e', textDecoration: 'none', fontSize: 14 }}>← Zurück zur Übersicht</Link>

      <div style={{ marginTop: 24, background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ background: matColor, color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
            {listing.material}
          </span>
          <span style={{
            background: listing.type === 'offer' ? '#dcfce7' : '#fef3c7',
            color: listing.type === 'offer' ? '#166534' : '#92400e',
            borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600,
          }}>
            {listing.type === 'offer' ? 'Angebot' : 'Gesuch'}
          </span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', color: '#111' }}>{listing.title}</h1>

        <div style={{ display: 'flex', gap: 24, marginBottom: 20, color: '#555', fontSize: 14, flexWrap: 'wrap' }}>
          <span>📍 {listing.location}</span>
          <span>📦 {listing.total_quantity} m³</span>
          {listing.price > 0 ? <span>💰 CHF {listing.price}/m³</span> : <span>🤝 Gratis</span>}
        </div>

        {listing.description && (
          <p style={{ color: '#444', lineHeight: 1.7, marginBottom: 24, fontSize: 15 }}>{listing.description}</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', borderRadius: 8, padding: 20, marginBottom: 24 }}>
          {listing.access_type && (
            <div>
              <strong style={{ color: '#888', fontSize: 12, textTransform: 'uppercase' }}>Zufahrt</strong>
              <br /><span style={{ fontWeight: 600 }}>{listing.access_type}</span>
            </div>
          )}
          {listing.loading_type && (
            <div>
              <strong style={{ color: '#888', fontSize: 12, textTransform: 'uppercase' }}>Verlad</strong>
              <br /><span style={{ fontWeight: 600 }}>{listing.loading_type}</span>
            </div>
          )}
          {listing.unit && (
            <div>
              <strong style={{ color: '#888', fontSize: 12, textTransform: 'uppercase' }}>Einheit</strong>
              <br /><span style={{ fontWeight: 600 }}>{listing.unit}</span>
            </div>
          )}
          <div>
            <strong style={{ color: '#888', fontSize: 12, textTransform: 'uppercase' }}>Erstellt am</strong>
            <br /><span style={{ fontWeight: 600 }}>{new Date(listing.created_at).toLocaleDateString('de-CH')}</span>
          </div>
        </div>

        {!isOwner && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#14532d' }}>Reservierung anfragen</h2>
            {!user ? (
              <p style={{ color: '#555' }}>
                <Link href="/auth/login" style={{ color: '#22c55e', fontWeight: 600 }}>Einloggen</Link> um eine Reservierung anzufragen
              </p>
            ) : (
              <form action={async (fd) => { 'use server'; await createReservation(fd) }}>
                <input type="hidden" name="listing_id" value={listing.id} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 4 }}>
                      Menge (m³) *
                    </label>
                    <input name="quantity" type="number" required min="1" max={listing.total_quantity}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                      placeholder="z.B. 50" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 4 }}>
                      Wunschdatum
                    </label>
                    <input name="pickup_date" type="date"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 4 }}>
                    Nachricht (optional)
                  </label>
                  <textarea name="message" rows={3}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
                    placeholder="Kurze Beschreibung Ihres Projekts..." />
                </div>
                <button type="submit" style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  Reservierung anfragen
                </button>
              </form>
            )}
          </div>
        )}

        {isOwner && reservations && reservations.length > 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>
              Eingegangene Reservierungen ({reservations.length})
            </h2>
            {reservations.map((r: Record<string, unknown>) => {
              const badge = statusBadge(r.status as string)
              return (
                <div key={r.id as string} style={{ background: '#f8fafc', borderRadius: 8, padding: 16, marginBottom: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong>{r.quantity_reserved as number} m³</strong>
                    <span style={{ background: badge.color, color: '#fff', borderRadius: 5, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{badge.label}</span>
                  </div>
                  {(r.pickup_date as string) && (
                    <div style={{ fontSize: 13, color: '#666' }}>Datum: {new Date(r.pickup_date as string).toLocaleDateString('de-CH')}</div>
                  )}
                  {(r.message as string) && (
                    <div style={{ fontSize: 13, color: '#444', marginTop: 4 }}>{r.message as string}</div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          {isOwner && (
            <Link href="/inserat/neu" style={{ background: '#22c55e', color: '#fff', borderRadius: 8, padding: '10px 20px', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Neues Inserat
            </Link>
          )}
          <Link href="/dashboard" style={{ color: '#555', textDecoration: 'none', fontSize: 14 }}>
            Zum Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
