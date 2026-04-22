import { createAdminClient } from '@/lib/supabase/admin'
import { togglePremium } from '../actions'

const TH: React.CSSProperties = {
  padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em',
  background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
}
const TD: React.CSSProperties = {
  padding: '14px 20px', fontSize: 14, color: '#374151',
  borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle',
}

export default async function AdminUsers() {
  const admin = createAdminClient()

  const [{ data: { users } }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from('profiles').select('id, is_premium'),
  ])

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  return (
    <div style={{ padding: '36px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>Benutzer</h1>
        <span style={{ fontSize: 13, color: '#64748b' }}>{users.length} Benutzer</span>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={TH}>E-Mail</th>
              <th style={TH}>Registriert</th>
              <th style={TH}>Status</th>
              <th style={TH}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isPremium = profileMap.get(u.id)?.is_premium ?? false
              return (
                <tr key={u.id}>
                  <td style={TD}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.email}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{u.id.slice(0, 8)}…</div>
                  </td>
                  <td style={TD}>
                    {new Date(u.created_at).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td style={TD}>
                    {isPremium ? (
                      <span style={{ background: '#fef9c3', color: '#92400e', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        👑 Premium
                      </span>
                    ) : (
                      <span style={{ background: '#f1f5f9', color: '#64748b', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                        Free
                      </span>
                    )}
                  </td>
                  <td style={TD}>
                    <form action={togglePremium}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="setPremium" value={isPremium ? 'false' : 'true'} />
                      <button type="submit" style={{
                        padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                        background: isPremium ? '#fee2e2' : '#dcfce7',
                        color: isPremium ? '#991b1b' : '#166534',
                      }}>
                        {isPremium ? 'Premium entfernen' : '👑 Premium aktivieren'}
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
