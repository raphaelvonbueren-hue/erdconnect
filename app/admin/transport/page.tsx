import { createAdminClient } from '@/lib/supabase/admin'
import { addTransportCompany, deleteTransportCompany, toggleTransportActive } from '../actions'

const MATERIALS = [
  { value: 'humus',        label: 'Humus / Muttererde' },
  { value: 'aushub',       label: 'Aushub / Erdmaterial' },
  { value: 'kies',         label: 'Kies / Schotter' },
  { value: 'gruenmaterial', label: 'Grünmaterial / Holz' },
  { value: 'beton',        label: 'Betonabbruch' },
  { value: 'andere',       label: 'Andere' },
]

const INPUT: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
  fontSize: 14, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}
const LABEL: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }

export default async function AdminTransport() {
  const admin = createAdminClient()
  const { data: companies } = await admin
    .from('transport_companies')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '36px 40px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 28px' }}>Transportunternehmen</h1>

      {/* Existing companies */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: 32 }}>
        {(!companies || companies.length === 0) ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Noch keine Transportunternehmen erfasst.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Unternehmen', 'Standort', 'Anfahrt', 'CHF/km', 'Materialien', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{c.name}</div>
                    {c.email && <div style={{ fontSize: 12, color: '#64748b' }}>{c.email}</div>}
                    {c.phone && <div style={{ fontSize: 12, color: '#64748b' }}>{c.phone}</div>}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{c.location}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {c.base_fee > 0 ? `CHF ${c.base_fee}` : '–'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    CHF {c.price_per_km}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(c.materials as string[]).map(m => (
                        <span key={m} style={{ background: '#f1f5f9', borderRadius: 4, padding: '2px 6px', fontSize: 11, color: '#374151' }}>{m}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <form action={toggleTransportActive} style={{ display: 'inline' }}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="active" value={c.active ? 'false' : 'true'} />
                      <button type="submit" style={{
                        padding: '5px 10px', borderRadius: 5, border: 'none', cursor: 'pointer',
                        fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                        background: c.active ? '#dcfce7' : '#f1f5f9',
                        color: c.active ? '#166534' : '#64748b',
                      }}>
                        {c.active ? 'Aktiv' : 'Inaktiv'}
                      </button>
                    </form>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <form action={deleteTransportCompany}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit"
                        onClick={(e) => { if (!confirm('Löschen?')) e.preventDefault() }}
                        style={{ padding: '5px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', background: '#fee2e2', color: '#991b1b' }}>
                        Löschen
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add form */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', padding: '28px 32px' }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>Neues Transportunternehmen</h2>
        <form action={addTransportCompany}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={LABEL}>Firmenname *</label>
              <input name="name" required style={INPUT} placeholder="Müller Transport AG" />
            </div>
            <div>
              <label style={LABEL}>Standort *</label>
              <input name="location" required style={INPUT} placeholder="Zürich" />
            </div>
            <div>
              <label style={LABEL}>E-Mail</label>
              <input name="email" type="email" style={INPUT} placeholder="info@firma.ch" />
            </div>
            <div>
              <label style={LABEL}>Telefon</label>
              <input name="phone" style={INPUT} placeholder="+41 44 123 45 67" />
            </div>
            <div>
              <label style={LABEL}>Anfahrtspauschale (CHF)</label>
              <input name="base_fee" type="number" min="0" step="0.01" style={INPUT} placeholder="150" defaultValue="0" />
            </div>
            <div>
              <label style={LABEL}>Preis pro km (CHF) *</label>
              <input name="price_per_km" type="number" min="0" step="0.01" required style={INPUT} placeholder="2.50" />
            </div>
            <div>
              <label style={LABEL}>Min. Volumen (m³)</label>
              <input name="min_volume_m3" type="number" min="0" style={INPUT} placeholder="5" />
            </div>
            <div>
              <label style={LABEL}>Max. Volumen (m³)</label>
              <input name="max_volume_m3" type="number" min="0" style={INPUT} placeholder="500" />
            </div>
            <div>
              <label style={LABEL}>Breitengrad (lat, optional)</label>
              <input name="latitude" type="number" step="any" style={INPUT} placeholder="47.3769" />
            </div>
            <div>
              <label style={LABEL}>Längengrad (lng, optional)</label>
              <input name="longitude" type="number" step="any" style={INPUT} placeholder="8.5417" />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={LABEL}>Beschreibung</label>
            <textarea name="description" rows={2} style={{ ...INPUT, resize: 'vertical' }} placeholder="Kurze Beschreibung des Unternehmens…" />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ ...LABEL, marginBottom: 10 }}>Materialien (Mehrfachauswahl)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {MATERIALS.map(m => (
                <label key={m.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 7, background: '#f8fafc' }}>
                  <input type="checkbox" name="materials" value={m.value} defaultChecked />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" style={{
            background: '#0f172a', color: '#fff', border: 'none', borderRadius: 9,
            padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Unternehmen hinzufügen →
          </button>
        </form>
      </div>
    </div>
  )
}
