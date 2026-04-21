export default function VerifyEmailPage() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
        <h1>E-Mail bestätigen</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
          Wir haben dir eine Bestätigungs-E-Mail geschickt.<br/>
          Bitte klicke auf den Link, um dein Konto zu aktivieren.
        </p>
        <a href="/auth/login" className="btn-submit" style={{ display: 'inline-block', marginTop: 24, textDecoration: 'none' }}>
          Zurück zum Login
        </a>
      </div>
    </div>
  )
}