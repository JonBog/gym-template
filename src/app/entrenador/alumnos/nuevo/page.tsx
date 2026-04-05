'use client'

import { useState } from 'react'
import Link from 'next/link'
import { crearAlumno } from './actions'

export default function NuevoAlumnoPage() {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    objetivo: '',
    password: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setSaving(true)
    try {
      await crearAlumno(form)
    } catch (err: any) {
      setSaving(false)
      setError(err.message || 'Error al registrar alumno')
    }
  }

  const campos: {
    name: keyof typeof form
    label: string
    type: string
    placeholder: string
    required?: boolean
    options?: { value: string; label: string }[]
  }[] = [
    { name: 'nombre',          label: 'Nombre',               type: 'text',     placeholder: 'Ej: Carlos', required: true },
    { name: 'apellido',        label: 'Apellido',             type: 'text',     placeholder: 'Ej: González', required: true },
    { name: 'email',           label: 'Email',                type: 'email',    placeholder: 'alumno@email.com', required: true },
    { name: 'telefono',        label: 'Teléfono',             type: 'tel',      placeholder: '+595 9XX XXX XXX' },
    { name: 'fechaNacimiento', label: 'Fecha de nacimiento',  type: 'date',     placeholder: '' },
    { name: 'objetivo',        label: 'Objetivo',             type: 'select',   placeholder: 'Seleccionar objetivo',
      options: [
        { value: 'ganancia_muscular', label: 'Ganancia muscular' },
        { value: 'perdida_peso',      label: 'Pérdida de peso' },
        { value: 'mantenimiento',     label: 'Mantenimiento' },
        { value: 'fuerza',            label: 'Fuerza' },
        { value: 'resistencia',       label: 'Resistencia' },
        { value: 'tonificacion',      label: 'Tonificación' },
      ],
    },
    { name: 'password', label: 'Contraseña temporal', type: 'password', placeholder: 'Mínimo 6 caracteres', required: true },
  ]

  const inputStyle: React.CSSProperties = {
    background: 'var(--gym-surface-alt)',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.08)',
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/entrenador/alumnos"
        className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--primary)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        Volver a alumnos
      </Link>

      <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
        Registrar Alumno
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
                {campo.type === 'select' ? (
                  <select
                    name={campo.name}
                    value={form[campo.name]}
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={inputStyle}
                  >
                    <option value="" style={{ background: 'var(--gym-surface-alt)' }}>{campo.placeholder}</option>
                    {campo.options?.map((opt) => (
                      <option key={opt.value} value={opt.value} style={{ background: 'var(--gym-surface-alt)' }}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={campo.type}
                    name={campo.name}
                    value={form[campo.name]}
                    onChange={handleChange}
                    placeholder={campo.placeholder}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={inputStyle}
                  />
                )}
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
                Registrar Alumno
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
