'use client'
import { useState } from 'react'

const inp: React.CSSProperties = {
  padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
  fontSize: 14, background: '#fff', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
}
const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }

export default function LoadingPicker({
  defaultLoadingType = 'selbstverlad',
  defaultCost,
}: {
  defaultLoadingType?: string
  defaultCost?: number | null
}) {
  const [loadingType, setLoadingType] = useState(defaultLoadingType)
  const [isFree, setIsFree] = useState(defaultCost == null || defaultCost === 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={lbl}>Verlademöglichkeit</label>
        <select
          name="loading_type"
          value={loadingType}
          onChange={e => setLoadingType(e.target.value)}
          style={inp}
        >
          <option value="selbstverlad">Selbstverlad</option>
          <option value="maschinenverlad">Maschinenverlad vorhanden</option>
          <option value="gratis_verlad">Verlad inklusive (gratis)</option>
        </select>
      </div>

      {loadingType === 'maschinenverlad' && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
            🏗️ Kosten für Maschinenverlad
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => setIsFree(true)}
              style={{
                flex: 1, padding: '9px', border: `2px solid ${isFree ? '#15803d' : '#e2e8f0'}`,
                borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                background: isFree ? '#f0fdf4' : '#fff', color: isFree ? '#15803d' : '#374151',
              }}
            >
              🤝 Kostenlos
            </button>
            <button
              type="button"
              onClick={() => setIsFree(false)}
              style={{
                flex: 1, padding: '9px', border: `2px solid ${!isFree ? '#0f172a' : '#e2e8f0'}`,
                borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                background: !isFree ? '#f8fafc' : '#fff', color: !isFree ? '#0f172a' : '#374151',
              }}
            >
              💰 Gegen Entgelt (CHF/m³)
            </button>
          </div>

          {!isFree && (
            <div>
              <label style={lbl}>Verlad-Kosten pro m³ (CHF) <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="number"
                  name="loading_cost_per_m3"
                  min="0"
                  step="0.5"
                  required
                  defaultValue={defaultCost && defaultCost > 0 ? defaultCost : undefined}
                  placeholder="z.B. 8.00"
                  style={{ ...inp, maxWidth: 180 }}
                />
                <span style={{ fontSize: 13, color: '#64748b' }}>CHF pro m³</span>
              </div>
            </div>
          )}

          {/* Always submit 0 when free so the server knows it's set */}
          {isFree && <input type="hidden" name="loading_cost_per_m3" value="0" />}
        </div>
      )}

      {/* When not maschinenverlad, send null */}
      {loadingType !== 'maschinenverlad' && (
        <input type="hidden" name="loading_cost_per_m3" value="" />
      )}
    </div>
  )
}
