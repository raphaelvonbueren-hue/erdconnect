import { createClient } from '@/lib/supabase/server'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import MapWrapper from './components/MapWrapper'
import ListingsWithModal from './components/ListingsWithModal'

type SearchParams = { category?: string; city?: string; minQty?: string; sort?: string }
type Props = { searchParams: Promise<SearchParams> }

const MAT_COLORS: Record<string, string> = {
  humus: '#4ade80', aushub: '#a78bfa', kies: '#fb923c',
  gruenmaterial: '#34d399', beton: '#94a3b8', andere: '#64748b',
}

const QUARTER_MONTH: Record<string, number> = { Q1: 0, Q2: 3, Q3: 6, Q4: 9 }

function availabilityDate(l: Record<string, unknown>): number {
  const type = l.availability_type as string | null
  if (!type || type === 'sofort') return Date.now()
  if (type === 'datum' && l.availability_date_from)
    return new Date(l.availability_date_from as string).getTime()
  if (type === 'quartal' && l.availability_quarter_from) {
    const [q, y] = (l.availability_quarter_from as string).split(' ')
    return new Date(Number(y), QUARTER_MONTH[q] ?? 0, 1).getTime()
  }
  return Infinity
}

export default async function Home({ searchParams }: Props) {
  const { category, city, minQty, sort = 'newest' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase.from('listings').select('*').eq('status', 'active')
  if (sort !== 'termin') query = query.order('created_at', { ascending: false })
  if (sort === 'menge')  query = query.order('total_quantity', { ascending: false })
  if (category && category !== 'all') query = query.eq('material', category)
  if (city)   query = query.ilike('location', `%${city}%`)
  if (minQty) query = query.gte('total_quantity', Number(minQty))

  const [{ data: listingsRaw = [] }, { data: transportCompanies = [] }, { data: profiles = [] }] = await Promise.all([
    query,
    supabase.from('transport_companies').select('*').eq('active', true),
    supabase.from('profiles').select('id, is_premium'),
  ])

  const premiumIds = new Set((profiles ?? []).filter(p => p.is_premium).map(p => p.id))

  let listings = (listingsRaw ?? []).map(l => ({ ...l, is_premium: premiumIds.has(l.user_id) }))
  if (sort === 'termin')
    listings = [...listings].sort((a, b) => availabilityDate(a) - availabilityDate(b))

  // Premium listings always float to the top
  listings = [...listings.filter(l => l.is_premium), ...listings.filter(l => !l.is_premium)]

  const markers = (listings || [])
    .filter((l) => l.latitude && l.longitude)
    .map((l) => ({
      id: l.id, lat: l.latitude, lng: l.longitude,
      title: l.title, category: l.material,
      color: MAT_COLORS[l.material] || '#94a3b8',
      location: l.location || '',
      total_quantity: l.total_quantity ?? null,
      price: l.price ?? null,
      unit: l.unit || 'm³',
      type: l.type || 'offer',
      availability_type: l.availability_type || null,
      availability_date_from: l.availability_date_from || null,
      availability_quarter_from: l.availability_quarter_from || null,
    }))

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <Header />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
        <FilterBar />
        <div style={{ fontSize: 13, color: '#888', textAlign: 'right', margin: '0 0 10px' }}>
          {listings?.length || 0} Ergebnisse
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20, alignItems: 'start' }}>
          <MapWrapper markers={markers} />
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#222' }}>
              Inserate ({listings?.length || 0})
            </h2>
            <ListingsWithModal
              listings={listings || []}
              userId={user?.id}
              matColors={MAT_COLORS}
              transportCompanies={transportCompanies || []}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
