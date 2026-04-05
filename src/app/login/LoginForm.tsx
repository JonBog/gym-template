'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Email o contraseña incorrectos')
      return
    }

    // Redirigir a /login — el middleware detecta que ya está autenticado
    // y lo manda al dashboard correcto según su rol
    router.push('/login')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--gym-bg)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    padding: '14px 16px',
    color: '#fff',
    fontSize: '0.95rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--gym-muted)',
    marginBottom: 6,
    fontFamily: 'var(--font-heading)',
  }

  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = 'var(--primary)'
    e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Error */}
      {error && (
        <div
          className="text-sm text-center py-3 px-4 rounded-lg"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete="email"
        />
      </div>

      {/* Password */}
      <div>
        <label style={labelStyle}>Contraseña</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ ...inputStyle, paddingRight: 48 }}
            onFocus={onFocus}
            onBlur={onBlur}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 transition-colors"
            style={{ color: 'var(--gym-muted)' }}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Remember me */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 rounded border accent-current"
          style={{ accentColor: 'var(--primary)' }}
        />
        <span className="text-sm" style={{ color: 'var(--gym-muted)' }}>Recordarme</span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 text-sm font-black uppercase tracking-wider text-white rounded-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        style={{
          backgroundColor: 'var(--primary)',
          fontFamily: 'var(--font-heading)',
          boxShadow: '0 8px 24px var(--primary-glow)',
        }}
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-1">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>o</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Register link */}
      <p className="text-center text-sm" style={{ color: 'var(--gym-muted)' }}>
        ¿Primera vez?{' '}
        <a href="#" className="font-bold transition-colors hover:text-white" style={{ color: 'var(--primary)' }}>
          Registrate
        </a>
      </p>
    </form>
  )
}
