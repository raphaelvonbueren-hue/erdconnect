import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import MapWrapper from './components/MapWrapper'

type SearchParams = { category?: string; city?: string; minQty?: string }
type Props = { searchParams: Promise<SearchParams> }

export default async function Home({ searchParams }: Props) {
  const { category, city, minQty } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('listings').select('*').eq('status', 'active').order('created_at', { ascending: false })
  if (category && category !== 'all') query = query.eq('material', category)
  if (city) query = query.ilike('location', `%${city}%`)
  if (minQty) query = query.gte('total_quantity', Number(minQty))

  const { data: listings = [] } = await query
  const categoryColors: Record<string, string> = { humus: '#4ade80', aushub: '#a78bfa', kies: '#fb923c' }
  const markers = (listings || []).filter((l) => l.latitude && l.longitude).map((l) => ({
    id: l.id, lat: l.latitude, lng: l.longitude, title: l.title, category: l.material, color: categoryColors[l.material] || '#94a3b8',
  }))

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <Header />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
        <FilterBar />
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px', textAlign: 'right' }}>
          {listings?.length || 0} Ergebnisse
          {(category || city || minQty) && (
            <Link href="/" style={{ marginLeft: 12, color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>Zuruecksetzen</Link>
          )}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20, alignItems: 'start' }}>
          <MapWrapper markers={markers} />
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#222' }}>Aktuelle Inserate ({listings?.length || 0})</h2>
            {listings?.map((l) => (
              <div key={l.id} style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${categoryColors[l.material] || '#94a3b8'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ background: categoryColors[l.material] || '#94a3b8', color: '#fff', borderRadius: 5, padding: '2px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{l.material}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(l.created_at).toLocaleDateString('de-CH')}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 15, margin: '0 0 6px', color: '#111' }}>{l.title}</h3>
                <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#666', marginBottom: 8 }}>
                  <span>Ort: {l.location || 'Unbekannt'}</span>
                  <span>Menge: {l.total_quantity} m3</span>
                  {l.price && <span>CHF {l.price}/m3</span>}
                </div>
                {l.description && <p style={{ fontSize: 13, color: '#555', margin: '0 0 10px', lineHeight: 1.5 }}>{l.description.length > 80 ? l.description.slice(0, 80) + '...' : l.description}</p>}
                <Link href={`/listing/${l.id}`} style={{ color: '#22c55e', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>Details ansehen</Link>
              </div>
            ))}
            {listings?.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: '#888' }}><p>Keine Inserate gefunden.</p><Link href="/" style={{ color: '#22c55e', fontWeight: 600 }}>Filter zuruecksetzen</Link></div>}
          </div>
        </div>
      </div>
    </div>
  )
}

