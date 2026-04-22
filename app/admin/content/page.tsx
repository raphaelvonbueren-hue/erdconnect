import { createAdminClient } from '@/lib/supabase/admin'
import { updateSiteContent } from '../actions'

const BLOCKS = [
  {
    key: 'home_intro',
    title: 'Erklärtext Startseite',
    description: 'Wird oberhalb der Karte auf der Startseite angezeigt.',
    rows: 4,
  },
]

export default async function AdminContent() {
  const admin = createAdminClient()
  const { data: contents } = await admin.from('site_content').select('key, content, updated_at')
  const contentMap = new Map((contents ?? []).map(c => [c.key, c]))

  return (
    <div style={{ padding: '36px 40px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Inhalte bearbeiten</h1>
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px' }}>
        Texte werden sofort auf der Website aktualisiert.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {BLOCKS.map(block => {
          const existing = contentMap.get(block.key)
          return (
            <div key={block.key} style={{
              background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '24px 28px',
            }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{block.title}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{block.description}</div>
                {existing?.updated_at && (
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                    Zuletzt bearbeitet: {new Date(existing.updated_at).toLocaleString('de-CH')}
                  </div>
                )}
              </div>

              <form action={updateSiteContent}>
                <input type="hidden" name="key" value={block.key} />
                <textarea
                  name="content"
                  rows={block.rows}
                  defaultValue={existing?.content ?? ''}
                  style={{
                    width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 14, lineHeight: 1.6, resize: 'vertical',
                    fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box',
                    color: '#0f172a', background: '#f8fafc',
                  }}
                />
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={{
                    background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8,
                    padding: '10px 24px', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    Speichern →
                  </button>
                </div>
              </form>
            </div>
          )
        })}
      </div>
    </div>
  )
}
