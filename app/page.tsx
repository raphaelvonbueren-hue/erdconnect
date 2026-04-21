import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import MapWrapper from './components/MapWrapper'

type SearchParams = { category?: string; city?: string; minQty?: string; sort?: string }
type Props = { searchParams: Promise<SearchParams> }

const QUARTER_MONTH: Record<string, number> = { Q1: 0, Q2: 3, Q3: 6, Q4: 9 }

function availabilityDate(l: Record<string, unknown>): number {
  const type = l.availability_type as string | null
  if (!type || type === 'sofort') return Date.now()
  if (type === 'datum' && l.availability_date_from) {
    return new Date(l.availability_date_from as string).getTime()
  }
  if (type === 'quartal' && l.availability_quarter_from) {
    const [q, y] = (l.availability_quarter_from as string).split(' ')
    const month = QUARTER_MONTH[q] ?? 0
    return new Date(Number(y), month, 1).getTime()
  }
  return Infinity
}

function availabilityLabel(l: Record<string, unknown>): string {
  const type = l.availability_type as string | null
  if (!type || type === 'sofort') return 'Ab sofort'
  if (type === 'datum' && l.availability_date_from) {
    const from = new Date(l.availability_date_from as string).toLocaleDateString('de-CH')
    const to = l.availability_date_to
      ? ' – ' + new Date(l.availability_date_to as string).toLocaleDateString('de-CH')
      : ''
    return from + to
  }
  if (type === 'quartal' && l.availability_quarter_from) {
    const from = l.availability_quarter_from as string
    const to = l.availability_quarter_to && l.availability_quarter_to !== from
      ? ' – ' + l.availability_quarter_to : ''
    return from + to
  }
  return ''
}

export default async function Home({ searchParams }: Props) {
  const { category, city, minQty, sort = 'newest' } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('listings').select('*').eq('status', 'active')

  if (sort !== 'termin') query = query.order('created_at', { ascending: false })
  if (sort === 'menge') query = query.order('total_quantity', { ascending: false })

  if (category && category !== 'all') query = query.eq('material', category)
  if (city) query = query.ilike('location', `%${city}%`)
  if (minQty) query = query.gte('total_quantity', Number(minQty))

  let { data: listings = [] } = await query

  if (sort === 'termin') {
    listings = [...(listings || [])].sort((a, b) => availabilityDate(a) - availabilityDate(b))
  }

  const matColors: Record<string, string> = {
    humus: '#4ade80', aushub: '#a78bfa', kies: '#fb923c',
    gruenmaterial: '#34d399', beton: '#94a3b8', andere: '#64748b',
  }

  const markers = (listings || [])
    .filter((l) => l.latitude && l.longitude)
    .map((l) => ({
      id: l.id, lat: l.latitude, lng: l.longitude,
      title: l.title, category: l.material,
      color: matColors[l.material] || '#94a3b8',
    }))

  const hasFilters = category || city || minQty

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <Header />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
        <FilterBar />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 12px' }}>
          <span style={{ fontSize: 13, color: '#888' }}>
            {listings?.length || 0} Ergebnisse
            {hasFilters && (
              <Link href="/" style={{ marginLeft: 10, color: '#15803d', fontWeight: 600, textDecoration: 'none' }}>
                Filter zurücksetzen
              </Link>
            )}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20, alignItems: 'start' }}>
          <MapWrapper markers={markers} />

          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#222' }}>
              Inserate ({listings?.length || 0})
            </h2>

            {listings?.map((l) => {
              const avail = availabilityLabel(l)
              const issofort = !l.availability_type || l.availability_type === 'sofort'
              return (
                <div key={l.id} style={{
                  background: '#fff', borderRadius: 10, padding: 16, marginBottom: 10,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  borderLeft: `4px solid ${matColors[l.material] || '#94a3b8'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{
                        background: matColors[l.material] || '#94a3b8', color: '#fff',
                        borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      }}>{l.material}</span>
                      <span style={{
                        background: l.type === 'offer' ? '#dcfce7' : '#fef3c7',
                        color: l.type === 'offer' ? '#166534' : '#92400e',
                        borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 600,
                      }}>{l.type === 'offer' ? 'Angebot' : 'Gesuch'}</span>
                    </div>
                    {avail && (
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: issofort ? '#15803d' : '#374151',
                        background: issofort ? '#f0fdf4' : '#f8fafc',
                        border: `1px solid ${issofort ? '#bbf7d0' : '#e2e8f0'}`,
                        borderRadius: 5, padding: '2px 7px', whiteSpace: 'nowrap',
                      }}>
                        {issofort ? '⚡ ' : '📅 '}{avail}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontWeight: 700, fontSize: 15, margin: '0 0 5px', color: '#111' }}>{l.title}</h3>

                  <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#666', marginBottom: 8, flexWrap: 'wrap' }}>
                    <span>📍 {l.location || 'Unbekannt'}</span>
                    <span>📦 {l.total_quantity} m³</span>
                    {l.price > 0 ? <span>CHF {l.price}/m³</span> : <span style={{ color: '#15803d' }}>Gratis</span>}
                  </div>

                  {l.description && (
                    <p style={{ fontSize: 13, color: '#555', margin: '0 0 10px', lineHeight: 1.5 }}>
                      {l.description.length > 80 ? l.description.slice(0, 80) + '…' : l.description}
                    </p>
                  )}
                  <Link href={`/listing/${l.id}`} style={{ color: '#15803d', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                    Details ansehen →
                  </Link>
                </div>
              )
            })}

            {listings?.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>
                <p>Keine Inserate gefunden.</p>
                <Link href="/" style={{ color: '#15803d', fontWeight: 600 }}>Filter zurücksetzen</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
