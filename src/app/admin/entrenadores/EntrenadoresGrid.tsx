'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toggleEntrenadorActivo } from './actions'

type Entrenador = {
  id: string
  nombre: string
  apellido: string
  email: string
  avatarUrl: string | null
  activo: boolean
  totalAlumnos: number
  createdAt: string
}

type Filtro = 'todos' | 'activos' | 'inactivos'

export default function EntrenadoresGrid({ entrenadores }: { entrenadores: Entrenador[] }) {
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [pending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)

  function handleToggle(id: string) {
    setPendingId(id)
    startTransition(async () => {
      await toggleEntrenadorActivo(id)
      setPendingId(null)
    })
  }

  const filtrados = entrenadores.filter((ent) => {
    if (filtro === 'activos' && !ent.activo) return false
    if (filtro === 'inactivos' && ent.activo) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      return (
        ent.nombre.toLowerCase().includes(q) ||
        ent.apellido.toLowerCase().includes(q) ||
        ent.email.toLowerCase().includes(q)
      )
    }
    return true
  })

  const filtros: { label: string; value: Filtro }[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Activos', value: 'activos' },
    { label: 'Inactivos', value: 'inactivos' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          Entrenadores
        </h2>
        <Link
          href="/admin/entrenadores/nuevo"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors"
          style={{ background: 'var(--primary)', color: '#0a0a0a', fontFamily: 'var(--font-heading)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Entrenador
        </Link>
      </div>

      {/* Busqueda */}
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3"
        style={{ background: 'var(--gym-surface)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gym-muted)', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Buscar entrenador por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: '#ffffff' }}
        />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2">
        {filtros.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors"
            style={{
              background: filtro === f.value ? 'rgba(255,170,25,0.15)' : 'var(--gym-surface)',
              color: filtro === f.value ? 'var(--primary)' : 'var(--gym-muted)',
              border: filtro === f.value ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {f.label}
          </button>
        ))}
        <span className="text-xs ml-2" style={{ color: 'var(--gym-muted)' }}>
          {filtrados.length} entrenador{filtrados.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Grid */}
      {filtrados.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--gym-surface)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-lg font-bold mb-2" style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            {entrenadores.length === 0 ? 'Sin entrenadores aun' : 'Sin resultados'}
          </p>
          <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
            {entrenadores.length === 0
              ? 'Registra tu primer entrenador para empezar.'
              : 'Proba con otro nombre o cambia el filtro.'}
          </p>
          {entrenadores.length === 0 && (
            <Link
              href="/admin/entrenadores/nuevo"
              className="inline-flex items-center gap-2 mt-6 rounded-xl px-5 py-2.5 text-sm font-bold"
              style={{ background: 'var(--primary)', color: '#0a0a0a', fontFamily: 'var(--font-heading)' }}
            >
              + Registrar Entrenador
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map((ent) => (
            <div
              key={ent.id}
              className="rounded-2xl p-5 flex flex-col gap-4 transition-opacity"
              style={{
                background: 'var(--gym-surface)',
                border: '1px solid rgba(255,255,255,0.08)',
                opacity: ent.activo ? 1 : 0.55,
              }}
            >
              {/* Avatar + info */}
              <div className="flex items-start gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
                  style={{
                    background: ent.activo ? 'rgba(255,170,25,0.15)' : 'rgba(255,255,255,0.06)',
                    color: ent.activo ? 'var(--primary)' : 'var(--gym-muted)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {ent.nombre[0]}{ent.apellido[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate" style={{ color: '#ffffff' }}>
                    {ent.nombre} {ent.apellido}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--gym-muted)' }}>{ent.email}</p>
                </div>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase flex-shrink-0"
                  style={{
                    background: ent.activo ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    color: ent.activo ? '#22c55e' : '#ef4444',
                  }}
                >
                  {ent.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Badge + alumnos */}
              <div className="space-y-2">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase"
                  style={{
                    background: 'rgba(255, 170, 25, 0.12)',
                    color: 'var(--primary)',
                  }}
                >
                  Entrenador
                </span>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {ent.totalAlumnos} alumno{ent.totalAlumnos !== 1 ? 's' : ''} asignado{ent.totalAlumnos !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Activar / Desactivar */}
              <button
                onClick={() => handleToggle(ent.id)}
                disabled={pending && pendingId === ent.id}
                className="w-full flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold transition-colors disabled:cursor-not-allowed"
                style={{
                  background: ent.activo ? 'rgba(239,68,68,0.10)' : 'rgba(34,197,94,0.12)',
                  color: ent.activo ? '#ef4444' : '#22c55e',
                  opacity: pending && pendingId === ent.id ? 0.6 : 1,
                }}
              >
                {pending && pendingId === ent.id
                  ? (ent.activo ? 'Desactivando...' : 'Activando...')
                  : (ent.activo ? 'Desactivar' : 'Activar')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
