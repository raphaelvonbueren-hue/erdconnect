import { signIn } from '@/app/auth/actions'
import Link from 'next/link'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🌍</div>
        <h1>Willkommen zurück</h1>
        <p className="auth-sub">Melde dich bei ErdConnect an</p>
        {params.error && <div className="auth-error">⚠️ {decodeURIComponent(params.error)}</div>}
        <form action={signIn} className="auth-form">
          <div className="form-group">
            <label>E-Mail</label>
            <input type="email" name="email" required placeholder="name@beispiel.ch" />
          </div>
          <div className="form-group">
            <label>Passwort</label>
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