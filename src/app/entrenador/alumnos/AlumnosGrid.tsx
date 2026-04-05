'use client'

import { useState } from 'react'
import Link from 'next/link'

type Alumno = {
  id: string
  nombre: string
  apellido: string
  email: string
  activo: boolean
  rutina: string
  ultimaSesion: string
}

type Filtro = 'todos' | 'activos' | 'inactivos'

export default function AlumnosGrid({ alumnos }: { alumnos: Alumno[] }) {
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busqueda, setBusqueda] = useState('')

  const filtrados = alumnos.filter((al) => {
    if (filtro === 'activos' && !al.activo) return false
    if (filtro === 'inactivos' && al.activo) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      return (
        al.nombre.toLowerCase().includes(q) ||
        al.apellido.toLowerCase().includes(q) ||
        al.email.toLowerCase().includes(q)
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
          Mis Alumnos
        </h2>
        <Link
          href="/entrenador/alumnos/nuevo"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors"
          style={{ background: 'var(--primary)', color: '#0a0a0a', fontFamily: 'var(--font-heading)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Alumno
        </Link>
      </div>

      {/* Búsqueda */}
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
          placeholder="Buscar alumno por nombre o email..."
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
          {filtrados.length} alumno{filtrados.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      {filtrados.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--gym-surface)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-lg font-bold mb-2" style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            {alumnos.length === 0 ? 'Sin alumnos aún' : 'Sin resultados'}
          </p>
          <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
            {alumnos.length === 0
              ? 'Registrá tu primer alumno para empezar.'
              : 'Probá con otro nombre o cambiá el filtro.'}
          </p>
          {alumnos.length === 0 && (
            <Link
              href="/entrenador/alumnos/nuevo"
              className="inline-flex items-center gap-2 mt-6 rounded-xl px-5 py-2.5 text-sm font-bold"
              style={{ background: 'var(--primary)', color: '#0a0a0a', fontFamily: 'var(--font-heading)' }}
            >
              + Registrar Alumno
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map((al) => (
            <div
              key={al.id}
              className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ background: 'var(--gym-surface)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Avatar + info */}
              <div className="flex items-start gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
                  style={{ background: 'var(--gym-surface-alt)', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}
                >
                  {al.nombre[0]}{al.apellido[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate" style={{ color: '#ffffff' }}>
                    {al.nombre} {al.apellido}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--gym-muted)' }}>{al.email}</p>
                </div>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase flex-shrink-0"
                  style={{
                    background: al.activo ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    color: al.activo ? '#22c55e' : '#ef4444',
                  }}
                >
                  {al.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Rutina + última sesión */}
              <div className="space-y-1">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{al.rutina}</p>
                <p className="text-[0.65rem]" style={{ color: 'var(--gym-muted)' }}>
                  Última sesión: {al.ultimaSesion}
                </p>
              </div>

              {/* Ver perfil */}
              <Link
                href={`/entrenador/alumnos/${al.id}`}
                className="w-full flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold transition-colors"
                style={{ background: 'var(--gym-surface-alt)', color: '#ffffff' }}
              >
                Ver perfil
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
