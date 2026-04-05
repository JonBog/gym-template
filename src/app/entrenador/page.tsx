import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EntrenadorDashboard() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const entrenadorId = session.user.id

  const [alumnosCount, rutinasCount, planesCount, asignaciones, actividadRaw] = await Promise.all([
    // Alumnos activos asignados a este entrenador
    prisma.asignacionAlumno.count({
      where: { entrenadorId, activa: true },
    }),

    // Rutinas activas creadas por este entrenador
    prisma.rutina.count({
      where: { entrenadorId, activa: true },
    }),

    // Planes nutricionales activos creados por este entrenador
    prisma.planNutricional.count({
      where: { entrenadorId, activo: true },
    }),

    // Alumnos asignados con datos para la tabla (últimos 6)
    prisma.asignacionAlumno.findMany({
      where: { entrenadorId, activa: true },
      orderBy: { asignadoEn: 'desc' },
      take: 6,
      select: {
        alumno: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            activo: true,
            rutinas: {
              where: { activa: true, entrenadorId },
              select: { nombre: true },
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
            completados: {
              select: { fecha: true },
              take: 1,
              orderBy: { fecha: 'desc' },
            },
          },
        },
      },
    }),

    // Actividad reciente: últimos 5 ejercicios completados por alumnos de este entrenador
    prisma.ejercicioCompletado.findMany({
      where: {
        alumno: {
          alumnoAsignado: {
            some: { entrenadorId, activa: true },
          },
        },
      },
      orderBy: { fecha: 'desc' },
      take: 5,
      select: {
        fecha: true,
        alumno: { select: { nombre: true, apellido: true } },
        ejercicio: {
          select: {
            nombre: true,
            rutinaDia: {
              select: {
                rutina: { select: { nombre: true } },
              },
            },
          },
        },
      },
    }),
  ])

  const statCards = [
    { label: 'Alumnos activos', value: alumnosCount.toString(), sub: 'Asignados a vos' },
    { label: 'Rutinas activas', value: rutinasCount.toString(), sub: 'Creadas por vos' },
    { label: 'Planes activos', value: planesCount.toString(), sub: 'Nutricionales' },
  ]

  const alumnos = asignaciones.map(({ alumno: al }) => ({
    id: al.id,
    nombre: al.nombre,
    apellido: al.apellido,
    activo: al.activo,
    rutina: al.rutinas[0]?.nombre ?? 'Sin rutina',
    ultimaSesion: al.completados[0]?.fecha
      ? formatRelativeDate(al.completados[0].fecha)
      : 'Sin actividad',
  }))

  const actividad = actividadRaw.map((ec) => ({
    texto: `${ec.alumno.nombre} ${ec.alumno.apellido} completó ${ec.ejercicio.nombre} en ${ec.ejercicio.rutinaDia.rutina.nombre}`,
    tiempo: formatRelativeDate(ec.fecha),
  }))

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl px-5 py-4"
            style={{
              background: 'var(--gym-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p
              className="text-xs font-medium uppercase tracking-wider mb-1"
              style={{ color: 'var(--gym-muted)' }}
            >
              {stat.label}
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}
            >
              {stat.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--gym-muted)' }}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de alumnos */}
        <div className="lg:col-span-2">
          <div
            className="rounded-2xl p-5 overflow-hidden"
            style={{
              background: 'var(--gym-surface)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
              >
                Mis Alumnos
              </h2>
              <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                {alumnos.length} alumnos
              </span>
            </div>

            {alumnos.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--gym-muted)' }}>
                No tenés alumnos asignados aún.
              </p>
            ) : (
              <div className="overflow-x-auto -mx-5">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {['Nombre', 'Rutina', 'Ultima sesion', 'Estado', ''].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-5 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider"
                            style={{ color: 'var(--gym-muted)' }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {alumnos.map((al, i) => (
                      <tr
                        key={al.id}
                        style={{
                          borderBottom:
                            i < alumnos.length - 1
                              ? '1px solid rgba(255,255,255,0.05)'
                              : 'none',
                        }}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[0.6rem] font-bold flex-shrink-0"
                              style={{
                                background: 'var(--gym-surface-alt)',
                                color: 'var(--primary)',
                                fontFamily: 'var(--font-heading)',
                              }}
                            >
                              {al.nombre[0]}{al.apellido[0]}
                            </div>
                            <span
                              className="text-sm font-medium"
                              style={{ color: '#ffffff' }}
                            >
                              {al.nombre} {al.apellido}
                            </span>
                          </div>
                        </td>
                        <td
                          className="px-5 py-3 text-sm"
                          style={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          {al.rutina}
                        </td>
                        <td
                          className="px-5 py-3 text-xs"
                          style={{ color: 'var(--gym-muted)' }}
                        >
                          {al.ultimaSesion}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase"
                            style={{
                              background: al.activo
                                ? 'rgba(34, 197, 94, 0.12)'
                                : 'rgba(255,255,255,0.06)',
                              color: al.activo ? '#22c55e' : 'var(--gym-muted)',
                            }}
                          >
                            {al.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Link
                            href={`/entrenador/alumnos/${al.id}`}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                            style={{
                              background: 'var(--gym-surface-alt)',
                              color: '#ffffff',
                            }}
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar derecha */}
        <div className="space-y-6">
          {/* Actividad reciente */}
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
            <div className="space-y-3">
              {actividad.length === 0 ? (
                <p className="text-xs py-2" style={{ color: 'var(--gym-muted)' }}>
                  Sin actividad reciente.
                </p>
              ) : (
                actividad.map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: 'var(--primary)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 11 12 14 22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.8)' }}
                      >
                        {act.texto}
                      </p>
                      <p
                        className="text-[0.6rem] mt-0.5"
                        style={{ color: 'var(--gym-muted)' }}
                      >
                        {act.tiempo}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Acciones rapidas */}
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
              Acciones Rapidas
            </h3>
            <div className="space-y-2">
              <Link
                href="/entrenador/alumnos"
                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors"
                style={{
                  background: 'var(--primary)',
                  color: '#0a0a0a',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Ver Alumnos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`
  if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`
  return `Hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? 'es' : ''}`
}
