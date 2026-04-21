import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createListing } from '@/app/inserat/actions'
import Link from 'next/link'
import AvailabilityPicker from '@/app/components/AvailabilityPicker'

const MATERIALS = [
  { value: 'humus',        label: '🌱 Humus / Muttererde' },
  { value: 'aushub',       label: '🚧 Aushub / Erdmaterial' },
  { value: 'kies',         label: '🪨 Kies / Schotter' },
  { value: 'gruenmaterial',label: '🌳 Grünmaterial / Holz' },
  { value: 'beton',        label: '🧱 Betonabbruch' },
  { value: 'andere',       label: '⚙️ Andere' },
]

export default async function NeuesInseratPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const params = await searchParams

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <Link href="/" className="brand" style={{ textDecoration:'none', color:'inherit' }}>
            <span className="logo">🌍</span>
            <div><h1>ErdConnect</h1><p>Inserat erstellen</p></div>
          </Link>
          <nav className="nav">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/">Zur Karte</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth:720, margin:'40px auto', padding:'0 24px 80px' }}>
        <div style={{ marginBottom:32 }}>
          <h2 style={{ margin:'0 0 8px 0', fontSize:28 }}>Neues Inserat aufgeben</h2>
          <p style={{ color:'var(--muted)', margin:0 }}>Fülle das Formular aus und veröffentliche dein Inserat kostenlos.</p>
        </div>

        {params.error && (
          <div className="auth-error" style={{ marginBottom:24 }}>
            ⚠️ Fehler: {decodeURIComponent(params.error)}
          </div>
        )}

        <form action={createListing} className="inserat-form">

          <div className="form-section">
            <h3 className="form-section-title">📝 1. Typ des Inserats</h3>
            <div style={{ display:'flex', gap:12 }}>
              <label className="radio-card">
                <input type="radio" name="type" value="offer" defaultChecked />
                <span>📤 Angebot</span>
                <small>Ich habe Material zu vergeben</small>
              </label>
              <label className="radio-card">
                <input type="radio" name="type" value="request" />
                <span>📥 Gesuch</span>
                <small>Ich suche Material</small>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">⛏️ 2. Materialtyp</h3>
            <div className="material-grid">
              {MATERIALS.map(m => (
                <label key={m.value} className="material-card">
                  <input type="radio" name="material" value={m.value} defaultChecked={m.value === 'humus'} />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">💬 3. Beschreibung</h3>
            <div className="form-group">
              <label>Titel <span className="required">*</span></label>
              <input type="text" name="title" required maxLength={100}
                placeholder="z.B. Hochwertiger Humus aus Gartenräumung" />
            </div>
            <div className="form-group" style={{ marginTop:16 }}>
              <label>Beschreibung <span className="hint">(optional)</span></label>
              <textarea name="description" rows={4}
                placeholder="Qualität, Herkunft, Besonderheiten, Verfügbarkeit..." />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">📦 4. Menge</h3>
            <div className="form-row">
              <div className="form-group" style={{ flex:2 }}>
                <label>Gesamtmenge <span className="required">*</span></label>
                <input type="number" name="total_quantity" required min={1} placeholder="100" />
              </div>
              <div className="form-group" style={{ flex:1 }}>
                <label>Einheit</label>
                <select name="unit">
                  <option value="m3">m³ (Kubikmeter)</option>
                  <option value="t">Tonnen</option>
                  <option value="LKW">LKW-Ladungen</option>
                  <option value="Stk">Stück</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">💰 5. Preis</h3>
            <div className="form-row">
              <label className="radio-inline">
                <input type="radio" name="price_type" value="gratis" defaultChecked />
                🤝 Gratis / Kostenlos
              </label>
              <label className="radio-inline">
                <input type="radio" name="price_type" value="paid" />
                💰 Gegen Entgelt (CHF)
              </label>
            </div>
            <div className="form-group" style={{ marginTop:14, maxWidth:220 }}>
              <label>Preis pro Einheit (CHF) <span className="hint">(bei Entgelt)</span></label>
              <input type="number" name="price_per_unit" min={0} step={0.5} placeholder="0.00" />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">📍 6. Standort</h3>
            <div className="form-group">
              <label>Adresse / Ort <span className="required">*</span></label>
              <input type="text" name="location" required
                placeholder="z.B. Zürich-Altstetten oder Bahnhofstrasse 1, 8001 Zürich" />
              <span className="field-hint">ℹ️ Die GPS-Koordinaten werden automatisch via OpenStreetMap ermittelt</span>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">🚛 7. Logistik</h3>
            <div className="form-row">
              <div className="form-group" style={{ flex:1 }}>
                <label>Zufahrt zum Standort</label>
                <select name="access_type">
                  <option value="befestigt">Befestigt (Asphalt / Beton)</option>
                  <option value="unbefestigt">Unbefestigt (Kies / Erde)</option>
                  <option value="keine">Keine direkte Zufahrt</option>
                </select>
              </div>
              <div className="form-group" style={{ flex:1 }}>
                <label>Verlademöglichkeit</label>
                <select name="loading_type">
                  <option value="selbstverlad">Selbstverlad</option>
                  <option value="maschinenverlad">Maschinenverlad vorhanden</option>
                  <option value="gratis_verlad">Verlad inklusive (gratis)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">📅 8. Verfügbarkeit & Abholtermin</h3>
            <AvailabilityPicker />
          </div>

          <div className="form-actions">
            <Link href="/dashboard" style={{ color:'var(--muted)', textDecoration:'none', fontSize:14 }}>
              Abbrechen
            </Link>
            <button type="submit" className="btn-submit"
              style={{ width:'auto', padding:'12px 40px', fontSize:15 }}>
              Jetzt veröffentlichen →
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}