import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import Link from 'next/link'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const isB2B = user?.user_metadata?.account_type === 'business'
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="logo">🌍</span>
          <div>
            <h1>ErdConnect</h1>
            <p>B2B/C2C Marktplatz für Erdmaterialien</p>
          </div>
        </Link>
        <nav className="nav">
          <Link href="/#inserate">Inserate</Link>
          <Link href="/#karte">Karte</Link>
          {user ? (
            <>
              {isB2B && <span className="b2b-badge">B2B</span>}
              <Link href="/dashboard" className="nav-user">
                <span className="avatar">{initials}</span>
                <span className="nav-name">{name}</span>
              </Link>
              <form action={signOut}>
                <button type="submit" className="btn-logout">Logout</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login">Einloggen</Link>
              <Link href="/auth/register" className="btn-primary">Registrieren</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}