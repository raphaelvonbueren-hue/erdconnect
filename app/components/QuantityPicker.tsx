'use client'
import { useState, useEffect } from 'react'

type Mode  = 'direkt' | 'flaeche'
type State = 'fest'   | 'lose'
type MatKey = 'humus' | 'aushub' | 'kies' | 'gruenmaterial' | 'beton' | 'andere'

// Auflockerungsfaktoren (AF = Schüttmaß / Bankmaß)
// Quellen: SIA 804 Erdarbeiten, SUVA-Merkblätter, Erdbau-Richtlinien
const MATS: Record<MatKey, {
  af: number        // Auflockerungsfaktor (fest → lose)
  afRange: string   // Bereich aus Norm
  src: string       // Quelle
  defaultDicke?: number  // Standard-Schichtdicke [m]
}> = {
  humus:         { af: 1.25, afRange: '1.20–1.30', src: 'SIA 804',          defaultDicke: 0.20 },
  aushub:        { af: 1.30, afRange: '1.20–1.40', src: 'SIA 804',          defaultDicke: undefined },
  kies:          { af: 1.10, afRange: '1.05–1.15', src: 'Merkblatt Erdbau', defaultDicke: undefined },
  gruenmaterial: { af: 1.40, afRange: '1.30–1.60', src: 'Erfahrungswert',   defaultDicke: undefined },
  beton:         { af: 1.35, afRange: '1.30–1.40', src: 'SIA 804',          defaultDicke: undefined },
  andere:        { af: 1.25, afRange: '~1.25',     src: 'Schätzwert',       defaultDicke: undefined },
}

const TRUCK_M3 = 12

const btn = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: '9px 0', border: '1px solid', textAlign: 'center' as const,
  cursor: 'pointer', fontWeight: 600, fontSize: 13, borderRadius: 0,
  background: active ? '#0f172a' : '#fff',
  color: active ? '#fff' : '#555',
  borderColor: active ? '#0f172a' : '#e2e8f0',
  transition: 'all 0.13s', fontFamily: 'inherit',
})
const inp: React.CSSProperties = {
  padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
  fontSize: 14, background: '#fff', width: '100%', boxSizing: 'border-box',
  fontFamily: 'inherit',
}
const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }

function round1(n: number) { return Math.round(n * 10) / 10 }

export default function QuantityPicker({ defaultQuantity }: { defaultQuantity?: number }) {
  const [mode,  setMode]  = useState<Mode>('direkt')
  const [state, setState] = useState<State>('fest')
  const [material, setMaterial] = useState<MatKey>('humus')

  const [m3Direct, setM3Direct] = useState(defaultQuantity ? String(defaultQuantity) : '')
  const [m2,       setM2]       = useState('')
  const [dicke,    setDicke]    = useState('')

  // Sync with the material radio buttons in the parent form
  useEffect(() => {
    const form = document.querySelector('form')
    if (!form) return
    const sync = (e?: Event) => {
      const el = (e?.target as HTMLInputElement) ?? form.querySelector<HTMLInputElement>('[name="material"]:checked')
      if (el?.name === 'material' || !e) {
        const checked = form.querySelector<HTMLInputElement>('[name="material"]:checked')
        if (checked) {
          const mat = checked.value as MatKey
          setMaterial(mat)
          // Reset schichtdicke to material default when material changes
          if (mode === 'flaeche') setDicke(String(MATS[mat]?.defaultDicke ?? ''))
        }
      }
    }
    sync()
    form.addEventListener('change', sync)
    return () => form.removeEventListener('change', sync)
  }, [mode])

  // When switching to Fläche mode, set default thickness
  useEffect(() => {
    if (mode === 'flaeche' && !dicke) {
      setDicke(String(MATS[material]?.defaultDicke ?? ''))
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  const mat = MATS[material] ?? MATS.andere
  const af  = mat.af

  // Raw m³ from user input (in the selected state)
  const rawM3 = mode === 'direkt'
    ? (parseFloat(m3Direct) || 0)
    : (parseFloat(m2) || 0) * (parseFloat(dicke) || 0)

  // Fest-equivalent m³ (what we store — truck calc assumes fest)
  const festM3  = state === 'fest' ? rawM3 : round1(rawM3 / af)
  // Loose m³ (for truck calc)
  const loseM3  = round1(festM3 * af)
  const trucks  = loseM3 > 0 ? Math.ceil(loseM3 / TRUCK_M3) : 0

  const hasValue = festM3 > 0

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: 16 }}>
        <button type="button" style={{ ...btn(mode === 'direkt'), borderRadius: '8px 0 0 8px', borderRight: 'none' }}
          onClick={() => setMode('direkt')}>
          📦 Direkt in m³
        </button>
        <button type="button" style={{ ...btn(mode === 'flaeche'), borderRadius: '0 8px 8px 0', borderLeft: 'none' }}
          onClick={() => setMode('flaeche')}>
          📐 Fläche × Schichtdicke
        </button>
      </div>

      {/* Inputs */}
      {mode === 'direkt' ? (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 2 }}>
            <label style={lbl}>Gesamtmenge <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="number" min="0.1" step="0.1" required
              value={m3Direct} onChange={e => setM3Direct(e.target.value)}
              placeholder="z.B. 100"
              style={inp}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={lbl}>Einheit</label>
            <select name="unit" style={inp}>
              <option value="m3">m³ (Kubikmeter)</option>
              <option value="t">Tonnen</option>
              <option value="LKW">LKW-Ladungen</option>
              <option value="Stk">Stück</option>
            </select>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
            <div>
              <label style={lbl}>Fläche (m²) <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="number" min="0.1" step="0.1"
                value={m2} onChange={e => setM2(e.target.value)}
                placeholder="z.B. 500"
                style={inp}
              />
            </div>
            <div>
              <label style={lbl}>
                Schichtdicke (m) <span style={{ color: '#ef4444' }}>*</span>
                {mat.defaultDicke && (
                  <span style={{ fontWeight: 400, color: '#64748b', marginLeft: 4 }}>
                    (Standard {material === 'humus' ? 'Humus' : ''}: {mat.defaultDicke} m)
                  </span>
                )}
              </label>
              <input
                type="number" min="0.01" step="0.01"
                value={dicke} onChange={e => setDicke(e.target.value)}
                placeholder={mat.defaultDicke ? String(mat.defaultDicke) : 'z.B. 0.30'}
                style={inp}
              />
            </div>
          </div>
          {/* Calculation preview */}
          {rawM3 > 0 && (
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#374151', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontFamily: 'monospace' }}>{parseFloat(m2) || 0} m² × {parseFloat(dicke) || 0} m</span>
              <span style={{ color: '#94a3b8' }}>=</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{round1(rawM3)} m³</span>
            </div>
          )}
          {/* hidden unit */}
          <input type="hidden" name="unit" value="m3" />
        </div>
      )}

      {/* Material state: fest / lose */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ ...lbl, marginBottom: 8 }}>Materialzustand (beim Messen)</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {([
            { v: 'fest', icon: '🪨', title: 'Fest / Gewachsen',  desc: 'In-situ, verdichtet (Bankmaß)' },
            { v: 'lose', icon: '💨', title: 'Lose / Aufgelockert', desc: 'Bereits ausgehoben (Schüttmaß)' },
          ] as const).map(o => (
            <button key={o.v} type="button" onClick={() => setState(o.v)}
              style={{
                flex: 1, padding: '10px 14px', border: `2px solid ${state === o.v ? '#0f172a' : '#e2e8f0'}`,
                borderRadius: 9, cursor: 'pointer', background: state === o.v ? '#f8fafc' : '#fff',
                textAlign: 'left' as const, fontFamily: 'inherit', transition: 'all .12s',
              }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{o.icon} <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{o.title}</span></div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{o.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Auflockerungsfaktor info box */}
      <div style={{
        background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9,
        padding: '12px 14px', marginBottom: 16, fontSize: 12,
      }}>
        <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 6, fontSize: 13 }}>
          📊 Auflockerungsfaktor — {['humus','aushub','kies','gruenmaterial','beton','andere'].find(k => k === material) ? {
            humus: 'Humus / Muttererde', aushub: 'Aushub / Erdmaterial', kies: 'Kies / Schotter',
            gruenmaterial: 'Grünmaterial / Holz', beton: 'Betonabbruch', andere: 'Andere',
          }[material] : material}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[
            ['Faktor (AF)',    `× ${af}`],
            ['Bandbreite',     mat.afRange],
            ['Quelle',         mat.src],
          ].map(([k, v]) => (
            <div key={k} style={{ background: '#fef9c3', borderRadius: 6, padding: '6px 8px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase' as const, letterSpacing: '.04em', marginBottom: 1 }}>{k}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#78350f' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ color: '#78350f', marginTop: 8, lineHeight: 1.5 }}>
          1 m³ <strong>fest</strong> = <strong>{af} m³ lose</strong> &nbsp;|&nbsp;
          1 m³ <strong>lose</strong> = <strong>{round1(1 / af)} m³ fest</strong>
          {state === 'lose' && rawM3 > 0 && (
            <span style={{ marginLeft: 8, background: '#fbbf24', borderRadius: 4, padding: '1px 6px', color: '#78350f', fontWeight: 700 }}>
              → gespeichert als {round1(rawM3 / af)} m³ fest
            </span>
          )}
        </div>
      </div>

      {/* Truck estimate */}
      {hasValue && (
        <div style={{
          background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 9,
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 20 }}>🚛</div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#0c4a6e' }}>~{trucks} Fahrten</span>
            <span style={{ fontSize: 12, color: '#0369a1', marginLeft: 8 }}>
              {festM3} m³ fest × {af} = {loseM3} m³ lose ÷ {TRUCK_M3} m³/Fahrt
            </span>
          </div>
        </div>
      )}

      {/* Hidden field — always stores fest-equivalent m³ */}
      <input type="hidden" name="total_quantity" value={festM3 > 0 ? festM3 : ''} />
    </div>
  )
}
