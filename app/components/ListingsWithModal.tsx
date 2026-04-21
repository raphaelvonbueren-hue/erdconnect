'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createReservation } from '@/app/reservations/actions'

type Listing = {
  id: string
  title: string
  material: string
  type: string
  location: string
  total_quantity: number
  price: number
  description?: string | null
  availability_type?: string | null
  availability_date_from?: string | null
  availability_date_to?: string | null
  availability_quarter_from?: string | null
  availability_quarter_to?: string | null
  availability_window?: string | null
  access_type?: string | null
  loading_type?: string | null
  unit?: string | null
  created_at: string
  user_id: string
  latitude?: number | null
  longitude?: number | null
  status?: string
}

const MAT_COLORS: Record<string, string> = {
  humus: '#4ade80', aushub: '#a78bfa', kies: '#fb923c',
  gruenmaterial: '#34d399', beton: '#94a3b8', andere: '#64748b',
}

const QUARTER_MONTH: Record<string, number> = { Q1: 0, Q2: 3, Q3: 6, Q4: 9 }

function availLabel(l: Listing): string {
  const t = l.availability_type as string | null
  if (!t || t === 'sofort') return 'Ab sofort'
  if (t === 'datum' && l.availability_date_from) {
    const from = new Date(l.availability_date_from as string).toLocaleDateString('de-CH')
    const to = l.availability_date_to
      ? ' – ' + new Date(l.availability_date_to as string).toLocaleDateString('de-CH') : ''
    return from + to
  }
  if (t === 'quartal' && l.availability_quarter_from) {
    const from = l.availability_quarter_from as string
    const to = l.availability_quarter_to && l.availability_quarter_to !== from
      ? ' – ' + l.availability_quarter_to : ''
    return from + to
  }
  return ''
}

const WINDOW_LABEL: Record<string, string> = {
  ganzer_tag: 'Ganzer Tag (flexibel)',
  morgens: 'Morgens (7–12 Uhr)',
  nachmittags: 'Nachmittags (12–17 Uhr)',
  nach_absprache: 'Nach Absprache',
}

function ListingModal({ listing, userId, onClose }: {
  listing: Listing, userId?: string, onClose: () => void
}) {
  const isOwner = userId && userId === listing.user_id
  const isSofort = !listing.availability_type || listing.availability_type === 'sofort'
  const avail = availLabel(listing)
  const matColor = MAT_COLORS[listing.material as string] || '#94a3b8'

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        zIndex: 2000, backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.15s ease',
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(560px, 100vw)',
        background: '#fff', zIndex: 2001,
        boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
        overflowY: 'auto', overflowX: 'hidden',
        animation: 'slideIn 0.2s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, background: '#fff', zIndex: 10,
          borderBottom: '1px solid #f1f5f9', padding: '16px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              background: matColor, color: '#fff', borderRadius: 5,
              padding: '3px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            }}>{listing.material as string}</span>
            <span style={{
              background: listing.type === 'offer' ? '#dcfce7' : '#fef3c7',
              color: listing.type === 'offer' ? '#166534' : '#92400e',
              borderRadius: 5, padding: '3px 10px', fontSize: 11, fontWeight: 600,
            }}>{listing.type === 'offer' ? 'Angebot' : 'Gesuch'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href={`/listing/${listing.id as string}`}
              style={{ fontSize: 12, color: '#64748b', textDecoration: 'none', padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 6 }}>
              Vollansicht ↗
            </Link>
            <button onClick={onClose} style={{
              background: '#f1f5f9', border: 'none', borderRadius: 8,
              width: 32, height: 32, cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151',
            }}>×</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 24px 40px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px', color: '#0f172a', lineHeight: 1.3 }}>
            {listing.title as string}
          </h1>

          {/* Key facts row */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '14px 0', fontSize: 14, color: '#555' }}>
            <span>📍 {listing.location as string}</span>
            <span>📦 {listing.total_quantity as number} m³</span>
            {(listing.price as number) > 0
              ? <span style={{ fontWeight: 600, color: '#0f172a' }}>CHF {listing.price as number}/m³</span>
              : <span style={{ color: '#15803d', fontWeight: 600 }}>🤝 Gratis</span>}
          </div>

          <div style={{
            background: isSofort ? '#f0fdf4' : '#f8fafc',
            border: `1px solid ${isSofort ? '#bbf7d0' : '#e2e8f0'}`,
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 20 }}>{isSofort ? '⚡' : '📅'}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: isSofort ? '#15803d' : '#0f172a' }}>{avail}</div>
              {!!listing.availability_window && (
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  {WINDOW_LABEL[listing.availability_window as string] || String(listing.availability_window)}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: '0 0 20px' }}>
              {listing.description as string}
            </p>
          )}

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {([
              listing.access_type  ? ['Zufahrt',  String(listing.access_type)]  : null,
              listing.loading_type ? ['Verlad',   String(listing.loading_type)] : null,
              listing.unit         ? ['Einheit',  String(listing.unit)]         : null,
              listing.created_at   ? ['Erstellt', new Date(listing.created_at as string).toLocaleDateString('de-CH')] : null,
            ] as ([string, string] | null)[]).filter((x): x is [string, string] => x !== null).map(([label, val]) => (
                <div key={label} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{val}</div>
                </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #f1f5f9', margin: '0 0 24px' }} />

          {/* Reservation form */}
          {!isOwner && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>
                Reservierung anfragen
              </h2>
              {!userId ? (
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, textAlign: 'center', fontSize: 14, color: '#64748b' }}>
                  <Link href="/auth/login" style={{ color: '#15803d', fontWeight: 700 }}>Einloggen</Link>
                  {' '}um eine Reservierung anzufragen
                </div>
              ) : (
                <form action={async (fd) => { await createReservation(fd) }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input type="hidden" name="listing_id" value={listing.id as string} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                        Menge (m³) *
                      </label>
                      <input name="quantity" type="number" required min="1"
                        max={listing.total_quantity as number}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                        placeholder="z.B. 20" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                        Wunschdatum
                      </label>
                      <input name="pickup_date" type="date"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                      Nachricht (optional)
                    </label>
                    <textarea name="message" rows={3}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      placeholder="Kurze Beschreibung Ihres Projekts…" />
                  </div>
                  <button type="submit" style={{
                    background: '#15803d', color: '#fff', border: 'none', borderRadius: 8,
                    padding: '12px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    Reservierung anfragen →
                  </button>
                </form>
              )}
            </div>
          )}

          {isOwner && (
            <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 14, fontSize: 13, color: '#15803d', fontWeight: 600, textAlign: 'center' }}>
              Das ist dein Inserat
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  )
}

export default function ListingsWithModal({ listings, userId, matColors }: {
  listings: Listing[], userId?: string, matColors: Record<string, string>
}) {
  const [selected, setSelected] = useState<Listing | null>(null)

  const close = useCallback(() => setSelected(null), [])

  return (
    <>
      {listings.map((l) => {
        const isSofort = !l.availability_type || l.availability_type === 'sofort'
        const avail = availLabel(l)
        const color = matColors[l.material as string] || '#94a3b8'
        return (
          <div key={l.id as string}
            onClick={() => setSelected(l)}
            style={{
              background: '#fff', borderRadius: 10, padding: '14px 16px', marginBottom: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${color}`,
              cursor: 'pointer', transition: 'box-shadow 0.12s, transform 0.12s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
              ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
              ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ background: color, color: '#fff', borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                  {l.material as string}
                </span>
                <span style={{
                  background: l.type === 'offer' ? '#dcfce7' : '#fef3c7',
                  color: l.type === 'offer' ? '#166534' : '#92400e',
                  borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 600,
                }}>{l.type === 'offer' ? 'Angebot' : 'Gesuch'}</span>
              </div>
              {avail && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: isSofort ? '#15803d' : '#374151',
                  background: isSofort ? '#f0fdf4' : '#f8fafc',
                  border: `1px solid ${isSofort ? '#bbf7d0' : '#e2e8f0'}`,
                  borderRadius: 5, padding: '2px 7px', whiteSpace: 'nowrap',
                }}>
                  {isSofort ? '⚡ ' : '📅 '}{avail}
                </span>
              )}
            </div>

            <h3 style={{ fontWeight: 700, fontSize: 15, margin: '0 0 5px', color: '#111' }}>{l.title as string}</h3>

            <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#666', marginBottom: l.description ? 8 : 0, flexWrap: 'wrap' }}>
              <span>📍 {l.location as string || 'Unbekannt'}</span>
              <span>📦 {l.total_quantity as number} m³</span>
              {(l.price as number) > 0
                ? <span>CHF {l.price as number}/m³</span>
                : <span style={{ color: '#15803d' }}>Gratis</span>}
            </div>

            {!!l.description && (
              <p style={{ fontSize: 13, color: '#555', margin: '0', lineHeight: 1.5 }}>
                {(l.description as string).length > 80
                  ? (l.description as string).slice(0, 80) + '…'
                  : String(l.description)}
              </p>
            )}
          </div>
        )
      })}

      {listings.length === 0 && (
        <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>
          <p>Keine Inserate gefunden.</p>
        </div>
      )}

      {selected && <ListingModal listing={selected} userId={userId} onClose={close} />}
    </>
  )
}
