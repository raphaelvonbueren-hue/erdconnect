import { updatePassword } from '@/app/auth/actions'
import Link from 'next/link'
import Logo from '@/app/components/Logo'

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
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
        <h1>Neues Passwort setzen</h1>
        <p className="auth-sub">Wähle ein sicheres neues Passwort</p>

        {params.error && <div className="auth-error">⚠️ {decodeURIComponent(params.error)}</div>}

        <form action={updatePassword} className="auth-form">
          <div className="form-group">
            <label>Neues Passwort</label>
            <input type="password" name="password" required minLength={8} placeholder="Mindestens 8 Zeichen" />
          </div>
          <button type="submit" className="btn-submit">Passwort speichern →</button>
        </form>

        <div className="auth-footer">
          <p><Link href="/auth/login">← Zurück zum Login</Link></p>
        </div>
      </div>
    </div>
  )
}
