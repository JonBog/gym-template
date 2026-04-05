'use client'

import { useTransition, useState } from 'react'
import { asignarEntrenador, desasignarEntrenador } from '@/app/admin/alumnos/[alumnoId]/actions'

type Entrenador = {
  id: string
  nombre: string
  apellido: string
}

type Props = {
  alumnoId: string
  entrenadorActual: Entrenador | null
  entrenadores: Entrenador[]
  currentUserId?: string
}

export default function AsignacionEntrenador({ alumnoId, entrenadorActual, entrenadores, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [selectedId, setSelectedId] = useState(entrenadorActual?.id ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleAsignar() {
    if (!selectedId) return
    setError(null)
    startTransition(async () => {
      try {
        await asignarEntrenador(alumnoId, selectedId)
      } catch {
        setError('No se pudo asignar el entrenador. Intentá de nuevo.')
      }
    })
  }

  function handleDesasignar() {
    setError(null)
    startTransition(async () => {
      try {
        await desasignarEntrenador(alumnoId)
        setSelectedId('')
      } catch {
        setError('No se pudo desasignar el entrenador. Intentá de nuevo.')
      }
    })
  }

  const hasChanged = selectedId !== (entrenadorActual?.id ?? '')

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'var(--gym-surface)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          Entrenador Asignado
        </h3>

        {entrenadorActual && (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}
          >
            Asignado
          </span>
        )}
        {!entrenadorActual && (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase"
            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}
          >
            Sin asignar
          </span>
        )}
      </div>

      {/* Entrenador actual */}
      {entrenadorActual && (
        <div
          className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
          style={{ background: 'var(--gym-surface-alt)' }}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
            style={{ background: 'rgba(255,170,25,0.15)', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}
          >
            {entrenadorActual.nombre[0]}{entrenadorActual.apellido[0]}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>
              {entrenadorActual.nombre} {entrenadorActual.apellido}
            </p>
            <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>Entrenador actual</p>
          </div>
        </div>
      )}

      {/* Sin entrenadores disponibles */}
      {entrenadores.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
          No hay entrenadores activos en el gym.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Select */}
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={isPending}
              className="w-full rounded-xl px-4 py-2.5 text-sm appearance-none pr-10 outline-none transition-colors disabled:opacity-50"
              style={{
                background: 'var(--gym-surface-alt)',
                color: selectedId ? '#ffffff' : 'var(--gym-muted)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <option value="">-- Seleccionar entrenador --</option>
              {entrenadores.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} {e.apellido}{e.id === currentUserId ? ' (Yo)' : ''}
                </option>
              ))}
            </select>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--gym-muted)' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAsignar}
              disabled={isPending || !selectedId || !hasChanged}
              className="flex-1 flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'var(--primary)',
                color: '#0a0a0a',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Guardando...
                </span>
              ) : (
                entrenadorActual ? 'Cambiar entrenador' : 'Asignar entrenador'
              )}
            </button>

            {entrenadorActual && (
              <button
                onClick={handleDesasignar}
                disabled={isPending}
                className="flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.2)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                Desasignar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
