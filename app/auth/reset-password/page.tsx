import { resetPassword } from '@/app/auth/actions'
import Link from 'next/link'
import Logo from '@/app/components/Logo'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>
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
        <h1>Passwort zurücksetzen</h1>
        <p className="auth-sub">Wir schicken dir einen Link per E-Mail</p>

        {params.error && <div className="auth-error">⚠️ {decodeURIComponent(params.error)}</div>}

        {params.sent ? (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
            padding: '16px 20px', textAlign: 'center', fontSize: 14, color: '#15803d', lineHeight: 1.6,
          }}>
            ✅ E-Mail verschickt! Bitte prüfe dein Postfach und klicke auf den Link zum Zurücksetzen.
          </div>
        ) : (
          <form action={resetPassword} className="auth-form">
            <div className="form-group">
              <label>E-Mail-Adresse</label>
              <input type="email" name="email" required placeholder="name@beispiel.ch" />
            </div>
            <button type="submit" className="btn-submit">Link senden →</button>
          </form>
        )}

        <div className="auth-footer">
          <p><Link href="/auth/login">← Zurück zum Login</Link></p>
        </div>
      </div>
    </div>
  )
}
