import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateListing } from '@/app/inserat/actions'
import Link from 'next/link'
import Header from '@/app/components/Header'
import AvailabilityPicker from '@/app/components/AvailabilityPicker'
import QuantityPicker from '@/app/components/QuantityPicker'
import LoadingPicker from '@/app/components/LoadingPicker'

const MATERIALS = [
  { value: 'humus',         label: '🌱 Humus / Muttererde' },
  { value: 'aushub',        label: '🚧 Aushub / Erdmaterial' },
  { value: 'kies',          label: '🪨 Kies / Schotter' },
  { value: 'gruenmaterial', label: '🌳 Grünmaterial / Holz' },
  { value: 'beton',         label: '🧱 Betonabbruch' },
  { value: 'andere',        label: '⚙️ Andere' },
]

export default async function BearbeitenPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { id } = await params
  const { data: l } = await supabase.from('listings').select('*').eq('id', id).eq('user_id', user.id).single()
  if (!l) redirect('/dashboard')

  const { error } = await searchParams

  return (
    <div className="app">
      <Header />
      <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 24px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: 28 }}>Inserat bearbeiten</h2>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Ändere dein Inserat und speichere die Änderungen.</p>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: 24 }}>
            ⚠️ Fehler: {decodeURIComponent(error)}
          </div>
        )}

        <form action={updateListing} className="inserat-form">
          <input type="hidden" name="id" value={l.id} />

          {/* 1. Typ */}
          <div className="form-section">
            <h3 className="form-section-title">📝 1. Typ des Inserats</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <label className="radio-card">
                <input type="radio" name="type" value="offer" defaultChecked={l.type === 'offer'} />
                <span>📤 Angebot</span>
                <small>Ich habe Material zu vergeben</small>
              </label>
              <label className="radio-card">
                <input type="radio" name="type" value="request" defaultChecked={l.type === 'request'} />
                <span>📥 Gesuch</span>
                <small>Ich suche Material</small>
              </label>
            </div>
          </div>

          {/* 2. Material */}
          <div className="form-section">
            <h3 className="form-section-title">⛏️ 2. Materialtyp</h3>
            <div className="material-grid">
              {MATERIALS.map(m => (
                <label key={m.value} className="material-card">
                  <input type="radio" name="material" value={m.value} defaultChecked={l.material === m.value} />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Beschreibung */}
          <div className="form-section">
            <h3 className="form-section-title">💬 3. Beschreibung</h3>
            <div className="form-group">
              <label>Titel <span className="required">*</span></label>
              <input type="text" name="title" required maxLength={100} defaultValue={l.title} />
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label>Beschreibung <span className="hint">(optional)</span></label>
              <textarea name="description" rows={4} defaultValue={l.description ?? ''} />
            </div>
          </div>

          {/* 4. Menge */}
          <div className="form-section">
            <h3 className="form-section-title">📦 4. Menge</h3>
            <QuantityPicker defaultQuantity={l.total_quantity} />
          </div>

          {/* 5. Preis */}
          <div className="form-section">
            <h3 className="form-section-title">💰 5. Preis</h3>
            <div className="form-row">
              <label className="radio-inline">
                <input type="radio" name="price_type" value="gratis" defaultChecked={!l.price || l.price === 0} />
                🤝 Gratis / Kostenlos
              </label>
              <label className="radio-inline">
                <input type="radio" name="price_type" value="paid" defaultChecked={l.price > 0} />
                💰 Gegen Entgelt (CHF)
              </label>
            </div>
            <div className="form-group" style={{ marginTop: 14, maxWidth: 220 }}>
              <label>Preis pro Einheit (CHF) <span className="hint">(bei Entgelt)</span></label>
              <input type="number" name="price_per_unit" min={0} step={0.5} defaultValue={l.price || ''} />
            </div>
          </div>

          {/* 6. Standort */}
          <div className="form-section">
            <h3 className="form-section-title">📍 6. Standort</h3>
            <div className="form-group">
              <label>Adresse / Ort <span className="required">*</span></label>
              <input type="text" name="location" required defaultValue={l.location} />
              <span className="field-hint">ℹ️ GPS-Koordinaten werden automatisch aktualisiert</span>
            </div>
          </div>

          {/* 7. Logistik */}
          <div className="form-section">
            <h3 className="form-section-title">🚛 7. Logistik</h3>
            <div className="form-row" style={{ marginBottom: 16 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Zufahrt zum Standort</label>
                <select name="access_type" defaultValue={l.access_type ?? 'befestigt'}>
                  <option value="befestigt">Befestigt (Asphalt / Beton)</option>
                  <option value="unbefestigt">Unbefestigt (Kies / Erde)</option>
                  <option value="keine">Keine direkte Zufahrt</option>
                </select>
              </div>
            </div>
            <LoadingPicker
              defaultLoadingType={l.loading_type ?? 'selbstverlad'}
              defaultCost={l.loading_cost_per_m3}
            />
          </div>

          {/* 8. Verfügbarkeit */}
          <div className="form-section">
            <h3 className="form-section-title">📅 8. Verfügbarkeit & Abholtermin</h3>
            <AvailabilityPicker
              defaultType={(l.availability_type as 'sofort' | 'datum' | 'quartal') ?? 'sofort'}
              defaultDateFrom={l.availability_date_from ?? ''}
              defaultDateTo={l.availability_date_to ?? ''}
              defaultQuarterFrom={l.availability_quarter_from ?? ''}
              defaultQuarterTo={l.availability_quarter_to ?? ''}
              defaultWindow={l.availability_window ?? ''}
            />
          </div>

          <div className="form-actions">
            <Link href="/dashboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 14 }}>
              Abbrechen
            </Link>
            <button type="submit" className="btn-submit" style={{ width: 'auto', padding: '12px 40px', fontSize: 15 }}>
              Änderungen speichern →
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
