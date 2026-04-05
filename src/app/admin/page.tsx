import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.rol !== 'ADMIN_GYM') redirect('/entrenador')

  const gymId = session.user.gymId

  // Queries reales en paralelo
  const [
    totalEntrenadores,
    totalAlumnos,
    totalRutinas,
    totalPlanes,
    entrenadores,
    actividadReciente,
    ejerciciosEsteMes,
    totalProgresos,
  ] = await Promise.all([
    // Stat cards
    prisma.user.count({ where: { gymId, rol: 'ENTRENADOR', activo: true } }),
    prisma.user.count({ where: { gymId, rol: 'ALUMNO', activo: true } }),
    prisma.rutina.count({
      where: { activa: true, alumno: { gymId } },
    }),
    prisma.planNutricional.count({
      where: { activo: true, alumno: { gymId } },
    }),

    // Entrenadores con cantidad de alumnos
    prisma.user.findMany({
      where: { gymId, rol: 'ENTRENADOR', activo: true },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        avatarUrl: true,
        updatedAt: true,
        entrenadorDe: {
          where: { activa: true },
          select: { alumnoId: true },
        },
      },
      orderBy: { nombre: 'asc' },
    }),

    // Actividad reciente: ultimos registros del gym
    getActividadReciente(gymId),

    // Ejercicios completados este mes
    prisma.ejercicioCompletado.count({
      where: {
        alumno: { gymId },
        fecha: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),

    // Total progresos este mes
    prisma.progreso.count({
      where: {
        alumno: { gymId },
        fecha: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ])

  const statCards = [
    { label: 'Entrenadores activos', value: totalEntrenadores.toString(), sub: 'En tu gym' },
    { label: 'Alumnos activos', value: totalAlumnos.toString(), sub: 'Registrados' },
    { label: 'Rutinas activas', value: totalRutinas.toString(), sub: 'En curso' },
    { label: 'Planes nutricionales', value: totalPlanes.toString(), sub: 'Activos' },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        {/* Entrenadores */}
        <div className="lg:col-span-2">
          <div
            className="rounded-2xl p-5"
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
                Entrenadores
              </h2>
              <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                {entrenadores.length} entrenadores
              </span>
            </div>

            <div className="space-y-3">
              {entrenadores.length === 0 ? (
                <p className="text-sm py-4 text-center" style={{ color: 'var(--gym-muted)' }}>
                  No hay entrenadores registrados aun.
                </p>
              ) : (
                entrenadores.map((ent) => (
                  <div
                    key={ent.id}
                    className="flex items-center gap-4 rounded-xl px-4 py-3"
                    style={{ background: 'var(--gym-surface-alt)' }}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
                      style={{
                        background: 'rgba(255,170,25,0.15)',
                        color: 'var(--primary)',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {ent.nombre[0]}{ent.apellido[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: '#ffffff' }}>
                        {ent.nombre} {ent.apellido}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--gym-muted)' }}>
                        {ent.email}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                        {ent.entrenadorDe.length}
                      </p>
                      <p className="text-[0.6rem] uppercase" style={{ color: 'var(--gym-muted)' }}>
                        alumnos
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className="text-[0.6rem]"
                        style={{ color: 'var(--gym-muted)' }}
                      >
                        {formatRelativeDate(ent.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar derecha */}
        <div className="space-y-6">
          {/* Actividad del Gym */}
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
              Actividad del Gym
            </h3>
            <div className="space-y-3">
              {actividadReciente.length === 0 ? (
                <p className="text-xs py-2" style={{ color: 'var(--gym-muted)' }}>
                  Sin actividad reciente.
                </p>
              ) : (
                actividadReciente.map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: 'var(--primary)' }}
                    >
                      {act.icon}
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

          {/* Resumen del mes */}
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
              Resumen del Mes
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                  Ejercicios completados
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}
                >
                  {ejerciciosEsteMes}
                </span>
              </div>
              <div
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>
                  Mediciones de progreso
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}
                >
                  {totalProgresos}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type ActividadItem = {
  icon: React.ReactNode
  texto: string
  tiempo: string
}

async function getActividadReciente(gymId: string): Promise<ActividadItem[]> {
  const [rutinasRecientes, alumnosRecientes, planesRecientes] = await Promise.all([
    prisma.rutina.findMany({
      where: { alumno: { gymId } },
      select: {
        nombre: true,
        createdAt: true,
        entrenador: { select: { nombre: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.user.findMany({
      where: { gymId, rol: 'ALUMNO' },
      select: { nombre: true, apellido: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.planNutricional.findMany({
      where: { alumno: { gymId } },
      select: {
        nombre: true,
        createdAt: true,
        entrenador: { select: { nombre: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ])

  const items: (ActividadItem & { date: Date })[] = []

  for (const r of rutinasRecientes) {
    items.push({
      icon: rutinaIcon,
      texto: `${r.entrenador.nombre} creo la rutina "${r.nombre}"`,
      tiempo: formatRelativeDate(r.createdAt),
      date: r.createdAt,
    })
  }

  for (const a of alumnosRecientes) {
    items.push({
      icon: alumnoIcon,
      texto: `${a.nombre} ${a.apellido} se registro`,
      tiempo: formatRelativeDate(a.createdAt),
      date: a.createdAt,
    })
  }

  for (const p of planesRecientes) {
    items.push({
      icon: planIcon,
      texto: `${p.entrenador.nombre} creo el plan "${p.nombre}"`,
      tiempo: formatRelativeDate(p.createdAt),
      date: p.createdAt,
    })
  }

  // Ordenar por fecha y tomar los 5 mas recientes
  items.sort((a, b) => b.date.getTime() - a.date.getTime())
  return items.slice(0, 5).map(({ date: _date, ...rest }) => rest)
}

const rutinaIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.4 14.4 9.6 9.6" />
    <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
    <path d="m21.5 21.5-1.4-1.4" />
    <path d="M3.9 3.9 2.5 2.5" />
    <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" />
  </svg>
)

const alumnoIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
)

const planIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46" />
    <path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z" />
    <path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.33 2-3.5S15 2 15 2z" />
  </svg>
)

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Hoy'
  if (days === 1) return 'Hace 1 dia'
  if (days < 7) return `Hace ${days} dias`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`
  return `Hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? 'es' : ''}`
}
