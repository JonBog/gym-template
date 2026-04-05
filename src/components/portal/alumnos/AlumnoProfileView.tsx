import Link from 'next/link'
import { ReactNode } from 'react'
import { AlumnoData } from '@/lib/queries/alumno'

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString('es-PY', { month: 'short' })
}

const mockData = {
  rutina: {
    nombre: 'Sin rutina asignada',
    dias: 0,
    desde: '-',
    hasta: '-',
  },
  plan: {
    nombre: 'Sin plan asignado',
    kcal: 0,
    desde: '-',
    hasta: '-',
  },
}

type Props = {
  data: AlumnoData
  basePath: string
  alumnoId: string
  showCreateButtons?: boolean
  createBasePath?: string
  asignacionSlot?: ReactNode
}

export default function AlumnoProfileView({ data, basePath, alumnoId, showCreateButtons = true, createBasePath, asignacionSlot }: Props) {
  const effectiveCreateBasePath = createBasePath ?? basePath
  const { alumno, rutinaActiva, planActivo, progresos } = data

  const rutina = rutinaActiva
    ? {
        nombre: rutinaActiva.nombre,
        dias: rutinaActiva.dias.length,
        desde: formatDate(rutinaActiva.vigenciaDesde),
        hasta: rutinaActiva.vigenciaHasta
          ? formatDate(rutinaActiva.vigenciaHasta)
          : 'Sin fecha',
      }
    : mockData.rutina

  const plan = planActivo
    ? {
        nombre: planActivo.nombre,
        kcal: planActivo.kcalObjetivo ?? 0,
        desde: formatDate(planActivo.vigenciaDesde),
        hasta: planActivo.vigenciaHasta
          ? formatDate(planActivo.vigenciaHasta)
          : 'Sin fecha',
      }
    : mockData.plan

  const pesoData = progresos
    .filter((p) => p.pesoKg != null)
    .reverse()
    .map((p) => ({
      fecha: formatMonth(p.fecha),
      valor: p.pesoKg!,
    }))

  const ultimaMedicion =
    progresos.length > 0
      ? {
          peso: progresos[0].pesoKg ?? 0,
          grasa: progresos[0].grasaCorporal ?? 0,
          fecha: formatDate(progresos[0].fecha),
        }
      : null

  const maxPeso = pesoData.length > 0 ? Math.max(...pesoData.map((p) => p.valor)) : 1

  const miembroDesde = alumno.createdAt.toLocaleDateString('es-PY', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Volver */}
      <Link
        href={basePath}
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
        Volver a alumnos
      </Link>

      {/* Slot para asignacion de entrenador (solo visible desde admin) */}
      {asignacionSlot}

      {/* Header con info del alumno */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'var(--gym-surface)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar grande */}
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold flex-shrink-0"
            style={{
              background: 'var(--gym-surface-alt)',
              color: 'var(--primary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {alumno.nombre[0]}
            {alumno.apellido[0]}
          </div>

          <div className="flex-1 min-w-0">
            <h2
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
            >
              {alumno.nombre} {alumno.apellido}
            </h2>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-sm" style={{ color: 'var(--gym-muted)' }}>
                {alumno.email}
              </span>
              {alumno.telefono && (
                <span className="text-sm" style={{ color: 'var(--gym-muted)' }}>
                  {alumno.telefono}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase"
                style={{
                  background: alumno.activo
                    ? 'rgba(34, 197, 94, 0.12)'
                    : 'rgba(239, 68, 68, 0.12)',
                  color: alumno.activo ? '#22c55e' : '#ef4444',
                }}
              >
                {alumno.activo ? 'Activo' : 'Inactivo'}
              </span>
              <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                Miembro desde {miembroDesde}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rutina Actual */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'var(--gym-surface)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-sm font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
            >
              Rutina Actual
            </h3>
            {showCreateButtons && (
              <Link
                href={`${effectiveCreateBasePath}/${alumnoId}/rutinas/nueva`}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
                style={{
                  background: 'var(--primary)',
                  color: '#0a0a0a',
                  fontFamily: 'var(--font-heading)',
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
                Nueva Rutina
              </Link>
            )}
          </div>

          <div
            className="rounded-xl px-4 py-3"
            style={{ background: 'var(--gym-surface-alt)' }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--primary)' }}>
              {rutina.nombre}
            </p>
            <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
              {rutina.dias} {rutina.dias === 1 ? 'dia' : 'dias'} de entrenamiento
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--gym-muted)' }}>
              Vigencia: {rutina.desde} — {rutina.hasta}
            </p>
          </div>
        </div>

        {/* Plan Nutricional */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'var(--gym-surface)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-sm font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
            >
              Plan Nutricional
            </h3>
            {showCreateButtons && (
              <Link
                href={`${effectiveCreateBasePath}/${alumnoId}/nutricion/nuevo`}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
                style={{
                  background: 'var(--primary)',
                  color: '#0a0a0a',
                  fontFamily: 'var(--font-heading)',
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
                Nuevo Plan
              </Link>
            )}
          </div>

          <div
            className="rounded-xl px-4 py-3"
            style={{ background: 'var(--gym-surface-alt)' }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--primary)' }}>
              {plan.nombre}
            </p>
            <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
              {plan.kcal > 0 ? `${plan.kcal} kcal/dia` : 'Sin objetivo calorico'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--gym-muted)' }}>
              Vigencia: {plan.desde} — {plan.hasta}
            </p>
          </div>
        </div>

        {/* Progreso */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'var(--gym-surface)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h3
            className="text-sm font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
          >
            Progreso
          </h3>

          {pesoData.length > 0 ? (
            <>
              {/* Mini bar chart */}
              <div className="flex items-end gap-2 mb-4" style={{ height: 100 }}>
                {pesoData.map((p) => {
                  const pct = (p.valor / maxPeso) * 100
                  return (
                    <div
                      key={p.fecha}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span
                        className="text-[0.55rem] font-bold"
                        style={{ color: 'var(--gym-muted)' }}
                      >
                        {p.valor}
                      </span>
                      <div
                        className="w-full rounded-t-md transition-all"
                        style={{
                          height: `${pct * 0.7}%`,
                          minHeight: 8,
                          background: 'var(--primary)',
                          opacity: 0.8,
                        }}
                      />
                      <span
                        className="text-[0.55rem]"
                        style={{ color: 'var(--gym-muted)' }}
                      >
                        {p.fecha}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Ultima medicion */}
              {ultimaMedicion && (
                <div
                  className="rounded-xl px-4 py-3"
                  style={{ background: 'var(--gym-surface-alt)' }}
                >
                  <p className="text-xs font-bold mb-1" style={{ color: '#ffffff' }}>
                    Ultima medicion
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <span style={{ color: 'var(--primary)' }}>
                      {ultimaMedicion.peso} kg
                    </span>
                    {ultimaMedicion.grasa > 0 && (
                      <span style={{ color: 'var(--gym-muted)' }}>
                        Grasa: {ultimaMedicion.grasa}%
                      </span>
                    )}
                    <span style={{ color: 'var(--gym-muted)' }}>{ultimaMedicion.fecha}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              className="rounded-xl px-4 py-3"
              style={{ background: 'var(--gym-surface-alt)' }}
            >
              <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                Sin registros de progreso
              </p>
            </div>
          )}
        </div>

        {/* Actividad Reciente */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'var(--gym-surface)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h3
            className="text-sm font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
          >
            Actividad Reciente
          </h3>
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: 'var(--gym-surface-alt)' }}
          >
            <p className="text-xs" style={{ color: 'var(--gym-muted)' }}>
              Sin actividad reciente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
