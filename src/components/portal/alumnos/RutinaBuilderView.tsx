'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'

type EjercicioForm = {
  id: string
  nombre: string
  series: string
  repsMin: string
  repsMax: string
  pesoNota: string
  descansoSeg: string
  videoUrl: string
}

type DiaForm = {
  activo: boolean
  nombre: string
  tipo: string
  ejercicios: EjercicioForm[]
}

export type EjercicioInput = {
  nombre: string
  series: number | null
  repsMin: number | null
  repsMax: number | null
  pesoKg: number | null
  pesoNota: string
  descansoSeg: number | null
  videoUrl: string
  orden: number
}

export type DiaInput = {
  dia: string
  nombre: string
  tipo: string
  ejercicios: EjercicioInput[]
}

export type RutinaInput = {
  alumnoId: string
  nombre: string
  descripcion: string
  vigenciaDesde: string
  vigenciaHasta: string
  dias: DiaInput[]
  redirectTo?: string
}

type Props = {
  alumnoId: string
  alumnoNombre: string
  basePath: string
  crearRutinaAction: (input: RutinaInput) => Promise<void>
}

const DIAS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'] as const
const DIAS_FULL = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]
const TIPOS = ['Fuerza', 'Cardio', 'Funcional', 'Mixto']
const DIAS_ENUM = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
] as const

function crearEjercicio(): EjercicioForm {
  return {
    id: crypto.randomUUID(),
    nombre: '',
    series: '',
    repsMin: '',
    repsMax: '',
    pesoNota: '',
    descansoSeg: '',
    videoUrl: '',
  }
}

function crearDiaInicial(): DiaForm {
  return {
    activo: false,
    nombre: '',
    tipo: 'Fuerza',
    ejercicios: [],
  }
}

const inputStyle = {
  background: 'var(--gym-surface-alt)',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.08)',
}

export function RutinaBuilderView({
  alumnoId,
  alumnoNombre,
  basePath,
  crearRutinaAction,
}: Props) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [vigenciaDesde, setVigenciaDesde] = useState('')
  const [vigenciaHasta, setVigenciaHasta] = useState('')
  const [dias, setDias] = useState<DiaForm[]>(
    Array.from({ length: 7 }, () => crearDiaInicial()),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleGuardar = () => {
    setError('')

    const diasActivos = dias
      .map((dia, idx) => ({ ...dia, idx }))
      .filter((d) => d.activo)

    if (diasActivos.length === 0) {
      setError('Debés activar al menos 1 día de entrenamiento')
      return
    }

    for (const d of diasActivos) {
      if (d.ejercicios.length === 0) {
        setError(`${DIAS_FULL[d.idx]} no tiene ejercicios`)
        return
      }
      for (const ej of d.ejercicios) {
        if (!ej.nombre.trim()) {
          setError(`Hay ejercicios sin nombre en ${DIAS_FULL[d.idx]}`)
          return
        }
      }
    }

    setSaving(true)
    startTransition(async () => {
      try {
        await crearRutinaAction({
          alumnoId,
          nombre,
          descripcion,
          vigenciaDesde,
          vigenciaHasta,
          dias: diasActivos.map((d) => ({
            dia: DIAS_ENUM[d.idx],
            nombre: d.nombre,
            tipo: d.tipo,
            ejercicios: d.ejercicios.map((ej, ejIdx) => ({
              nombre: ej.nombre,
              series: ej.series ? parseInt(ej.series) : null,
              repsMin: ej.repsMin ? parseInt(ej.repsMin) : null,
              repsMax: ej.repsMax ? parseInt(ej.repsMax) : null,
              pesoKg: null,
              pesoNota: ej.pesoNota,
              descansoSeg: ej.descansoSeg ? parseInt(ej.descansoSeg) : null,
              videoUrl: ej.videoUrl,
              orden: ejIdx,
            })),
          })),
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al guardar la rutina')
        setSaving(false)
      }
    })
  }

  const toggleDia = (idx: number) => {
    setDias((prev) => {
      const next = [...prev]
      const dia = { ...next[idx] }
      dia.activo = !dia.activo
      if (dia.activo && dia.ejercicios.length === 0) {
        dia.ejercicios = [crearEjercicio()]
      }
      next[idx] = dia
      return next
    })
  }

  const updateDia = (idx: number, field: keyof DiaForm, value: string) => {
    setDias((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const addEjercicio = (diaIdx: number) => {
    setDias((prev) => {
      const next = [...prev]
      const dia = { ...next[diaIdx] }
      dia.ejercicios = [...dia.ejercicios, crearEjercicio()]
      next[diaIdx] = dia
      return next
    })
  }

  const removeEjercicio = (diaIdx: number, ejId: string) => {
    setDias((prev) => {
      const next = [...prev]
      const dia = { ...next[diaIdx] }
      dia.ejercicios = dia.ejercicios.filter((e) => e.id !== ejId)
      next[diaIdx] = dia
      return next
    })
  }

  const updateEjercicio = (
    diaIdx: number,
    ejId: string,
    field: keyof EjercicioForm,
    value: string,
  ) => {
    setDias((prev) => {
      const next = [...prev]
      const dia = { ...next[diaIdx] }
      dia.ejercicios = dia.ejercicios.map((e) =>
        e.id === ejId ? { ...e, [field]: value } : e,
      )
      next[diaIdx] = dia
      return next
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Volver */}
      <Link
        href={`${basePath}/${alumnoId}`}
        className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--primary)' }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Volver al perfil
      </Link>

      {/* Header */}
      <h2
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
      >
        Nueva Rutina para{' '}
        <span style={{ color: 'var(--primary)' }}>{alumnoNombre}</span>
      </h2>

      {/* Campos básicos */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'var(--gym-surface)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--gym-muted)' }}
            >
              Nombre de la rutina
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Semana 12 — Volumen"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--gym-muted)' }}
            >
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción de la rutina..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--gym-muted)' }}
            >
              Vigencia desde
            </label>
            <input
              type="date"
              value={vigenciaDesde}
              onChange={(e) => setVigenciaDesde(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--gym-muted)' }}
            >
              Vigencia hasta
            </label>
            <input
              type="date"
              value={vigenciaHasta}
              onChange={(e) => setVigenciaHasta(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Day pills */}
      <div>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: 'var(--gym-muted)' }}
        >
          Días de entrenamiento
        </p>
        <div className="flex flex-wrap gap-2">
          {DIAS.map((d, i) => (
            <button
              key={d}
              onClick={() => toggleDia(i)}
              className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
              style={{
                background: dias[i].activo
                  ? 'rgba(255, 170, 25, 0.15)'
                  : 'var(--gym-surface)',
                color: dias[i].activo ? 'var(--primary)' : 'var(--gym-muted)',
                border: dias[i].activo
                  ? '1px solid var(--primary)'
                  : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Builder por día */}
      {dias.map((dia, diaIdx) => {
        if (!dia.activo) return null

        return (
          <div
            key={diaIdx}
            className="rounded-2xl p-5"
            style={{
              background: 'var(--gym-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h3
              className="text-base font-bold mb-4"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--primary)',
              }}
            >
              {DIAS_FULL[diaIdx]}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--gym-muted)' }}
                >
                  Nombre del día
                </label>
                <input
                  type="text"
                  value={dia.nombre}
                  onChange={(e) => updateDia(diaIdx, 'nombre', e.target.value)}
                  placeholder="Ej: Lower Body"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--gym-muted)' }}
                >
                  Tipo
                </label>
                <select
                  value={dia.tipo}
                  onChange={(e) => updateDia(diaIdx, 'tipo', e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={inputStyle}
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ejercicios */}
            <div className="space-y-3">
              {dia.ejercicios.map((ej, ejIdx) => (
                <div
                  key={ej.id}
                  className="rounded-xl px-4 py-4"
                  style={{ background: 'var(--gym-surface-alt)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs font-bold"
                      style={{ color: 'var(--primary)' }}
                    >
                      Ejercicio {ejIdx + 1}
                    </span>
                    <button
                      onClick={() => removeEjercicio(diaIdx, ej.id)}
                      className="flex items-center justify-center w-6 h-6 rounded-md transition-colors"
                      style={{
                        background: 'rgba(239, 68, 68, 0.12)',
                        color: '#ef4444',
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="col-span-2 sm:col-span-3">
                      <input
                        type="text"
                        value={ej.nombre}
                        onChange={(e) =>
                          updateEjercicio(diaIdx, ej.id, 'nombre', e.target.value)
                        }
                        placeholder="Nombre del ejercicio"
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{
                          background: 'var(--gym-surface)',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-[0.6rem] uppercase tracking-wider mb-1"
                        style={{ color: 'var(--gym-muted)' }}
                      >
                        Series
                      </label>
                      <input
                        type="number"
                        value={ej.series}
                        onChange={(e) =>
                          updateEjercicio(diaIdx, ej.id, 'series', e.target.value)
                        }
                        placeholder="4"
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{
                          background: 'var(--gym-surface)',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-[0.6rem] uppercase tracking-wider mb-1"
                        style={{ color: 'var(--gym-muted)' }}
                      >
                        Reps mín
                      </label>
                      <input
                        type="number"
                        value={ej.repsMin}
                        onChange={(e) =>
                          updateEjercicio(diaIdx, ej.id, 'repsMin', e.target.value)
                        }
                        placeholder="8"
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{
                          background: 'var(--gym-surface)',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-[0.6rem] uppercase tracking-wider mb-1"
                        style={{ color: 'var(--gym-muted)' }}
                      >
                        Reps máx
                      </label>
                      <input
                        type="number"
                        value={ej.repsMax}
                        onChange={(e) =>
                          updateEjercicio(diaIdx, ej.id, 'repsMax', e.target.value)
                        }
                        placeholder="12"
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{
                          background: 'var(--gym-surface)',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-[0.6rem] uppercase tracking-wider mb-1"
                        style={{ color: 'var(--gym-muted)' }}
                      >
                        Peso / Nota
                      </label>
                      <input
                        type="text"
                        value={ej.pesoNota}
                        onChange={(e) =>
                          updateEjercicio(diaIdx, ej.id, 'pesoNota', e.target.value)
                        }
                        placeholder="60kg"
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{
                          background: 'var(--gym-surface)',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-[0.6rem] uppercase tracking-wider mb-1"
                        style={{ color: 'var(--gym-muted)' }}
                      >
                        Descanso (seg)
                      </label>
                      <input
                        type="number"
                        value={ej.descansoSeg}
                        onChange={(e) =>
                          updateEjercicio(
                            diaIdx,
                            ej.id,
                            'descansoSeg',
                            e.target.value,
                          )
                        }
                        placeholder="90"
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{
                          background: 'var(--gym-surface)',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-[0.6rem] uppercase tracking-wider mb-1"
                        style={{ color: 'var(--gym-muted)' }}
                      >
                        Video URL
                      </label>
                      <input
                        type="url"
                        value={ej.videoUrl}
                        onChange={(e) =>
                          updateEjercicio(diaIdx, ej.id, 'videoUrl', e.target.value)
                        }
                        placeholder="https://..."
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{
                          background: 'var(--gym-surface)',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add ejercicio */}
            <button
              onClick={() => addEjercicio(diaIdx)}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors"
              style={{
                background: 'transparent',
                color: 'var(--primary)',
                border: '1px solid var(--primary)',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Agregar ejercicio
            </button>
          </div>
        )
      })}

      {/* Error */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* Guardar */}
      <button
        onClick={handleGuardar}
        disabled={saving || isPending}
        className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors"
        style={{
          background: 'var(--primary)',
          color: '#0a0a0a',
          fontFamily: 'var(--font-heading)',
          opacity: saving || isPending ? 0.6 : 1,
          cursor: saving || isPending ? 'not-allowed' : 'pointer',
        }}
      >
        {saving || isPending ? 'Guardando...' : 'Guardar Rutina'}
      </button>
    </div>
  )
}
