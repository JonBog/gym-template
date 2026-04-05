'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { actualizarGym, obtenerGym } from './actions'

type GymData = {
  id: string
  nombre: string
  ciudad: string
  pais: string
  whatsapp: string
  instagram: string
  facebook: string
}

export default function ConfiguracionPage() {
  const [form, setForm] = useState<GymData>({
    id: '',
    nombre: '',
    ciudad: '',
    pais: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const gym = await obtenerGym()
        setForm({
          id: gym.id,
          nombre: gym.nombre,
          ciudad: gym.ciudad ?? '',
          pais: gym.pais ?? '',
          whatsapp: gym.whatsapp ?? '',
          instagram: gym.instagram ?? '',
          facebook: gym.facebook ?? '',
        })
      } catch {
        setError('Error al cargar datos del gym')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      await actualizarGym(form)
      setSuccess('Datos actualizados correctamente')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const campos: {
    name: keyof Omit<GymData, 'id'>
    label: string
    type: string
    placeholder: string
  }[] = [
    { name: 'nombre',    label: 'Nombre del Gym',  type: 'text', placeholder: 'Ej: DDR Fitness Club' },
    { name: 'ciudad',    label: 'Ciudad',           type: 'text', placeholder: 'Ej: Caaguazu' },
    { name: 'pais',      label: 'Pais',             type: 'text', placeholder: 'Ej: Paraguay' },
    { name: 'whatsapp',  label: 'WhatsApp',         type: 'tel',  placeholder: 'Ej: 595XXXXXXXXX' },
    { name: 'instagram', label: 'Instagram',        type: 'text', placeholder: 'Ej: ddrfitnessclub_' },
    { name: 'facebook',  label: 'Facebook',         type: 'text', placeholder: 'Ej: DDR-Fitness-Club' },
  ]

  const inputStyle: React.CSSProperties = {
    background: 'var(--gym-surface-alt)',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.08)',
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
          Configuracion
        </h2>
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--gym-surface)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
        Configuracion
      </h2>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          {success}
        </div>
      )}

      {/* Datos del Gym */}
      <form onSubmit={handleSubmit}>
        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--gym-surface)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h3
            className="text-sm font-bold mb-5"
            style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
          >
            Datos del Gym
          </h3>

          <div className="space-y-5">
            {campos.map((campo) => (
              <div key={campo.name}>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--gym-muted)' }}>
                  {campo.label}
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
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>

      {/* Card informativa */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--gym-surface)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h3
          className="text-sm font-bold mb-3"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          Personalizacion
        </h3>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--gym-muted)' }}>
          Para cambiar colores, logo, tipografia y contenido de la landing page,
          edita el archivo{' '}
          <code
            className="rounded px-1.5 py-0.5 text-[0.65rem] font-mono"
            style={{ background: 'var(--gym-surface-alt)', color: 'var(--primary)' }}
          >
            gym.config.ts
          </code>{' '}
          en la raiz del proyecto. Estos cambios requieren un nuevo deploy para aplicarse.
        </p>
      </div>
    </div>
  )
}
