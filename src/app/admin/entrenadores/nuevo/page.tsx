'use client'

import { useState } from 'react'
import Link from 'next/link'
import { crearEntrenador } from './actions'

export default function NuevoEntrenadorPage() {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    especialidades: '',
    password: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.nombre.trim() || !form.apellido.trim()) {
      setError('Nombre y apellido son obligatorios')
      return
    }
    if (!form.email.trim()) {
      setError('El email es obligatorio')
      return
    }
    if (!form.password || form.password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      return
    }

    setSaving(true)
    try {
      await crearEntrenador(form)
    } catch (err: unknown) {
      setSaving(false)
      setError(err instanceof Error ? err.message : 'Error al registrar entrenador')
    }
  }

  const campos: {
    name: keyof typeof form
    label: string
    type: string
    placeholder: string
    required?: boolean
  }[] = [
    { name: 'nombre',          label: 'Nombre',               type: 'text',     placeholder: 'Ej: Diego', required: true },
    { name: 'apellido',        label: 'Apellido',             type: 'text',     placeholder: 'Ej: Da Rosa', required: true },
    { name: 'email',           label: 'Email',                type: 'email',    placeholder: 'entrenador@email.com', required: true },
    { name: 'telefono',        label: 'Telefono',             type: 'tel',      placeholder: '+595 9XX XXX XXX' },
    { name: 'especialidades',  label: 'Especialidades',       type: 'text',     placeholder: 'Ej: Fuerza, HIIT, Nutricion deportiva' },
    { name: 'password',        label: 'Contrasena temporal',  type: 'password', placeholder: 'Minimo 6 caracteres', required: true },
  ]

  const inputStyle: React.CSSProperties = {
    background: 'var(--gym-surface-alt)',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.08)',
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/admin/entrenadores"
        className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--primary)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        Volver a entrenadores
      </Link>

      <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
        Registrar Entrenador
      </h2>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--gym-surface)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="space-y-5">
            {campos.map((campo) => (
              <div key={campo.name}>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--gym-muted)' }}>
                  {campo.label} {campo.required && <span style={{ color: 'var(--primary)' }}>*</span>}
                </label>
                <input
                  type={campo.type}
                  name={campo.name}
                  value={form[campo.name]}
                  onChange={handleChange}
                  placeholder={campo.placeholder}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all disabled:opacity-50"
            style={{ background: 'var(--primary)', color: '#0a0a0a', fontFamily: 'var(--font-heading)' }}
          >
            {saving ? (
              'Registrando...'
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Registrar Entrenador
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
