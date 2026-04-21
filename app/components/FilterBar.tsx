'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState({
    category: searchParams.get('category') || '',
    city:     searchParams.get('city')     || '',
    minQty:   searchParams.get('minQty')   || '',
    sort:     searchParams.get('sort')     || 'newest',
  })

  function update(patch: Partial<typeof state>) {
    const next = { ...state, ...patch }
    setState(next)
    const params = new URLSearchParams()
    if (next.category) params.set('category', next.category)
    if (next.city)     params.set('city',     next.city)
    if (next.minQty)   params.set('minQty',   next.minQty)
    if (next.sort && next.sort !== 'newest') params.set('sort', next.sort)
    router.push('?' + params.toString())
  }

  const label: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  }
  const input: React.CSSProperties = {
    padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
    fontSize: 14, background: '#fff', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 0 8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={label}>Material</label>
        <select value={state.category} onChange={e => update({ category: e.target.value })}
          style={{ ...input, minWidth: 160 }}>
          <option value="">Alle</option>
          <option value="humus">Humus / Muttererde</option>
          <option value="aushub">Aushub / Erdmaterial</option>
          <option value="kies">Kies / Schotter</option>
          <option value="gruenmaterial">Grünmaterial / Holz</option>
          <option value="beton">Betonabbruch</option>
          <option value="andere">Andere</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={label}>Ort</label>
        <input value={state.city} onChange={e => update({ city: e.target.value })}
          placeholder="z.B. Zürich" style={{ ...input, minWidth: 140 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={label}>Min. Menge (m³)</label>
        <input type="number" value={state.minQty} onChange={e => update({ minQty: e.target.value })}
          placeholder="0" style={{ ...input, minWidth: 90 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 'auto' }}>
        <label style={label}>Sortierung</label>
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
          {([
            { value: 'newest', label: 'Neueste' },
            { value: 'termin', label: '📅 Nächster Termin' },
            { value: 'menge',  label: 'Grösste Menge' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => update({ sort: opt.value })}
              style={{
                padding: '6px 12px', border: 'none', borderRadius: 6,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'inherit', whiteSpace: 'nowrap',
                background: state.sort === opt.value ? '#fff' : 'transparent',
                color: state.sort === opt.value ? '#111' : '#64748b',
                boxShadow: state.sort === opt.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.12s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
