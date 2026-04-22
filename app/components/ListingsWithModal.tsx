'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createReservation } from '@/app/reservations/actions'

type TransportCompany = {
  id: string
  name: string
  description?: string | null
  email?: string | null
  phone?: string | null
  location: string
  latitude?: number | null
  longitude?: number | null
  base_fee: number
  price_per_km: number
  min_volume_m3?: number | null
  max_volume_m3?: number | null
  materials: string[]
  active: boolean
}

// Auflockerungsfaktoren: wie viel mehr Volumen das Material im losen Zustand hat
const SWELL: Record<string, number> = {
  humus:        1.25,  // Muttererde: +25%
  aushub:       1.30,  // Aushub/Lehm: +30%
  kies:         1.10,  // Kies/Schotter: +10%
  gruenmaterial: 1.40, // Grünmaterial: +40%
  beton:        1.35,  // Betonabbruch: +35%
  andere:       1.25,
}
const TRUCK_M3 = 12 // m³ Fassungsvermögen Muldenlastwagen (lose)

function calcTrucks(material: string, quantity: number) {
  const factor = SWELL[material] ?? 1.25
  const looseM3 = Math.round(quantity * factor * 10) / 10
  const trucks = Math.ceil(looseM3 / TRUCK_M3)
  return { trucks, factor, looseM3 }
}

function TruckBar({ trucks }: { trucks: number }) {
  const show = Math.min(trucks, 8)
  const rest = trucks - show
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      {Array.from({ length: show }).map((_, i) => (
        <span key={i} style={{ fontSize: 15 }}>🚛</span>
      ))}
      {rest > 0 && (
        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginLeft: 2 }}>+{rest}</span>
      )}
    </span>
  )
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

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
  is_premium?: boolean
}

const MAT_COLORS: Record<string, string> = {
  humus: '#4ade80', aushub: '#a78bfa', kies: '#fb923c',
  gruenmaterial: '#34d399', beton: '#94a3b8', andere: '#64748b',
}

const MAT_LABELS: Record<string, string> = {
  humus: 'Humus / Muttererde',
  aushub: 'Aushub / Erdmaterial',
  kies: 'Kies / Schotter',
  gruenmaterial: 'Grünmaterial / Holz',
  beton: 'Betonabbruch',
  andere: 'Andere',
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
  ganzer_tag:      'Ganzer Tag (flexibel)',
  morgens:         'Morgens (7–12 Uhr)',
  nachmittags:     'Nachmittags (12–17 Uhr)',
  bauzeit_morgens: 'Bauzeit Morgens (07:30–11:45)',
  bauzeit_abend:   'Bauzeit Nachmittags (13:00–16:30)',
  nach_absprache:  'Nach Absprache',
}

function TransportSection({ listing, companies }: { listing: Listing; companies: TransportCompany[] }) {
  const relevant = companies.filter(c =>
    c.materials.length === 0 || c.materials.includes(listing.material)
  )
  if (relevant.length === 0) return null

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ borderTop: '1px solid #f1f5f9', margin: '0 0 20px' }} />
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
        🚛 Transport dazubuchen
      </h2>
      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px' }}>
        Diese Transportunternehmen fahren dieses Material — direkt anfragen.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {relevant.map(c => {
          const hasCoords = listing.latitude && listing.longitude && c.latitude && c.longitude
          const distKm = hasCoords
            ? Math.round(haversineKm(listing.latitude!, listing.longitude!, c.latitude!, c.longitude!))
            : null
          const estimatedCost = distKm != null
            ? Math.round(c.base_fee + distKm * c.price_per_km)
            : null

          return (
            <div key={c.id} style={{
              border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden',
              background: '#fff',
            }}>
              <div style={{ padding: '14px 16px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>📍 {c.location}</div>
                  </div>
                  {estimatedCost != null && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>ca. Kosten</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>CHF {estimatedCost.toLocaleString('de-CH')}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>für ~{distKm} km</div>
                    </div>
                  )}
                </div>

                {/* Pricing pills */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {c.base_fee > 0 && (
                    <span style={{ background: '#f1f5f9', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#374151' }}>
                      Anfahrt CHF {c.base_fee.toLocaleString('de-CH')}
                    </span>
                  )}
                  <span style={{ background: '#f1f5f9', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#374151' }}>
                    CHF {c.price_per_km.toLocaleString('de-CH')}/km
                  </span>
                  {c.min_volume_m3 && (
                    <span style={{ background: '#fef9c3', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#854d0e' }}>
                      ab {c.min_volume_m3} m³
                    </span>
                  )}
                </div>

                {c.description && (
                  <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {c.description}
                  </p>
                )}

                {/* Contact buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {c.phone && (
                    <a href={`tel:${c.phone}`} style={{
                      flex: 1, textAlign: 'center', padding: '9px 12px',
                      background: '#0f172a', color: '#fff', borderRadius: 7,
                      fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    }}>
                      📞 Anrufen
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}?subject=Transportanfrage: ${encodeURIComponent(listing.title)}&body=Guten Tag,%0A%0AIch interessiere mich für einen Transport im Zusammenhang mit folgendem Inserat:%0A${listing.title} (${listing.location})%0A%0ABitte melden Sie sich bei mir.%0A%0AFreundliche Grüsse`}
                      style={{
                        flex: 1, textAlign: 'center', padding: '9px 12px',
                        background: '#f1f5f9', color: '#0f172a', borderRadius: 7,
                        fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid #e2e8f0',
                      }}>
                      ✉ E-Mail
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ListingModal({ listing, userId, onClose, transportCompanies }: {
  listing: Listing, userId?: string, onClose: () => void, transportCompanies: TransportCompany[]
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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              background: matColor, color: '#fff', borderRadius: 5,
              padding: '3px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            }}>{listing.material as string}</span>
            <span style={{
              background: listing.type === 'offer' ? '#dcfce7' : '#fef3c7',
              color: listing.type === 'offer' ? '#166534' : '#92400e',
              borderRadius: 5, padding: '3px 10px', fontSize: 11, fontWeight: 600,
            }}>{listing.type === 'offer' ? 'Angebot' : 'Gesuch'}</span>
            {listing.is_premium && (
              <span style={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: '#fff', borderRadius: 5, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                boxShadow: '0 1px 4px rgba(245,158,11,0.4)',
              }}>👑 Premium</span>
            )}
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

          {listing.is_premium && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 8, padding: '6px 12px', marginBottom: 10,
            }}>
              <span style={{ fontSize: 14 }}>✓</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Verifizierter Anbieter</span>
            </div>
          )}

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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {(listing.availability_window as string).split(',').filter(Boolean).map(w => (
                    <span key={w} style={{ fontSize: 12, color: '#475569', background: '#f1f5f9', borderRadius: 5, padding: '2px 8px' }}>
                      {WINDOW_LABEL[w] || w}
                    </span>
                  ))}
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

          {/* Truck / transport estimate */}
          {listing.total_quantity > 0 && (() => {
            const { trucks, factor, looseM3 } = calcTrucks(listing.material, listing.total_quantity)
            return (
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                  🚛 Transportbedarf (Richtwert)
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: '#0c4a6e' }}>~{trucks}</span>
                  <span style={{ fontSize: 14, color: '#0369a1', fontWeight: 600 }}>Muldenlastwagen-Fahrten</span>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <TruckBar trucks={trucks} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    ['Volumen (in-situ)', `${listing.total_quantity} m³`],
                    [`Auflockerungsfaktor (${MAT_LABELS[listing.material] || listing.material})`, `× ${factor}`],
                    ['Loses Volumen', `${looseM3} m³`],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: '#e0f2fe', borderRadius: 7, padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0c4a6e' }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
                  Kapazität Muldenlastwagen: {TRUCK_M3} m³ (lose) — Richtwert, je nach Fahrzeugtyp variierend
                </div>
              </div>
            )
          })()}

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

          {/* Transport companies */}
          <TransportSection listing={listing} companies={transportCompanies} />

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

export default function ListingsWithModal({ listings, userId, matColors, transportCompanies }: {
  listings: Listing[], userId?: string, matColors: Record<string, string>, transportCompanies: TransportCompany[]
}) {
  const [selected, setSelected] = useState<Listing | null>(null)

  const close = useCallback(() => setSelected(null), [])

  return (
    <>
      {listings.map((l) => {
        const isSofort = !l.availability_type || l.availability_type === 'sofort'
        const avail = availLabel(l)
        const color = matColors[l.material] || '#94a3b8'
        const isOffer = l.type === 'offer'

        return (
          <div key={l.id}
            onClick={() => setSelected(l)}
            style={{
              background: l.is_premium ? '#fffdf5' : '#fff', borderRadius: 12, marginBottom: 10,
              boxShadow: l.is_premium ? '0 2px 8px rgba(245,158,11,0.12)' : '0 1px 3px rgba(0,0,0,0.07)',
              border: l.is_premium ? '1px solid #fde68a' : '1px solid #e8edf2',
              cursor: 'pointer', transition: 'box-shadow 0.12s, transform 0.12s',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'
              ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)'
              ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
            }}
          >
            {/* Coloured top bar */}
            <div style={{ height: 4, background: l.is_premium ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : color }} />

            <div style={{ padding: '14px 16px' }}>
              {/* Row 1: Material label + type + availability */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{
                    background: `${color}22`, color: color === '#4ade80' ? '#166534' : color === '#a78bfa' ? '#5b21b6' : color === '#fb923c' ? '#9a3412' : color === '#34d399' ? '#065f46' : '#374151',
                    borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 700,
                  }}>
                    {MAT_LABELS[l.material] || l.material}
                  </span>
                  <span style={{
                    background: isOffer ? '#dcfce7' : '#fef9c3',
                    color: isOffer ? '#166534' : '#854d0e',
                    borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 600,
                  }}>
                    {isOffer ? 'Angebot' : 'Gesuch'}
                  </span>
                  {l.is_premium && (
                    <span style={{
                      background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
                      color: '#fff', borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 700,
                    }}>👑 Premium</span>
                  )}
                </div>
                {avail && (
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: isSofort ? '#15803d' : '#64748b',
                    background: isSofort ? '#f0fdf4' : '#f8fafc',
                    border: `1px solid ${isSofort ? '#bbf7d0' : '#e2e8f0'}`,
                    borderRadius: 6, padding: '3px 8px', whiteSpace: 'nowrap',
                  }}>
                    {isSofort ? '⚡ ' : '📅 '}{avail}
                  </span>
                )}
              </div>

              {/* Row 2: Title */}
              <h3 style={{ fontWeight: 700, fontSize: 15, margin: '0 0 12px', color: '#0f172a', lineHeight: 1.35 }}>
                {l.title}
              </h3>

              {/* Row 3: Stat blocks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: l.description ? 10 : 0 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Menge</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{l.total_quantity} <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>m³</span></div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Standort</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.location || '—'}
                  </div>
                </div>
                <div style={{ background: l.price > 0 ? '#f8fafc' : '#f0fdf4', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Preis</div>
                  {l.price > 0
                    ? <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>CHF {l.price}<span style={{ fontSize: 10, fontWeight: 400 }}>/m³</span></div>
                    : <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>Gratis</div>}
                </div>
              </div>

              {/* Row 4: Truck count */}
              {l.total_quantity > 0 && (() => {
                const { trucks, factor } = calcTrucks(l.material, l.total_quantity)
                return (
                  <div style={{
                    marginTop: 8, padding: '7px 10px', background: '#f0f9ff',
                    borderRadius: 7, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                  }}>
                    <TruckBar trucks={Math.min(trucks, 8)} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0369a1' }}>ca. {trucks} Fahrten</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>à {TRUCK_M3} m³ · Auflockerung ×{factor}</span>
                  </div>
                )
              })()}

              {/* Row 5: Description snippet */}
              {!!l.description && (
                <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 0', lineHeight: 1.5 }}>
                  {l.description.length > 90 ? l.description.slice(0, 90) + '…' : l.description}
                </p>
              )}
            </div>
          </div>
        )
      })}

      {listings.length === 0 && (
        <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>
          <p>Keine Inserate gefunden.</p>
        </div>
      )}

      {selected && <ListingModal listing={selected} userId={userId} onClose={close} transportCompanies={transportCompanies} />}
    </>
  )
}
