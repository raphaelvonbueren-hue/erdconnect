import { signIn } from '@/app/auth/actions'
import Link from 'next/link'
import Logo from '@/app/components/Logo'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Logo size={48} />
          <div className="auth-wordmark">
            <span className="wordmark-erd">Erd</span><span className="wordmark-connect">Connect</span>
          </div>
        </div>
        <h1>Willkommen zurück</h1>
        <p className="auth-sub">Melde dich bei ErdConnect an</p>
        {params.error && <div className="auth-error">⚠️ {decodeURIComponent(params.error)}</div>}
        <form action={signIn} className="auth-form">
          <div className="form-group">
            <label>E-Mail</label>
            <input type="email" name="email" required placeholder="name@beispiel.ch" />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <label style={{ margin: 0 }}>Passwort</label>
              <Link href="/auth/reset-password" style={{ fontSize: 12, color: '#64748b' }}>Passwort vergessen?</Link>
            </div>
            <input type="password" name="password" required placeholder="Passwort eingeben" />
          </div>
          <button type="submit" className="btn-submit">Einloggen</button>
        </form>
        <div className="auth-footer">
          <p>Noch kein Konto? <Link href="/auth/register">Jetzt registrieren</Link></p>
        </div>
      </div>
    </div>
  )
}