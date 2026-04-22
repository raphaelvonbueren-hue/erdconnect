import { createClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/admin',           icon: '📊', label: 'Übersicht' },
  { href: '/admin/users',     icon: '👥', label: 'Benutzer' },
  { href: '/admin/transport', icon: '🚛', label: 'Transport' },
  { href: '/admin/content',   icon: '✏️', label: 'Inhalte' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{
        width: 220, background: '#0f172a', color: '#fff',
        display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>ErdConnect</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Admin Panel</div>
        </div>

        <nav style={{ padding: '12px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ href, icon, label }) => (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              fontSize: 13, fontWeight: 500, color: '#94a3b8', textDecoration: 'none',
            }}>
              <span>{icon}</span> {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b' }}>
          <Link href="/" style={{ fontSize: 12, color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Zur App
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, background: '#f8fafc', minHeight: '100vh', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
