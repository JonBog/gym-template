import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import Link from 'next/link'
import ReactivarRutinaButton from './ReactivarRutinaButton'
import { reactivarRutina } from '../../actions'

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function RutinaDetailPage({
  params,
}: {
  params: Promise<{ alumnoId: string; rutinaId: string }>
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const { alumnoId, rutinaId } = await params

  const [alumno, rutina] = await Promise.all([
    prisma.user.findUnique({
      where: { id: alumnoId },
      select: { nombre: true, apellido: true },
    }),
    prisma.rutina.findUnique({
      where: { id: rutinaId },
      include: {
        dias: {
          include: { ejercicios: { orderBy: { orden: 'asc' } } },
          orderBy: { orden: 'asc' },
        },
      },
    }),
  ])

  if (!alumno || !rutina || rutina.alumnoId !== alumnoId) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/entrenador/alumnos/${alumnoId}`}
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
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'var(--gym-surface)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
              >
                {rutina.nombre}
              </h2>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase"
                style={{
                  background: rutina.activa
                    ? 'rgba(34, 197, 94, 0.12)'
                    : 'rgba(255,255,255,0.08)',
                  color: rutina.activa ? '#22c55e' : 'var(--gym-muted)',
                }}
              >
                {rutina.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
              {alumno.nombre} {alumno.apellido}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--gym-muted)' }}>
              Vigencia: {formatDate(rutina.vigenciaDesde)}
              {rutina.vigenciaHasta ? ` — ${formatDate(rutina.vigenciaHasta)}` : ' (sin vencimiento)'}
            </p>
            {rutina.descripcion && (
              <p className="text-sm mt-2" style={{ color: 'var(--gym-muted)' }}>
                {rutina.descripcion}
              </p>
            )}
          </div>

          {/* Reactivar button — only shown if inactive */}
          {!rutina.activa && (
            <ReactivarRutinaButton
              rutinaId={rutinaId}
              alumnoId={alumnoId}
              reactivarAction={reactivarRutina}
            />
          )}
        </div>
      </div>

      {/* Days */}
      <div className="space-y-4">
        {rutina.dias.length === 0 ? (
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'var(--gym-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
              Esta rutina no tiene días configurados.
            </p>
          </div>
        ) : (
          rutina.dias.map((dia) => (
            <div
              key={dia.id}
              className="rounded-2xl p-5"
              style={{
                background: 'var(--gym-surface)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="inline-flex items-center rounded-lg px-3 py-1 text-xs font-bold uppercase"
                  style={{
                    background: 'var(--primary)',
                    color: '#0a0a0a',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {dia.dia}
                </span>
                {dia.nombre && (
                  <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                    {dia.nombre}
                  </span>
                )}
                {dia.tipo && (
                  <span
                    className="text-xs rounded-md px-2 py-0.5"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--gym-muted)' }}
                  >
                    {dia.tipo}
                  </span>
                )}
              </div>

              {dia.ejercicios.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                  Sin ejercicios
                </p>
              ) : (
                <div className="space-y-2">
                  {dia.ejercicios.map((ej, idx) => (
                    <div
                      key={ej.id}
                      className="rounded-xl px-4 py-3"
                      style={{ background: 'var(--gym-surface-alt)' }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] font-bold"
                          style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--gym-muted)' }}
                        >
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                            {ej.nombre}
                          </p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                            {ej.series != null && (
                              <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                                {ej.series} series
                              </span>
                            )}
                            {(ej.repsMin != null || ej.repsMax != null) && (
                              <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                                {ej.repsMin ?? '?'}
                                {ej.repsMax != null && ej.repsMax !== ej.repsMin
                                  ? `–${ej.repsMax}`
                                  : ''}{' '}
                                reps
                              </span>
                            )}
                            {ej.pesoKg != null && (
                              <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                                {ej.pesoKg} kg
                              </span>
                            )}
                            {ej.pesoNota && (
                              <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                                {ej.pesoNota}
                              </span>
                            )}
                            {ej.descansoSeg != null && (
                              <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                                {ej.descansoSeg}s descanso
                              </span>
                            )}
                          </div>
                          {ej.videoUrl && (
                            <a
                              href={ej.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs mt-1 transition-opacity hover:opacity-80"
                              style={{ color: 'var(--primary)' }}
                            >
                              Ver video
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
