'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import type { RutinaAnterior } from '@/lib/queries/alumno'

type Props = {
  rutinas: RutinaAnterior[]
  alumnoId: string
  basePath: string
  reactivarAction?: (rutinaId: string, alumnoId: string) => Promise<void>
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function HistorialRutinas({ rutinas, alumnoId, basePath, reactivarAction }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [reactivandoId, setReactivandoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleReactivar(rutinaId: string) {
    if (!reactivarAction) return
    setError(null)
    setReactivandoId(rutinaId)
    startTransition(async () => {
      try {
        await reactivarAction(rutinaId, alumnoId)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al reactivar')
      } finally {
        setReactivandoId(null)
      }
    })
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--gym-surface)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header — always visible, click to toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <h3
            className="text-sm font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
          >
            Historial de Rutinas
          </h3>
          {rutinas.length > 0 && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-bold"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--gym-muted)' }}
            >
              {rutinas.length}
            </span>
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: 'var(--gym-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="px-5 pb-5 space-y-3">
          {error && (
            <p className="text-xs rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
              {error}
            </p>
          )}

          {rutinas.length === 0 ? (
            <div
              className="rounded-xl px-4 py-3"
              style={{ background: 'var(--gym-surface-alt)' }}
            >
              <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                Sin rutinas anteriores
              </p>
            </div>
          ) : (
            rutinas.map((rutina) => (
              <div
                key={rutina.id}
                className="rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                style={{ background: 'var(--gym-surface-alt)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#ffffff' }}>
                    {rutina.nombre}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                      {rutina._count.dias} {rutina._count.dias === 1 ? 'día' : 'días'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                      Vigencia: {formatDate(rutina.vigenciaDesde)}
                      {rutina.vigenciaHasta ? ` — ${formatDate(rutina.vigenciaHasta)}` : ''}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                      Creada: {formatDate(rutina.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`${basePath}/${alumnoId}/rutinas/${rutina.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.10)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    Ver detalle
                  </Link>

                  {reactivarAction && (
                    <button
                      type="button"
                      disabled={isPending && reactivandoId === rutina.id}
                      onClick={() => handleReactivar(rutina.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
                      style={{
                        background: 'var(--primary)',
                        color: '#0a0a0a',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {isPending && reactivandoId === rutina.id ? 'Activando…' : 'Reactivar'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
