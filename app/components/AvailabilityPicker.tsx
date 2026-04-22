'use client'
import { useState } from 'react'

const QUARTERS = [
  'Q2 2026', 'Q3 2026', 'Q4 2026',
  'Q1 2027', 'Q2 2027', 'Q3 2027', 'Q4 2027',
]

const inputStyle: React.CSSProperties = {
  padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
  fontSize: 14, background: '#fff', width: '100%', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6,
}

type Props = {
  defaultType?: 'sofort' | 'datum' | 'quartal'
  defaultDateFrom?: string
  defaultDateTo?: string
  defaultQuarterFrom?: string
  defaultQuarterTo?: string
  defaultWindow?: string
}

export default function AvailabilityPicker({
  defaultType = 'sofort',
  defaultDateFrom = '',
  defaultDateTo = '',
  defaultQuarterFrom = '',
  defaultQuarterTo = '',
  defaultWindow = '',
}: Props) {
  const [type, setType] = useState<'sofort' | 'datum' | 'quartal'>(defaultType)

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 0', border: '1px solid', textAlign: 'center',
    cursor: 'pointer', fontWeight: 600, fontSize: 14, borderRadius: 0,
    background: active ? '#22c55e' : '#fff',
    color: active ? '#fff' : '#555',
    borderColor: active ? '#22c55e' : '#e2e8f0',
    transition: 'all 0.15s',
  })

  return (
    <div>
      {/* hidden field so the server action always gets availability_type */}
      <input type="hidden" name="availability_type" value={type} />

      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: 20 }}>
        <button type="button" style={{ ...tabStyle(type === 'sofort'), borderRadius: '8px 0 0 8px', borderRight: 'none' }}
          onClick={() => setType('sofort')}>
          ⚡ Ab sofort
        </button>
        <button type="button" style={{ ...tabStyle(type === 'datum'), borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}
          onClick={() => setType('datum')}>
          📅 Bestimmtes Datum
        </button>
        <button type="button" style={{ ...tabStyle(type === 'quartal'), borderRadius: '0 8px 8px 0', borderLeft: 'none' }}
          onClick={() => setType('quartal')}>
          🗓️ Quartal
        </button>
      </div>

      {type === 'datum' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Verfügbar ab <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="date" name="availability_date_from" required style={inputStyle} defaultValue={defaultDateFrom} />
            <span style={{ fontSize: 12, color: '#888', marginTop: 4, display: 'block' }}>
              Frühester Abholtermin
            </span>
          </div>
          <div>
            <label style={labelStyle}>Verfügbar bis <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span></label>
            <input type="date" name="availability_date_to" style={inputStyle} defaultValue={defaultDateTo} />
            <span style={{ fontSize: 12, color: '#888', marginTop: 4, display: 'block' }}>
              Letzter Abholtermin
            </span>
          </div>
        </div>
      )}

      {type === 'quartal' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Quartal von <span style={{ color: '#ef4444' }}>*</span></label>
            <select name="availability_quarter_from" required style={inputStyle} defaultValue={defaultQuarterFrom}>
              <option value="">— wählen —</option>
              {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Quartal bis <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span></label>
            <select name="availability_quarter_to" style={inputStyle} defaultValue={defaultQuarterTo}>
              <option value="">Gleich wie «von»</option>
              {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
        </div>
      )}

      <div style={{ marginTop: type === 'sofort' ? 0 : 4 }}>
        <label style={labelStyle}>Zeitfenster für Abholung</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {[
            { value: 'ganzer_tag',       label: '☀️ Ganzer Tag (flexibel)' },
            { value: 'morgens',          label: '🌅 Morgens (7–12 Uhr)' },
            { value: 'nachmittags',      label: '🌆 Nachmittags (12–17 Uhr)' },
            { value: 'bauzeit_morgens',  label: '🏗️ Bauzeit Morgens (07:30–11:45)' },
            { value: 'bauzeit_abend',    label: '🏗️ Bauzeit Nachmittags (13:00–16:30)' },
            { value: 'nach_absprache',   label: '📞 Nach Absprache' },
          ].map(opt => (
            <label key={opt.value} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer',
              background: '#fff', fontSize: 14,
            }}>
              <input type="checkbox" name="availability_window" value={opt.value}
                defaultChecked={defaultWindow.split(',').includes(opt.value)}
                style={{ accentColor: '#22c55e', width: 16, height: 16 }} />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
