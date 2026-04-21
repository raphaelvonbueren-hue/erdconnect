'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minQty: searchParams.get('minQty') || '',
  })

  function update(patch: Partial<typeof state>) {
    const next = { ...state, ...patch }
    setState(next)
    const params = new URLSearchParams()
    if (next.category) params.set('category', next.category)
    if (next.city) params.set('city', next.city)
    if (next.minQty) params.set('minQty', next.minQty)
    router.push('?' + params.toString())
  }

  const barStyle = {
    display: 'flex', gap: 12, padding: '12px 0', alignItems: 'flex-end',
    flexWrap: 'wrap' as const, marginBottom: 8,
  }
  const groupStyle = { display: 'flex', flexDirection: 'column' as const, gap: 4 }
  const labelStyle = { fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase' as const }
  const inputStyle = {
    padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
    fontSize: 14, background: '#fff', outline: 'none', minWidth: 140,
  }

  return (
    <div style={barStyle}>
      <div style={groupStyle}>
        <label style={labelStyle}>Kategorie</label>
        <select value={state.category} onChange={e => update({ category: e.target.value })} style={inputStyle}>
          <option value="">Alle</option>
          <option value="humus">Humus / Muttererde</option>
          <option value="aushub">Aushub / Erdmaterial</option>
          <option value="kies">Kies / Schotter</option>
          <option value="gruenmaterial">Grünmaterial / Holz</option>
          <option value="beton">Betonabbruch</option>
          <option value="andere">Andere</option>
        </select>
      </div>
      <div style={groupStyle}>
        <label style={labelStyle}>Ort</label>
        <input
          value={state.city}
          onChange={e => update({ city: e.target.value })}
          placeholder="z.B. Zürich"
          style={inputStyle}
        />
      </div>
      <div style={groupStyle}>
        <label style={labelStyle}>Min. Menge (m³)</label>
        <input
          type="number"
          value={state.minQty}
          onChange={e => update({ minQty: e.target.value })}
          placeholder="0"
          style={{ ...inputStyle, minWidth: 100 }}
        />
      </div>
    </div>
  )
}
