import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import Link from 'next/link'
import Logo from './Logo'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const isB2B = user?.user_metadata?.account_type === 'business'

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="brand" style={{ textDecoration: 'none' }}>
          <Logo size={34} />
          <span className="wordmark">
            <span className="wordmark-erd">Erd</span><span className="wordmark-connect">Connect</span>
          </span>
        </Link>

        <nav className="nav">
          <Link href="/" className="nav-link">Karte</Link>
          <Link href="/#inserate" className="nav-link">Inserate</Link>

          {user ? (
            <>
              {isB2B && <span className="b2b-badge">B2B</span>}
              <Link href="/dashboard" className="nav-user">
                <span className="avatar">{initials}</span>
                <span className="nav-name">{name}</span>
              </Link>
              <form action={signOut} style={{ margin: 0 }}>
                <button type="submit" className="btn-ghost">Logout</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="nav-link">Einloggen</Link>
              <Link href="/auth/register" className="btn-cta">Kostenlos starten</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
