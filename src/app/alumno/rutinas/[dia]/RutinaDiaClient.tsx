'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toggleEjercicioCompletado } from '../actions'

type EjercicioData = {
  id: string
  nombre: string
  descripcion: string | null
  series: number | null
  repsMin: number | null
  repsMax: number | null
  pesoKg: number | null
  pesoNota: string | null
  descansoSeg: number | null
  duracionMin: number | null
  distanciaKm: number | null
  notas: string | null
  orden: number
}

const tipoColors: Record<string, string> = {
  Fuerza: 'rgba(255, 170, 25, 0.15)',
  Funcional: 'rgba(59, 130, 246, 0.15)',
  Cardio: 'rgba(239, 68, 68, 0.15)',
}

const tipoTextColors: Record<string, string> = {
  Fuerza: 'var(--primary)',
  Funcional: '#3b82f6',
  Cardio: '#ef4444',
}

export default function RutinaDiaClient({
  dia,
  nombreDia,
  rutinaDiaNombre,
  rutinaDiaTipo,
  ejercicios,
  completadosIniciales,
}: {
  dia: string
  nombreDia: string
  rutinaDiaNombre: string
  rutinaDiaTipo: string | null
  ejercicios: EjercicioData[]
  completadosIniciales: string[]
}) {
  const [completados, setCompletados] = useState<Set<string>>(new Set(completadosIniciales))
  const [isPending, startTransition] = useTransition()

  const handleToggle = (ejercicioId: string) => {
    // Optimistic update
    setCompletados((prev) => {
      const next = new Set(prev)
      if (next.has(ejercicioId)) {
        next.delete(ejercicioId)
      } else {
        next.add(ejercicioId)
      }
      return next
    })

    startTransition(async () => {
      try {
        await toggleEjercicioCompletado(ejercicioId)
      } catch {
        // Revert optimistic update on error
        setCompletados((prev) => {
          const next = new Set(prev)
          if (next.has(ejercicioId)) {
            next.delete(ejercicioId)
          } else {
            next.add(ejercicioId)
          }
          return next
        })
      }
    })
  }

  const totalEjercicios = ejercicios.length
  const completadosCount = completados.size
  const porcentaje = totalEjercicios > 0 ? Math.round((completadosCount / totalEjercicios) * 100) : 0

  const formatDescanso = (seg: number | null) => {
    if (!seg) return null
    return seg >= 60 ? `${Math.floor(seg / 60)}min ${seg % 60 > 0 ? `${seg % 60}s` : ''}`.trim() : `${seg}s`
  }

  return (
    <div className="space-y-6">
      {/* Volver */}
      <Link
        href="/alumno/rutinas"
        className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--primary)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Volver a mis rutinas
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
          >
            {nombreDia} — {rutinaDiaNombre}
          </h2>
        </div>
        {rutinaDiaTipo && (
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase"
            style={{
              background: tipoColors[rutinaDiaTipo] ?? 'rgba(255,255,255,0.1)',
              color: tipoTextColors[rutinaDiaTipo] ?? '#ffffff',
            }}
          >
            {rutinaDiaTipo}
          </span>
        )}
      </div>

      {/* Barra de progreso */}
      <div
        className="rounded-2xl px-5 py-4"
        style={{
          background: 'var(--gym-surface)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium" style={{ color: '#ffffff' }}>
            Progreso
          </p>
          <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
            {completadosCount} de {totalEjercicios} — {porcentaje}%
          </p>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 8, background: 'var(--gym-surface-alt)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${porcentaje}%`,
              background: 'var(--primary)',
            }}
          />
        </div>
      </div>

      {/* Lista de ejercicios */}
      <div className="space-y-3">
        {ejercicios.map((ej) => {
          const done = completados.has(ej.id)
          const ordenStr = String(ej.orden + 1).padStart(2, '0')

          const pesoDisplay = ej.pesoNota ?? (ej.pesoKg ? `${ej.pesoKg}kg` : null)
          const descansoDisplay = formatDescanso(ej.descansoSeg)

          return (
            <div
              key={ej.id}
              className="rounded-2xl px-5 py-4 transition-all duration-300 cursor-pointer"
              style={{
                background: 'var(--gym-surface)',
                border: '1px solid rgba(255,255,255,0.08)',
                opacity: done ? 0.45 : 1,
              }}
              onClick={() => handleToggle(ej.id)}
            >
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: done ? 'var(--primary)' : 'transparent',
                    border: done ? 'none' : '2px solid rgba(255,255,255,0.15)',
                  }}
                >
                  {done ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <span
                      className="text-xs font-bold"
                      style={{ color: 'var(--gym-muted)' }}
                    >
                      {ordenStr}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: done ? 'var(--gym-muted)' : '#ffffff',
                      textDecoration: done ? 'line-through' : 'none',
                    }}
                  >
                    {ej.nombre}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {ej.duracionMin ? (
                      <span className="text-xs" style={{ color: 'var(--primary)' }}>
                        {ej.series ?? 1} &times; {ej.duracionMin}min
                      </span>
                    ) : ej.distanciaKm ? (
                      <span className="text-xs" style={{ color: 'var(--primary)' }}>
                        {ej.distanciaKm}km
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--primary)' }}>
                        {ej.series ?? 0} &times; {ej.repsMin ?? 0}{ej.repsMax && ej.repsMax !== ej.repsMin ? `-${ej.repsMax}` : ''}
                      </span>
                    )}
                    {pesoDisplay && (
                      <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                        {pesoDisplay}
                      </span>
                    )}
                    {descansoDisplay && (
                      <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                        Descanso: {descansoDisplay}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
