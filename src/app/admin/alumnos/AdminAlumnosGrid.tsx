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
  entrenador: string | null
  esMio: boolean
}

type Filtro = 'todos' | 'activos' | 'inactivos' | 'sin-asignar'

function AlumnoCard({ alumno: al, highlight }: { alumno: Alumno; highlight?: boolean }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: 'var(--gym-surface)',
        border: highlight
          ? '1px solid rgba(255,170,25,0.25)'
          : '1px solid rgba(255,255,255,0.08)',
      }}
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

      {/* Entrenador asignado */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gym-muted)', flexShrink: 0 }}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          {al.entrenador ? (
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {al.entrenador}
            </span>
          ) : (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase"
              style={{
                background: 'rgba(251,191,36,0.12)',
                color: '#fbbf24',
              }}
            >
              Sin asignar
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{al.rutina}</p>
        <p className="text-[0.65rem]" style={{ color: 'var(--gym-muted)' }}>
          Ultima sesion: {al.ultimaSesion}
        </p>
      </div>

      {/* Ver perfil */}
      <Link
        href={`/admin/alumnos/${al.id}`}
        className="w-full flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold transition-colors"
        style={{ background: 'var(--gym-surface-alt)', color: '#ffffff' }}
      >
        Ver perfil
      </Link>
    </div>
  )
}

export default function AdminAlumnosGrid({ alumnos }: { alumnos: Alumno[] }) {
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busqueda, setBusqueda] = useState('')

  const filtrados = alumnos.filter((al) => {
    if (filtro === 'activos' && !al.activo) return false
    if (filtro === 'inactivos' && al.activo) return false
    if (filtro === 'sin-asignar' && al.entrenador) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      return (
        al.nombre.toLowerCase().includes(q) ||
        al.apellido.toLowerCase().includes(q) ||
        al.email.toLowerCase().includes(q) ||
        (al.entrenador && al.entrenador.toLowerCase().includes(q))
      )
    }
    return true
  })

  const filtros: { label: string; value: Filtro }[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Activos', value: 'activos' },
    { label: 'Inactivos', value: 'inactivos' },
    { label: 'Sin asignar', value: 'sin-asignar' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          Todos los Alumnos
        </h2>
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
          placeholder="Buscar alumno por nombre, email o entrenador..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: '#ffffff' }}
        />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
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
            {alumnos.length === 0 ? 'Sin alumnos aun' : 'Sin resultados'}
          </p>
          <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
            {alumnos.length === 0
              ? 'No hay alumnos registrados en el gym.'
              : 'Proba con otro nombre o cambia el filtro.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mis Alumnos */}
          {filtrados.some((al) => al.esMio) && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}
                >
                  Mis Alumnos
                </h3>
                <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                  {filtrados.filter((al) => al.esMio).length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtrados.filter((al) => al.esMio).map((al) => (
                  <AlumnoCard key={al.id} alumno={al} highlight />
                ))}
              </div>
            </div>
          )}

          {/* Divisor */}
          {filtrados.some((al) => al.esMio) && filtrados.some((al) => !al.esMio) && (
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--gym-muted)' }}>
                Todos los alumnos
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>
          )}

          {/* Todos los Alumnos (excluyendo los míos) */}
          {filtrados.some((al) => !al.esMio) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtrados.filter((al) => !al.esMio).map((al) => (
                <AlumnoCard key={al.id} alumno={al} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
