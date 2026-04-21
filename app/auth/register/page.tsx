'use client'
import { signUp } from '@/app/auth/actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import Logo from '@/app/components/Logo'

function RegisterForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [accountType, setAccountType] = useState('privat')
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Logo size={48} />
          <div className="auth-wordmark">
            <span className="wordmark-erd">Erd</span><span className="wordmark-connect">Connect</span>
          </div>
        </div>
        <h1>Konto erstellen</h1>
        <p className="auth-sub">Starte auf ErdConnect</p>
        {error && <div className="auth-error">{decodeURIComponent(error)}</div>}
        <div className="type-toggle">
          <button type="button" className={accountType === 'privat' ? 'active' : ''} onClick={() => setAccountType('privat')}>Privat (C2C)</button>
          <button type="button" className={accountType === 'business' ? 'active' : ''} onClick={() => setAccountType('business')}>Unternehmen (B2B)</button>
        </div>
        <form action={signUp} className="auth-form">
          <input type="hidden" name="account_type" value={accountType} />
          <div className="form-group">
            <label>{accountType === 'business' ? 'Firmenname' : 'Vollstaendiger Name'}</label>
            <input type="text" name="full_name" required placeholder={accountType === 'business' ? 'Muster AG' : 'Max Muster'} />
          </div>
          <div className="form-group">
            <label>E-Mail</label>
            <input type="email" name="email" required placeholder="name@beispiel.ch" />
          </div>
          <div className="form-group">
            <label>Passwort (min. 8 Zeichen)</label>
            <input type="password" name="password" required minLength={8} placeholder="Passwort eingeben" />
          </div>
          <button type="submit" className="btn-submit">Konto erstellen</button>
        </form>
        <div className="auth-footer">
          <p>Bereits registriert? <Link href="/auth/login">Einloggen</Link></p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Laedt...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
