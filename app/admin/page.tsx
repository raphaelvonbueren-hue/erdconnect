import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const admin = createAdminClient()
  const supabase = await createClient()

  const [
    { count: totalProfiles },
    { count: premiumCount },
    { count: listingCount },
    { count: transportCount },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('transport_companies').select('*', { count: 'exact', head: true }).eq('active', true),
  ])

  const stats = [
    { label: 'Registrierte Benutzer', value: totalProfiles ?? 0, color: '#6366f1', sub: 'total' },
    { label: 'Premium Benutzer', value: premiumCount ?? 0, color: '#f59e0b', sub: '👑 aktiv' },
    { label: 'Aktive Inserate', value: listingCount ?? 0, color: '#22c55e', sub: 'live' },
    { label: 'Transportunternehmen', value: transportCount ?? 0, color: '#0ea5e9', sub: 'aktiv' },
  ]

  return (
    <div style={{ padding: '36px 40px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 28px' }}>Übersicht</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: '#fff', borderRadius: 12, padding: '22px 24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}`,
          }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <QuickLink href="/admin/users" title="👥 Benutzer verwalten" desc="Premium aktivieren / deaktivieren" />
        <QuickLink href="/admin/transport" title="🚛 Transportunternehmen" desc="Anbieter hinzufügen oder entfernen" />
      </div>
    </div>
  )
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <a href={href} style={{
      background: '#fff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textDecoration: 'none',
      display: 'block', border: '1px solid #e2e8f0', transition: 'box-shadow .12s',
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#64748b' }}>{desc}</div>
      <div style={{ fontSize: 12, color: '#15803d', marginTop: 12, fontWeight: 600 }}>Öffnen →</div>
    </a>
  )
}
